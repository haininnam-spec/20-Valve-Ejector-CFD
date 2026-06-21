import React from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <header className="app-header glass-panel">
      <div className="header-content">
        <div className="header-avatar">
          <Image src="/gasdoong.png" alt="Gasdoong-i Logo" fill className="avatar-img" />
        </div>
        <div className="header-text">
          <h1>20&quot; Valve Ejector CFD</h1>
          <p>Ver 4.0 Web (Suction 1m Loss)</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
