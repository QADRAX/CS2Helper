import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import GameState from './components/GameState';
import { AppContextProvider } from './context/Context';

export default function App() {
  return (
    <AppContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<GameState />} />
        </Routes>
      </Router>
    </AppContextProvider>
  );
}
