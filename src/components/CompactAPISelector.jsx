import React, { useState, useEffect } from 'react';
import { useAPIs } from '../hooks/useAPIs.js';
import { useLabels } from '../hooks/useLabels.js';

const CompactAPISelector = ({ selectedAPIs, onSelectionChange, isCollapsed }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAPIList, setShowAPIList] = useState(false);
  const [filters, setFilters] = useState({
    provider: '',
    auth_type: '',
    criticality: '',
    domain: '',
  });

  const { data: apisData, isLoading, error } = useAPIs(filters);
  const { data: labelsData, isLoading: labelsLoading } = useLabels();
  const apis = apisData?.apis || [];
  const labels = labelsData?.labels || [];

  // Helper function to get label values by name
  const getLabelValues = (labelName) => {
    const label = labels.find(l => l.name === labelName);
    return label ? label.values : [];
  };

  // Get dynamic filter options from labels
  const providerOptions = getLabelValues('provider');
  const authTypeOptions = getLabelValues('auth_type');
  const criticalityOptions = getLabelValues('api_criticality');

  // Fallback to hardcoded options if labels are not available
  const getProviderOptions = () => {
    if (labelsLoading) return ['tyk', 'aws']; // Show fallback during loading
    return providerOptions.length > 0 ? providerOptions : ['tyk', 'aws'];
  };

  const getAuthTypeOptions = () => {
    if (labelsLoading) return ['none', 'keyless', 'basic', 'jwt', 'oauth']; // Show fallback during loading
    return authTypeOptions.length > 0 ? authTypeOptions : ['none', 'keyless', 'basic', 'jwt', 'oauth'];
  };

  const getCriticalityOptions = () => {
    if (labelsLoading) return ['tier_1', 'tier_2', 'tier_3']; // Show fallback during loading
    return criticalityOptions.length > 0 ? criticalityOptions : ['tier_1', 'tier_2', 'tier_3'];
  };

  // Select all APIs by default when APIs are loaded
  useEffect(() => {
    if (apis.length > 0 && selectedAPIs.length === 0) {
      onSelectionChange(apis.map(api => api.id));
    }
  }, [apis, selectedAPIs.length, onSelectionChange]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectAll = () => {
    if (selectedAPIs.length === apis.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(apis.map(api => api.id));
    }
  };

  const clearFilters = () => {
    setFilters({
      provider: '',
      auth_type: '',
      criticality: '',
      domain: '',
    });
  };

  if (isLoading) {
    return (
      <div className="compact-selector">
        <div className="loading-compact">
          <div className="spinner-small"></div>
          {!isCollapsed && 'Loading APIs...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compact-selector">
        <div className="error-compact">
          {isCollapsed ? '❌' : `Error: ${error.message}`}
        </div>
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div className="compact-selector collapsed">
        <div 
          className="api-indicator"
          title={`${selectedAPIs.length} of ${apis.length} APIs selected`}
        >
          <span className="api-count">{selectedAPIs.length}</span>
          <span className="api-total">/{apis.length}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="compact-selector">
      <div className="api-summary">
        <div className="api-selection-header">
          <span className="selection-count">
            {selectedAPIs.length} of {apis.length} selected
          </span>
          <button
            className="btn btn-secondary btn-small"
            onClick={handleSelectAll}
          >
            {selectedAPIs.length === apis.length ? 'None' : 'All'}
          </button>
        </div>

        <div className="api-controls">
          <button
            className="btn-link"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'Show'} filters
          </button>
          <button
            className="btn-link"
            onClick={() => setShowAPIList(!showAPIList)}
          >
            {showAPIList ? 'Hide' : 'Show'} API list
          </button>
        </div>

        {showFilters && (
          <div className="compact-filters">
            <select
              name="provider"
              value={filters.provider}
              onChange={handleFilterChange}
              className="form-select compact"
              disabled={labelsLoading}
            >
              <option value="">All Providers</option>
              {getProviderOptions().map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>

            <select
              name="auth_type"
              value={filters.auth_type}
              onChange={handleFilterChange}
              className="form-select compact"
              disabled={labelsLoading}
            >
              <option value="">All Auth</option>
              {getAuthTypeOptions().map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>

            <select
              name="criticality"
              value={filters.criticality}
              onChange={handleFilterChange}
              className="form-select compact"
              disabled={labelsLoading}
            >
              <option value="">All Tiers</option>
              {getCriticalityOptions().map(option => (
                <option key={option} value={option}>
                  {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            <button className="btn btn-secondary btn-small" onClick={clearFilters}>
              Clear
            </button>
          </div>
        )}

        {showAPIList && (
          <div className="compact-api-list">
            {apis.length === 0 ? (
              <div className="no-apis">No APIs found</div>
            ) : (
              <div className="api-list-compact">
                {apis.slice(0, 10).map((api) => (
                  <div key={api.id} className="api-item-compact">
                    <input
                      type="checkbox"
                      checked={selectedAPIs.includes(api.id)}
                      onChange={() => {
                        const newSelection = selectedAPIs.includes(api.id)
                          ? selectedAPIs.filter(id => id !== api.id)
                          : [...selectedAPIs, api.id];
                        onSelectionChange(newSelection);
                      }}
                    />
                    <span className="api-name">{api.name}</span>
                    <span className="api-auth">{api.authentication_type || 'Unknown'}</span>
                  </div>
                ))}
                {apis.length > 10 && (
                  <div className="api-overflow">
                    +{apis.length - 10} more APIs
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactAPISelector;
