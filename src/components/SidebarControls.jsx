import React, { useState } from 'react';
import CompactRulesetSelector from './CompactRulesetSelector.jsx';
import CompactAPISelector from './CompactAPISelector.jsx';

const SidebarControls = ({
  selectedRuleset,
  selectedAPIs,
  onRulesetChange,
  onAPISelectionChange,
  onRunEvaluation,
  canRunEvaluation,
  isLoading,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <div className={`sidebar-controls ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Collapse Toggle */}
      <div className="sidebar-header">
        <button 
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Controls' : 'Collapse Controls'}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
        {!isCollapsed && <h3>Controls</h3>}
      </div>

      {/* Ruleset Selection */}
      <div className="sidebar-section">
        {!isCollapsed && <h4>Ruleset</h4>}
        <CompactRulesetSelector
          selectedRuleset={selectedRuleset}
          onRulesetChange={onRulesetChange}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* API Selection */}
      <div className="sidebar-section">
        {!isCollapsed && <h4>APIs</h4>}
        <CompactAPISelector
          selectedAPIs={selectedAPIs}
          onSelectionChange={onAPISelectionChange}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Run Evaluation */}
      <div className="sidebar-section">
        <div className="run-evaluation-section">
          {!isCollapsed && (
            <div className="evaluation-status">
              <p className="status-text">
                {selectedRuleset ? '✓ Ruleset' : '✗ No ruleset'} • {selectedAPIs.length} APIs
              </p>
            </div>
          )}
          <button
            className={`btn btn-success ${isCollapsed ? 'btn-icon' : 'btn-full'}`}
            onClick={onRunEvaluation}
            disabled={!canRunEvaluation || isLoading}
            title={isCollapsed ? 'Run Evaluation' : ''}
          >
            {isLoading ? (
              isCollapsed ? '⟳' : 'Running...'
            ) : (
              isCollapsed ? '▶' : 'Run Evaluation'
            )}
          </button>
          
          {!canRunEvaluation && !isCollapsed && (
            <div className="evaluation-warning">
              <p>Select a ruleset and APIs to run evaluation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarControls;
