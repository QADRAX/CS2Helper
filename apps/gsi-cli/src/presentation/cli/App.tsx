import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { Dashboard } from './Dashboard';
import { Prompt } from './Prompt';
import type { CliState } from '../../domain/cli/index';
import type { CliConfig } from '../../domain/cli/config';
import type { CliApp } from '../../infrastructure/cli/CliAppService';

export interface AppProps {
  cliApp: CliApp;
}

export function App({ cliApp }: AppProps) {
  const [cliState, setCliState] = useState<CliState>({ status: 'IDLE' });
  const [cliConfig, setCliConfig] = useState<CliConfig>({});

  useEffect(() => {
    // Load initial config
    cliApp.getConfig().then(setCliConfig);
  }, [cliApp]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (cliState.status === 'LISTENING') {
      // Setup subscription
      unsubscribe = cliApp.subscribeGatewayState((newState) => {
        setCliState(prev => ({ ...prev, gsiState: newState }));
      });
      
      // Update initial state
      setCliState(prev => ({ ...prev, gsiState: cliApp.getGatewayState() }));
    } else {
      // Clear state if not listening
      setCliState(prev => ({ ...prev, gsiState: null }));
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [cliApp, cliState.status]);

  const handleCommand = async (cmd: string) => {
    const parts = cmd.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return;

    const action = parts[0]?.toLowerCase();

    switch (action) {
      case 'start':
        try {
          const info = await cliApp.startGateway();
          setCliState(prev => ({ ...prev, status: 'LISTENING', port: info.port, errorMessage: undefined }));
        } catch (e: any) {
          setCliState(prev => ({ ...prev, status: 'ERROR', errorMessage: e.message }));
        }
        break;
      case 'pause':
      case 'stop':
        await cliApp.stopGateway();
        setCliState(prev => ({ ...prev, status: 'IDLE' }));
        break;
      case 'config': {
        const subCmd = parts[1]?.toLowerCase();
        if (subCmd === 'set') {
          const key = parts[2];
          const val = parts[3];
          if (!key || !val) {
             setCliState(prev => ({ ...prev, errorMessage: 'Usage: config set <port> <value>' }));
             break;
          }
          try {
             let newPartialConfig: Partial<CliConfig> = {};
             if (key === 'port') newPartialConfig.port = parseInt(val, 10);
             else {
               setCliState(prev => ({ ...prev, errorMessage: `Unknown config key: ${key}` }));
               break;
             }
             const updated = await cliApp.saveConfig(newPartialConfig);
             setCliConfig(updated);
             setCliState(prev => ({ ...prev, errorMessage: undefined }));
          } catch (e: any) {
             setCliState(prev => ({ ...prev, errorMessage: e.message }));
          }
        }
        break;
      }
      case 'record': {
        const subCmd = parts[1]?.toLowerCase();
        if (subCmd === 'start') {
          const filename = parts[2];
          if (!filename) {
            setCliState(prev => ({ ...prev, errorMessage: 'Usage: record start <filename>' }));
            break;
          }
          try {
            await cliApp.startRecording(filename);
            setCliState(prev => ({ ...prev, recordingPath: filename, errorMessage: undefined }));
          } catch (e: any) {
            setCliState(prev => ({ ...prev, errorMessage: e.message }));
          }
        } else if (subCmd === 'stop') {
          await cliApp.stopRecording();
          setCliState(prev => ({ ...prev, recordingPath: undefined }));
        }
        break;
      }
      case 'exit':
      case 'quit':
        await cliApp.stopRecording();
        await cliApp.stopGateway();
        process.exit(0);
        break;
      default:
        if (cmd) {
            setCliState(prev => ({ ...prev, errorMessage: `Unknown command: ${cmd}` }));
        }
        break;
    }
  };

  return (
    <Box flexDirection="column" width="100%">
      <Box borderStyle="single" padding={1} flexDirection="column">
        <Box justifyContent="space-between">
          <Text bold color="green">CS2 GSI Gateway CLI</Text>
          {cliState.recordingPath && (
            <Text color="red" bold> ● RECORDING: {cliState.recordingPath}</Text>
          )}
        </Box>
        <Text>Status: {cliState.status} {cliState.port ? `(Port: ${cliState.port})` : ''}</Text>
        <Text color="gray">
          Config: Port={cliConfig.port || 'unset'}
        </Text>
        {cliState.errorMessage && <Text color="red">Error: {cliState.errorMessage}</Text>}
      </Box>
      <Box paddingY={1}>
        <Dashboard gsiState={cliState.gsiState} />
      </Box>
      <Prompt onCommand={handleCommand} />
    </Box>
  );
}
