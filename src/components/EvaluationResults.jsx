import React, { useState, useMemo } from 'react';

const EvaluationResults = ({ results, isLoading, evaluatedAPIs = [], onJumpToPath }) => {
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

  // Group results by API - moved before early returns to fix hooks order
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
      
      // Include API even if no issues match filter (to show "passes validation")
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
      // Call the parent callback to handle path navigation
      onJumpToPath(apiId, issue.path);
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="evaluation-results">
        <h3>Evaluation Results</h3>
        <div className="loading">
          <div className="spinner"></div>
          Running evaluation...
        </div>
      </div>
    );
  }

  // Handle no APIs case
  if (evaluatedAPIs.length === 0) {
    return (
      <div className="evaluation-results">
        <h3>Evaluation Results</h3>
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No APIs were evaluated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-results">
      <h3>Evaluation Results</h3>
      
      {/* Summary */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h4>Summary</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span className="severity-badge severity-error">
            Errors: {summary.severityCounts[0]}
          </span>
          <span className="severity-badge severity-warning">
            Warnings: {summary.severityCounts[1]}
          </span>
          <span className="severity-badge severity-info">
            Info: {summary.severityCounts[2]}
          </span>
          <span className="severity-badge severity-hint">
            Hints: {summary.severityCounts[3]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <span><strong>{summary.totalAPIs}</strong> APIs evaluated</span>
          <span><strong>{summary.apisPassed}</strong> APIs passed</span>
          <span><strong>{summary.apisWithIssues}</strong> APIs with issues</span>
          <span><strong>{summary.totalIssues}</strong> total issues</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label>
          Filter by severity:
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="form-select"
            style={{ marginLeft: '0.5rem', width: 'auto' }}
          >
            <option value="">All Severities</option>
            <option value="0">Errors</option>
            <option value="1">Warnings</option>
            <option value="2">Info</option>
            <option value="3">Hints</option>
          </select>
        </label>
      </div>

      {/* API Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.values(filteredGroups).map(group => {
          const { api, issues } = group;
          const hasIssues = issues.length > 0;
          const isExpanded = expandedAPIs.has(api.id);
          
          return (
            <div key={api.id} className="card">
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: hasIssues ? 'pointer' : 'default',
                  padding: hasIssues ? '0.5rem' : '0',
                  margin: hasIssues ? '-0.5rem' : '0',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onClick={hasIssues ? () => toggleAPIExpansion(api.id) : undefined}
                onMouseEnter={(e) => {
                  if (hasIssues) e.target.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  if (hasIssues) e.target.style.backgroundColor = 'transparent';
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                    {hasIssues && (isExpanded ? '▼ ' : '▶ ')}
                    {api.name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    ID: {api.id} | Auth: {api.authentication_type || 'Unknown'}
                    {api.owner_name && ` | Owner: ${api.owner_name}`}
                  </div>
                </div>
                <div>
                  {hasIssues ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="severity-badge severity-error">
                        {issues.filter(i => i.severity === 0).length}
                      </span>
                      <span className="severity-badge severity-warning">
                        {issues.filter(i => i.severity === 1).length}
                      </span>
                      <span className="severity-badge severity-info">
                        {issues.filter(i => i.severity === 2).length}
                      </span>
                      <span className="severity-badge severity-hint">
                        {issues.filter(i => i.severity === 3).length}
                      </span>
                    </div>
                  ) : (
                    <span style={{ 
                      color: '#28a745', 
                      fontWeight: 'bold',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#d4edda',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      ✓ Passed Validation
                    </span>
                  )}
                </div>
              </div>

              {/* Issues Details */}
              {hasIssues && isExpanded && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <table className="results-table" style={{ margin: 0 }}>
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
                              <div>
                                <strong>{issue.code}</strong>
                                {issue.rule?.name && (
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {issue.rule.name}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                                {issue.message}
                              </div>
                            </td>
                            <td>
                              {issue.path && issue.path.length > 0 && (
                                <div style={{ 
                                  fontSize: '0.8rem',
                                  color: hasPath ? 'var(--color-purple-dark)' : 'inherit',
                                  fontWeight: hasPath ? 'var(--font-weight-medium)' : 'normal'
                                }}>
                                  Path: {issue.path.join(' → ')}
                                  {hasPath && <span style={{ marginLeft: '0.5rem' }}>🔗</span>}
                                </div>
                              )}
                              {issue.range && (
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  Line {issue.range.start?.line || 'N/A'}, 
                                  Column {issue.range.start?.character || 'N/A'}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(filteredGroups).length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No APIs match the current filter.</p>
        </div>
      )}
    </div>
  );
};

export default EvaluationResults;
