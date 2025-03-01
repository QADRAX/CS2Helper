import { gameState } from './state/gameState';
import { createHTTPServer, HttpServer } from './httpServer';
import { GameState } from '../types/CSGO';

export function createGameStateListener(
  port: number = 5000,
  host: string = '127.0.0.1',
  timeoutMs: number = 40000,
): HttpServer {
  let timeout: NodeJS.Timeout | null = null;

  const resetTimeout = () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      gameState.update(() => null);
    }, timeoutMs);
  }

  return createHTTPServer(
    (body, _req, res) => {
      try {
        const nextState: GameState = JSON.parse(body);

        gameState.update(() => nextState);

        resetTimeout(); // Reiniciar el timeout al recibir un nuevo estado
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
      } catch (error) {
        console.error('Invalid JSON received:', error);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON');
      }
    },
    port,
    host,
  );
}

