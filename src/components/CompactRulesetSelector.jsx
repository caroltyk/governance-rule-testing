import React, { useState } from 'react';
import { useRulesets } from '../hooks/useRulesets.js';

const CompactRulesetSelector = ({ selectedRuleset, onRulesetChange, isCollapsed }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { data: rulesetsData, isLoading } = useRulesets();
  
  const rulesets = rulesetsData?.rulesets || [];
  const activeRulesets = rulesets.filter(ruleset => {
    return ruleset.active === true || 
           ruleset.active === 'true' || 
           ruleset.active === 'Active' ||
           ruleset.active === 'active' ||
           (typeof ruleset.active === 'string' && ruleset.active.toLowerCase() === 'active') ||
           (ruleset.status && (ruleset.status === 'active' || ruleset.status === 'Active'));
  });

  const selectedRulesetData = rulesets.find(r => r.id === selectedRuleset);

  const handleRulesetChange = (e) => {
    onRulesetChange(e);
    setShowDetails(false);
  };

  if (isLoading) {
    return (
      <div className="compact-selector">
        <div className="loading-compact">
          <div className="spinner-small"></div>
          {!isCollapsed && 'Loading...'}
        </div>
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div className="compact-selector collapsed">
        <div 
          className={`ruleset-indicator ${selectedRuleset ? 'selected' : 'none'}`}
          title={selectedRulesetData ? selectedRulesetData.name : 'No ruleset selected'}
        >
          {selectedRuleset ? '📋' : '❌'}
        </div>
      </div>
    );
  }

  return (
    <div className="compact-selector">
      {activeRulesets.length === 0 ? (
        <div className="error-compact">
          No active rulesets found
        </div>
      ) : (
        <>
          <select
            value={selectedRuleset}
            onChange={handleRulesetChange}
            className="form-select compact"
          >
            <option value="">Choose ruleset...</option>
            {activeRulesets.map((ruleset, index) => (
              <option key={ruleset.id || index} value={ruleset.id}>
                {ruleset.name || 'Unnamed'} ({ruleset.rules?.length || 0})
              </option>
            ))}
          </select>

          {selectedRulesetData && (
            <div className="ruleset-summary">
              <div className="ruleset-name">{selectedRulesetData.name}</div>
              <div className="ruleset-meta">
                {selectedRulesetData.rules?.length || 0} rules
              </div>
              {selectedRulesetData.description && (
                <button
                  className="btn-link details-toggle"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide' : 'Show'} details
                </button>
              )}
              
              {showDetails && selectedRulesetData.description && (
                <div className="ruleset-details">
                  <p>{selectedRulesetData.description}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompactRulesetSelector;
