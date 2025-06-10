import React, { useState } from 'react';
import Layout from './components/Layout.jsx';
import TabNavigation from './components/TabNavigation.jsx';
import RulesetList from './components/RulesetList.jsx';
import RuleEvaluation from './components/RuleEvaluation.jsx';
import Settings from './components/Settings.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('rulesets');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rulesets':
        return <RulesetList />;
      case 'evaluation':
        return <RuleEvaluation />;
      case 'settings':
        return <Settings />;
      default:
        return <RulesetList />;
    }
  };

  return (
    <Layout>
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <ErrorBoundary>
        {renderTabContent()}
      </ErrorBoundary>
    </Layout>
  );
}

export default App;
