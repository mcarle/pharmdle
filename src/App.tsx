import React, { useState } from 'react';
import Pharmdle from './Pharmdle';
import InfoModal from './components/InfoModal';

function App() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div>
      <div className="header">
        <span>Pharmdle</span>
        <button className="header-info-btn" onClick={() => setInfoOpen(true)}>
          ?
        </button>
      </div>
      <Pharmdle numRows={6} />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}

export default App;
