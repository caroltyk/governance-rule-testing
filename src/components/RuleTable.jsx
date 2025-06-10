import React, { useState } from 'react';
import { 
  convertGovernanceRulesToTable, 
  isGovernanceBackendFormat 
} from '../utils/ruleFormatUtils.js';

const RuleTable = ({ rules, onEditRule, onDeleteRule, onAddRule, readOnly = false }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRules = React.useMemo(() => {
    if (!rules) {
      return [];
    }
    
    let rulesArray = [];
    
    // Check if rules are in governance backend format
    if (isGovernanceBackendFormat(rules)) {
      // Convert governance backend format to table format
      rulesArray = convertGovernanceRulesToTable(rules);
    } else if (Array.isArray(rules)) {
      // Already in array format
      rulesArray = rules;
    } else if (typeof rules === 'object') {
      // Convert object format to array
      rulesArray = Object.entries(rules).map(([name, rule]) => ({
        name,
        ...rule
      }));
    }

    const sorted = rulesArray.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return sorted;
  }, [rules, sortField, sortDirection]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return '#dc3545';
      case 'warn': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getFunctionDisplay = (rule) => {
    if (rule.then) {
      if (Array.isArray(rule.then)) {
        return rule.then.map(t => t.function).join(', ');
      }
      return rule.then.function || 'N/A';
    }
    return 'N/A';
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <span style={{ opacity: 0.3 }}>↕</span>;
    }
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (!rules || sortedRules.length === 0) {
    return (
      <div className="rule-table-empty">
        <div className="empty-state">
          <h3>No Rules Defined</h3>
          <p>{readOnly ? 'This ruleset has no rules configured.' : 'Start by adding your first rule to this ruleset.'}</p>
          {!readOnly && (
            <button className="btn btn-primary" onClick={onAddRule}>
              Add First Rule
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rule-table-container">
      <div className="rule-table-header">
        <h3>Rules ({sortedRules.length})</h3>
        {!readOnly && (
          <button className="btn btn-primary btn-small" onClick={onAddRule}>
            Add Rule
          </button>
        )}
      </div>
      
      <div className="rule-table-wrapper">
        <table className="rule-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Rule Name <SortIcon field="name" />
              </th>
              <th onClick={() => handleSort('description')} className="sortable">
                Description <SortIcon field="description" />
              </th>
              <th onClick={() => handleSort('severity')} className="sortable">
                Severity <SortIcon field="severity" />
              </th>
              <th onClick={() => handleSort('given')} className="sortable">
                Target (Given) <SortIcon field="given" />
              </th>
              <th>Function</th>
              {!readOnly && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sortedRules.map((rule) => (
              <tr key={rule.name}>
                <td className="rule-name">
                  <strong>{rule.name}</strong>
                  {rule.recommended && (
                    <span className="rule-badge recommended" title="Recommended rule">
                      ★
                    </span>
                  )}
                </td>
                <td className="rule-description">
                  <div className="description-text">
                    {rule.description || 'No description'}
                  </div>
                </td>
                <td className="rule-severity">
                  <span 
                    className="severity-badge"
                    style={{ 
                      backgroundColor: getSeverityColor(rule.severity),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {rule.severity || 'info'}
                  </span>
                </td>
                <td className="rule-given">
                  <code className="jsonpath">{rule.given || 'N/A'}</code>
                </td>
                <td className="rule-function">
                  <code className="function-name">{getFunctionDisplay(rule)}</code>
                </td>
                {!readOnly && (
                  <td className="rule-actions">
                    <div className="action-buttons">
                      <button
                        className="btn btn-outline btn-small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEditRule(rule.name, rule);
                        }}
                        title="Edit rule"
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => onDeleteRule(rule.name)}
                        title="Delete rule"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RuleTable;
