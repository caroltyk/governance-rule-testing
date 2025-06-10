import React, { useState, useEffect } from 'react';
import { useRulesets, useEvaluateRuleset } from '../hooks/useRulesets.js';
import { useAPIs } from '../hooks/useAPIs.js';
import SidebarControls from './SidebarControls.jsx';
import FullHeightResults from './FullHeightResults.jsx';
import APISpecPanel from './APISpecPanel.jsx';
import ResizeHandle from './ResizeHandle.jsx';

const RuleEvaluation = () => {
  const [selectedRuleset, setSelectedRuleset] = useState('');
  const [selectedAPIs, setSelectedAPIs] = useState([]);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [evaluatedAPIs, setEvaluatedAPIs] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedAPIId, setSelectedAPIId] = useState(null);
  const [specPanelCollapsed, setSpecPanelCollapsed] = useState(true);
  const [highlightedPath, setHighlightedPath] = useState(null);

  const { data: rulesetsData, isLoading: rulesetsLoading } = useRulesets();
  const { data: apisData } = useAPIs();
  const evaluateMutation = useEvaluateRuleset();

  const rulesets = rulesetsData?.rulesets || [];
  
  // Filter active rulesets
  const activeRulesets = rulesets.filter(ruleset => {
    // Check for various representations of "active" status
    return ruleset.active === true || 
           ruleset.active === 'true' || 
           ruleset.active === 'Active' ||
           ruleset.active === 'active' ||
           (typeof ruleset.active === 'string' && ruleset.active.toLowerCase() === 'active') ||
           (ruleset.status && (ruleset.status === 'active' || ruleset.status === 'Active'));
  });

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed));
  };

  const handleRulesetChange = (e) => {
    setSelectedRuleset(e.target.value);
    setEvaluationResults(null); // Clear previous results
  };

  const handleAPISelectionChange = (apiIds) => {
    setSelectedAPIs(apiIds);
    setEvaluationResults(null); // Clear previous results
    setSelectedAPIId(null); // Clear selected API when selection changes
  };

  const handleAPISelect = (apiId) => {
    setSelectedAPIId(apiId);
    setSpecPanelCollapsed(false); // Show spec panel when API is selected
  };

  const handleSpecPanelToggle = () => {
    setSpecPanelCollapsed(!specPanelCollapsed);
  };

  const handleJumpToPath = (apiId, path) => {
    console.log('Jump to path requested:', { apiId, path });
    
    // Select the API if it's not already selected
    if (selectedAPIId !== apiId) {
      setSelectedAPIId(apiId);
    }
    
    // Open the spec panel if it's collapsed
    if (specPanelCollapsed) {
      setSpecPanelCollapsed(false);
    }
    
    // Set the highlighted path
    setHighlightedPath(path);
    
    // Clear the highlighted path after a delay to allow for re-highlighting
    setTimeout(() => {
      setHighlightedPath(null);
    }, 5000);
  };

  const handleRunEvaluation = async () => {
    if (!selectedRuleset || selectedAPIs.length === 0) {
      alert('Please select a ruleset and at least one API to evaluate.');
      return;
    }

    console.log('Starting evaluation...');
    console.log('Selected ruleset:', selectedRuleset);
    console.log('Selected APIs:', selectedAPIs);

    try {
      // Get the selected API objects for the results display
      const allAPIs = apisData?.apis || [];
      const selectedAPIObjects = allAPIs.filter(api => selectedAPIs.includes(api.id));
      setEvaluatedAPIs(selectedAPIObjects);
      
      console.log('Selected API objects:', selectedAPIObjects);

      const evaluationData = {
        ruleSetSelector: {
          id: selectedRuleset,
        },
        apiSelector: {
          id: selectedAPIs,
        },
      };

      console.log('Evaluation request data:', evaluationData);
      console.log('Making API call to /api/rulesets/evaluate...');

      const results = await evaluateMutation.mutateAsync(evaluationData);
      
      console.log('Evaluation results received:', results);
      setEvaluationResults(results);
      setSuccessMessage('Evaluation completed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error running evaluation:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Set empty results to show the results component with error state
      setEvaluationResults([]);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.statusText || 
                          error.message || 
                          'An unknown error occurred during evaluation';
      
      alert(`Evaluation failed: ${errorMessage}`);
    }
  };

  const canRunEvaluation = selectedRuleset && selectedAPIs.length > 0;

  if (rulesetsLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading rulesets...
      </div>
    );
  }

  return (
    <div className="rule-evaluation-layout">
      {successMessage && (
        <div className="success-message-overlay">
          <div className="success">{successMessage}</div>
        </div>
      )}

      {/* Sidebar Controls */}
      <SidebarControls
        selectedRuleset={selectedRuleset}
        selectedAPIs={selectedAPIs}
        onRulesetChange={handleRulesetChange}
        onAPISelectionChange={handleAPISelectionChange}
        onRunEvaluation={handleRunEvaluation}
        canRunEvaluation={canRunEvaluation}
        isLoading={evaluateMutation.isLoading}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Results Area */}
      <div className="results-area">
        <FullHeightResults
          results={evaluationResults}
          isLoading={evaluateMutation.isLoading}
          evaluatedAPIs={evaluatedAPIs}
          selectedAPIId={selectedAPIId}
          onAPISelect={handleAPISelect}
          onJumpToPath={handleJumpToPath}
        />
        
        {evaluateMutation.error && (
          <div className="error-overlay">
            <div className="error">
              Error running evaluation: {evaluateMutation.error.message}
            </div>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      {!specPanelCollapsed && (
        <ResizeHandle 
          minWidth={300}
          maxWidth={800}
        />
      )}

      {/* API Specification Panel */}
      <APISpecPanel
        selectedAPIId={selectedAPIId}
        isCollapsed={specPanelCollapsed}
        onToggleCollapse={handleSpecPanelToggle}
        highlightedPath={highlightedPath}
      />
    </div>
  );
};

export default RuleEvaluation;
