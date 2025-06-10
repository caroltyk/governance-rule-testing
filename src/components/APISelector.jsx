import React, { useState, useEffect } from 'react';
import { useAPIs } from '../hooks/useAPIs.js';

const APISelector = ({ selectedAPIs, onSelectionChange }) => {
  const [filters, setFilters] = useState({
    provider: '',
    auth_type: '',
    criticality: '',
    domain: '',
  });

  const { data: apisData, isLoading, error } = useAPIs(filters);
  const apis = apisData?.apis || [];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAPIToggle = (apiId) => {
    const newSelection = selectedAPIs.includes(apiId)
      ? selectedAPIs.filter(id => id !== apiId)
      : [...selectedAPIs, apiId];
    
    onSelectionChange(newSelection);
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
      <div className="api-selector">
        <h3>Select APIs for Evaluation</h3>
        <div className="loading">
          <div className="spinner"></div>
          Loading APIs...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-selector">
        <h3>Select APIs for Evaluation</h3>
        <div className="error">
          Error loading APIs: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="api-selector">
      <h3>Select APIs for Evaluation</h3>
      
      <div className="api-filters">
        <select
          name="provider"
          value={filters.provider}
          onChange={handleFilterChange}
          className="form-select"
        >
          <option value="">All Providers</option>
          <option value="tyk">Tyk</option>
          <option value="aws">AWS</option>
        </select>

        <select
          name="auth_type"
          value={filters.auth_type}
          onChange={handleFilterChange}
          className="form-select"
        >
          <option value="">All Auth Types</option>
          <option value="none">None</option>
          <option value="keyless">Keyless</option>
          <option value="basic">Basic</option>
          <option value="jwt">JWT</option>
          <option value="oauth">OAuth</option>
          <option value="openid">OpenID</option>
        </select>

        <select
          name="criticality"
          value={filters.criticality}
          onChange={handleFilterChange}
          className="form-select"
        >
          <option value="">All Criticality Levels</option>
          <option value="tier_1">Tier 1</option>
          <option value="tier_2">Tier 2</option>
          <option value="tier_3">Tier 3</option>
        </select>

        <input
          type="text"
          name="domain"
          value={filters.domain}
          onChange={handleFilterChange}
          placeholder="Filter by domain"
          className="form-input"
        />

        <button className="btn btn-secondary" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span>
          {selectedAPIs.length} of {apis.length} APIs selected
        </span>
        <button className="btn btn-secondary" onClick={handleSelectAll}>
          {selectedAPIs.length === apis.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {apis.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No APIs found matching the current filters.</p>
        </div>
      ) : (
        <div className="api-list">
          {apis.map((api) => (
            <div key={api.id} className="api-item">
              <input
                type="checkbox"
                checked={selectedAPIs.includes(api.id)}
                onChange={() => handleAPIToggle(api.id)}
              />
              <div className="api-info">
                <h4>{api.name}</h4>
                <p>
                  ID: {api.id} | 
                  Auth: {api.authentication_type || 'Unknown'} | 
                  Owner: {api.owner_name || 'Unassigned'}
                </p>
                {api.labels && api.labels.length > 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#888' }}>
                    Labels: {api.labels.map(label => `${label.label_name}: ${label.values.join(', ')}`).join(' | ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default APISelector;
