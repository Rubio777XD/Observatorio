import React, { useEffect } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    // Redirigir al archivo HTML
    window.location.href = '/mapa-simple.html';
  }, []);

  return (
    <div>
      <p>Redirigiendo...</p>
    </div>
  );
}

export default App;
