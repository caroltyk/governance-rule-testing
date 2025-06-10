import React, { useState, useMemo } from 'react';

const FullHeightResults = ({ results, isLoading, evaluatedAPIs = [], selectedAPIId, onAPISelect, onJumpToPath }) => {
  const [filterSeverity, setFilterSeverity] = useState('');
  const [expandedAPIs, setExpandedAPIs] = useState(new Set());

  const getSeverityText = (severity) => {
    switch (severity) {
      case 0: return 'Error';
      case 1: return 'Warning';
      case 2: return 'Info';
      case 3: return 'Hint';
      default: return 'Unknown';
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 0: return 'severity-error';
      case 1: return 'severity-warning';
      case 2: return 'severity-info';
      case 3: return 'severity-hint';
      default: return 'severity-info';
    }
  };

  // Group results by API
  const groupedResults = useMemo(() => {
    const groups = {};
    
    // Initialize all evaluated APIs
    evaluatedAPIs.forEach(api => {
      groups[api.id] = {
        api: api,
        issues: []
      };
    });

    // Add issues to their respective APIs
    if (results && results.length > 0) {
      results.forEach(result => {
        const apiId = result.source || result.api?.id;
        if (apiId && groups[apiId]) {
          groups[apiId].issues.push(result);
        }
      });
    }

    return groups;
  }, [results, evaluatedAPIs]);

  // Filter results by severity
  const filteredGroups = useMemo(() => {
    if (filterSeverity === '') return groupedResults;
    
    const filtered = {};
    Object.keys(groupedResults).forEach(apiId => {
      const group = groupedResults[apiId];
      const filteredIssues = group.issues.filter(issue => 
        issue.severity === parseInt(filterSeverity)
      );
      
      filtered[apiId] = {
        ...group,
        issues: filteredIssues
      };
    });
    
    return filtered;
  }, [groupedResults, filterSeverity]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const severityCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let totalIssues = 0;
    let apisWithIssues = 0;
    let apisPassed = 0;

    Object.values(groupedResults).forEach(group => {
      if (group.issues.length > 0) {
        apisWithIssues++;
        group.issues.forEach(issue => {
          severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
          totalIssues++;
        });
      } else {
        apisPassed++;
      }
    });

    return {
      severityCounts,
      totalIssues,
      apisWithIssues,
      apisPassed,
      totalAPIs: evaluatedAPIs.length
    };
  }, [groupedResults, evaluatedAPIs]);

  const toggleAPIExpansion = (apiId) => {
    const newExpanded = new Set(expandedAPIs);
    if (newExpanded.has(apiId)) {
      newExpanded.delete(apiId);
    } else {
      newExpanded.add(apiId);
    }
    setExpandedAPIs(newExpanded);
  };

  const handleIssueClick = (issue, apiId) => {
    if (onJumpToPath && issue.path && issue.path.length > 0) {
      onJumpToPath(apiId, issue.path);
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="full-height-results">
        <div className="results-header sticky">
          <h3>Evaluation Results</h3>
        </div>
        <div className="results-content">
          <div className="loading-center">
            <div className="spinner"></div>
            <p>Running evaluation...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle no APIs case
  if (evaluatedAPIs.length === 0) {
    return (
      <div className="full-height-results">
        <div className="results-header sticky">
          <h3>Evaluation Results</h3>
        </div>
        <div className="results-content">
          <div className="empty-state">
            <p>No APIs were evaluated.</p>
            <p className="empty-hint">Select a ruleset and APIs from the sidebar to run an evaluation.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-height-results">
      {/* Sticky Header with Summary */}
      <div className="results-header sticky">
        <div className="header-top">
          <h3>Evaluation Results</h3>
          <div className="summary-badges">
            <span className="severity-badge severity-error">
              {summary.severityCounts[0]} Errors
            </span>
            <span className="severity-badge severity-warning">
              {summary.severityCounts[1]} Warnings
            </span>
            <span className="severity-badge severity-info">
              {summary.severityCounts[2]} Info
            </span>
            <span className="severity-badge severity-hint">
              {summary.severityCounts[3]} Hints
            </span>
          </div>
        </div>
        
        <div className="header-bottom">
          <div className="summary-stats">
            <span><strong>{summary.totalAPIs}</strong> APIs</span>
            <span><strong>{summary.apisPassed}</strong> passed</span>
            <span><strong>{summary.apisWithIssues}</strong> with issues</span>
            <span><strong>{summary.totalIssues}</strong> total issues</span>
          </div>
          
          <div className="filter-controls">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="form-select compact"
            >
              <option value="">All Severities</option>
              <option value="0">Errors Only</option>
              <option value="1">Warnings Only</option>
              <option value="2">Info Only</option>
              <option value="3">Hints Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable Results Content */}
      <div className="results-content">
        {Object.keys(filteredGroups).length === 0 ? (
          <div className="empty-state">
            <p>No APIs match the current filter.</p>
          </div>
        ) : (
          <div className="api-results-list">
            {Object.values(filteredGroups).map(group => {
              const { api, issues } = group;
              const hasIssues = issues.length > 0;
              const isExpanded = expandedAPIs.has(api.id);
              
              return (
                <div key={api.id} className={`api-result-card ${selectedAPIId === api.id ? 'selected' : ''}`}>
                  <div 
                    className="api-result-header clickable"
                    onClick={() => {
                      if (hasIssues) {
                        toggleAPIExpansion(api.id);
                      }
                      if (onAPISelect) {
                        onAPISelect(api.id);
                      }
                    }}
                  >
                    <div className="api-info">
                      <div className="api-name-section">
                        {hasIssues && (
                          <span className="expand-icon">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        )}
                        <h4>{api.name}</h4>
                        {selectedAPIId === api.id && (
                          <span className="selected-indicator" title="API specification shown in side panel">
                            👁️
                          </span>
                        )}
                      </div>
                      <div className="api-meta">
                        <span>ID: {api.id}</span>
                        <span>Auth: {api.authentication_type || 'Unknown'}</span>
                        {api.owner_name && <span>Owner: {api.owner_name}</span>}
                      </div>
                    </div>
                    
                    <div className="api-status">
                      {hasIssues ? (
                        <div className="issue-summary">
                          {[0, 1, 2, 3].map(severity => {
                            const count = issues.filter(i => i.severity === severity).length;
                            return count > 0 ? (
                              <span key={severity} className={`severity-badge ${getSeverityClass(severity)}`}>
                                {count}
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span className="passed-badge">
                          ✓ Passed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Issues Details */}
                  {hasIssues && isExpanded && (
                    <div className="api-issues-details">
                      <div className="issues-table-container">
                        <table className="issues-table">
                          <thead>
                            <tr>
                              <th>Severity</th>
                              <th>Rule</th>
                              <th>Message</th>
                              <th>Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {issues.map((issue, index) => {
                              const hasPath = issue.path && issue.path.length > 0;
                              return (
                                <tr 
                                  key={index}
                                  onClick={() => handleIssueClick(issue, api.id)}
                                  style={{
                                    cursor: hasPath ? 'pointer' : 'default',
                                    transition: 'background-color 0.2s'
                                  }}
                                  title={hasPath ? 'Click to jump to location in API specification' : ''}
                                >
                                  <td>
                                    <span className={`severity-badge ${getSeverityClass(issue.severity)}`}>
                                      {getSeverityText(issue.severity)}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="rule-info">
                                      <strong>{issue.code}</strong>
                                      {issue.rule?.name && (
                                        <div className="rule-name">{issue.rule.name}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="issue-message">{issue.message}</div>
                                  </td>
                                  <td>
                                    <div className="location-info">
                                      {issue.path && issue.path.length > 0 && (
                                        <div 
                                          className="path"
                                          style={{
                                            color: hasPath ? 'var(--color-purple-dark)' : 'inherit',
                                            fontWeight: hasPath ? 'var(--font-weight-medium)' : 'normal'
                                          }}
                                        >
                                          Path: {issue.path.join(' → ')}
                                          {hasPath && <span style={{ marginLeft: '0.5rem' }}>🔗</span>}
                                        </div>
                                      )}
                                      {issue.range && (
                                        <div className="range">
                                          Line {issue.range.start?.line || 'N/A'}, 
                                          Col {issue.range.start?.character || 'N/A'}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FullHeightResults;
