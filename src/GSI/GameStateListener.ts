import http from 'http';
import { CSState } from '../types/CSState';
import { createObservable, Observable } from './Observable';
import { gameStateLogger } from './observers/GameStateLogger';

export type GameStateListener = Observable<CSState | null> & {
  listen: () => void;
  close: () => void;
};

export function createGameStateListener(
  port: number = 5000,
  host: string = '127.0.0.1',
  timeoutMs: number = 40000,
): GameStateListener {
  const observable = createObservable<CSState | null>();

  let timeout: NodeJS.Timeout | null = null;

  const resetTimeout = () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      observable.notify(null);
    }, timeoutMs);
  }

  const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        try {
          const gameState: CSState = JSON.parse(body);
          observable.notify(gameState);
          resetTimeout(); // Reiniciar el timeout al recibir un nuevo estado
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('OK');
        } catch (error) {
          console.error('Invalid JSON received:', error);
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid JSON');
        }
      });
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('GSI Listener running...');
    }
  });

  return {
    ...observable,

    listen() {
      server.listen(port, host, () => {
        console.log(`GSI Listener running at http://${host}:${port}`);
      });
      resetTimeout(); // Iniciar el timeout cuando el servidor comienza a escuchar
    },

    close() {
      if (timeout) clearTimeout(timeout);
      server.close(() => {
        console.log('GSI Listener closed.');
      });
    },
  };
}

export function initializeGameStateListener(): GameStateListener {
  const csgoListener = createGameStateListener();

  csgoListener.subscribe(gameStateLogger);

  return csgoListener;
};
