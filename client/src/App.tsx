import React from 'react';
import { pause, play } from "./api";
import './App.css';
import 'nes.css/css/nes.css';

const App = () => {
  return (
    <div className="App">
      <div className="nes-container is-centered">
        <div>
          <button onClick={play} type="button" className="nes-btn is-primary">Play</button>
          <button onClick={pause} type="button" className="nes-btn">Pause</button>
          <button type="button" className="nes-btn is-disabled">Logout</button>
        </div>
      </div>
    </div>
  );
};
export default App;
