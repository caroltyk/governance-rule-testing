import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="app">
      <header className="header">
        <h1>Governance Rule Demo</h1>
        <p>Manage rulesets and evaluate API compliance</p>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
