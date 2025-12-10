import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import Home from './components/Home';
import VideoCall from './components/VideoCall';

function App() {
  const socket = useSocket();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home socket={socket} />} />
        <Route path="/room/:roomId" element={<VideoCall socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;
