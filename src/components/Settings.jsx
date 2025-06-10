import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api.js';

const Settings = () => {
  const [settings, setSettings] = useState({
    apiUrl: '',
    apiKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Function to get the configured API URL
  const getConfiguredApiUrl = () => {
    return API_CONFIG.TARGET_URL;
  };

  // Function to get the configured API Key
  const getConfiguredApiKey = () => {
    return API_CONFIG.API_KEY;
  };

  // Load settings on component mount
  useEffect(() => {
    const configuredApiUrl = getConfiguredApiUrl();
    const configuredApiKey = getConfiguredApiKey();
    
    setSettings({
      apiUrl: configuredApiUrl,
      apiKey: configuredApiKey
    });
  }, []);

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate that API key is configured
      if (!settings.apiKey.trim()) {
        throw new Error('API Key is not configured. Please set VITE_API_KEY in your environment variables.');
      }

      // Use the default proxy route for testing
      const testUrl = '/api/health';

      // Test the connection by making a simple API call
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': settings.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Connection successful! The API is reachable.'
        });
      } else {
        throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Connection failed. Please check your configuration.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="card">
        <h2 className="settings-title">Governance API Settings</h2>
        <p className="settings-description">
          Configure the connection to your Tyk Governance API service. These settings will be used for all API calls.
        </p>

        <div className="settings-form">
          <div className="form-group">
            <label htmlFor="apiUrl" className="form-label">
              API URL
            </label>
            <input
              id="apiUrl"
              type="url"
              className="form-input"
              value={settings.apiUrl}
              placeholder={settings.apiUrl}
              disabled={true}
              readOnly
            />
            <small className="form-help">
              This is configured to {settings.apiUrl}. To modify this value, set the VITE_GOVERNANCE_URL environment variable.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              API Key Status
            </label>
            <div className="form-input" style={{ 
              backgroundColor: '#f5f5f5', 
              color: settings.apiKey ? '#28a745' : '#dc3545',
              fontWeight: 'bold'
            }}>
              {settings.apiKey ? '✓ API Key Configured' : '✗ API Key Not Configured'}
            </div>
            <small className="form-help">
              API Key is configured via VITE_API_KEY environment variable. 
              {!settings.apiKey && ' Please set this variable to enable API access.'}
            </small>
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="settings-actions">
            <button
              className="btn btn-primary"
              onClick={handleTestConnection}
              disabled={isLoading || !settings.apiKey}
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
            {message.text && (
              <button
                className="btn btn-secondary"
                onClick={clearMessage}
                disabled={isLoading}
              >
                Clear Message
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card settings-info">
        <h3>Configuration Information</h3>
        <ul>
          <li>API URL and API Key are configured via environment variables for security</li>
          <li>Set VITE_GOVERNANCE_URL to configure the API endpoint</li>
          <li>Set VITE_API_KEY to configure your authentication key</li>
          <li>Use "Test Connection" to verify your configuration</li>
          <li>No sensitive data is stored in browser localStorage</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
