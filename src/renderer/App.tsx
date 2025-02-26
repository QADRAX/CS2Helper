import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import GameState from './components/GameState';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameState />} />
      </Routes>
    </Router>
  );
}
