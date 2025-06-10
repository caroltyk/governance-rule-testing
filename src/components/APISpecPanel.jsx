import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAPI } from '../hooks/useAPIs.js';
import ResizeHandle from './ResizeHandle.jsx';
import JSONTreeViewer from './JSONTreeViewer.jsx';

const APISpecPanel = ({ selectedAPIId, onClose, isCollapsed, onToggleCollapse, highlightedPath = null }) => {
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' or 'raw'
  const [expandedSections, setExpandedSections] = useState(new Set(['info', 'paths']));
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentHighlightedPath, setCurrentHighlightedPath] = useState(null);
  
  const { data: apiData, isLoading, error } = useAPI(selectedAPIId);

  // Handle highlighted path changes
  useEffect(() => {
    if (highlightedPath && highlightedPath.length > 0) {
      // Auto-switch to Raw view when jumping to a path
      setViewMode('raw');
      setCurrentHighlightedPath(highlightedPath);
    } else {
      setCurrentHighlightedPath(null);
    }
  }, [highlightedPath]);

  const handlePathHighlighted = (nodeId, actualPath, originalPath) => {
    console.log('Path highlighted in JSON tree:', {
      nodeId,
      actualPath,
      originalPath,
      fallbackUsed: actualPath.join('.') !== originalPath.join('.')
    });
    
    if (actualPath.join('.') !== originalPath.join('.')) {
      console.warn(`Original path "${originalPath.join('.')}" not found, highlighted closest parent: "${actualPath.join('.')}"`);
    }
  };

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleCopyAPIData = async () => {
    if (!apiData) return;
    
    try {
      const specData = apiData.api_data || apiData.spec || apiData.specification || apiData;
      const formattedData = formatAPISpec(specData);
      
      await navigator.clipboard.writeText(formattedData);
      setCopySuccess(true);
      
      // Reset success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy API data:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        const specData = apiData.api_data || apiData.spec || apiData.specification || apiData;
        textArea.value = formatAPISpec(specData);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr);
      }
    }
  };

  const formatAPISpec = (spec) => {
    if (!spec) return '';
    
    // If spec is already a string, return it
    if (typeof spec === 'string') {
      try {
        // Try to parse and re-stringify for formatting
        const parsed = JSON.parse(spec);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return spec;
      }
    }
    
    // If spec is an object, stringify it
    return JSON.stringify(spec, null, 2);
  };

  const renderFormattedView = (spec) => {
    if (!spec) {
      return (
        <div className="spec-empty">
          <p>No API specification data available</p>
        </div>
      );
    }

    let parsedSpec;
    try {
      parsedSpec = typeof spec === 'string' ? JSON.parse(spec) : spec;
    } catch {
      return (
        <div className="spec-error">
          <p>Unable to parse API specification</p>
          <p className="error-message">The data is not in a valid JSON format</p>
        </div>
      );
    }

    // Debug: Log the parsed spec structure
    console.log('Parsed API spec for formatted view:', parsedSpec);

    // Check if this looks like an OpenAPI specification
    const hasOpenAPIStructure = parsedSpec.openapi || parsedSpec.swagger || parsedSpec.info || parsedSpec.paths;
    
    if (!hasOpenAPIStructure) {
      // If it's not an OpenAPI spec, show the raw API data in a structured way
      return (
        <div className="formatted-spec">
          <div className="spec-section">
            <div className="spec-section-header">
              <span className="expand-icon">▼</span>
              <h4>API Data</h4>
            </div>
            <div className="spec-section-content">
              <div className="info-grid">
                {Object.entries(parsedSpec).map(([key, value]) => (
                  <div key={key} className="info-item">
                    <strong>{key}:</strong> {
                      typeof value === 'object' ? 
                        JSON.stringify(value, null, 2) : 
                        String(value)
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="formatted-spec">
        {/* API Info Section */}
        {parsedSpec.info && (
          <div className="spec-section">
            <div 
              className="spec-section-header"
              onClick={() => toggleSection('info')}
            >
              <span className="expand-icon">
                {expandedSections.has('info') ? '▼' : '▶'}
              </span>
              <h4>API Information</h4>
            </div>
            {expandedSections.has('info') && (
              <div className="spec-section-content">
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Title:</strong> {parsedSpec.info.title}
                  </div>
                  {parsedSpec.info.version && (
                    <div className="info-item">
                      <strong>Version:</strong> {parsedSpec.info.version}
                    </div>
                  )}
                  {parsedSpec.info.description && (
                    <div className="info-item">
                      <strong>Description:</strong> {parsedSpec.info.description}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Servers Section */}
        {parsedSpec.servers && parsedSpec.servers.length > 0 && (
          <div className="spec-section">
            <div 
              className="spec-section-header"
              onClick={() => toggleSection('servers')}
            >
              <span className="expand-icon">
                {expandedSections.has('servers') ? '▼' : '▶'}
              </span>
              <h4>Servers</h4>
            </div>
            {expandedSections.has('servers') && (
              <div className="spec-section-content">
                {parsedSpec.servers.map((server, index) => (
                  <div key={index} className="server-item">
                    <div className="server-url">{server.url}</div>
                    {server.description && (
                      <div className="server-description">{server.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paths Section */}
        {parsedSpec.paths && (
          <div className="spec-section">
            <div 
              className="spec-section-header"
              onClick={() => toggleSection('paths')}
            >
              <span className="expand-icon">
                {expandedSections.has('paths') ? '▼' : '▶'}
              </span>
              <h4>Endpoints ({Object.keys(parsedSpec.paths).length})</h4>
            </div>
            {expandedSections.has('paths') && (
              <div className="spec-section-content">
                {Object.entries(parsedSpec.paths).map(([path, methods]) => (
                  <div key={path} className="endpoint-item">
                    <div className="endpoint-path">{path}</div>
                    <div className="endpoint-methods">
                      {Object.entries(methods).map(([method, details]) => (
                        <div key={method} className={`method-badge method-${method.toLowerCase()}`}>
                          {method.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Components/Schemas Section */}
        {parsedSpec.components?.schemas && (
          <div className="spec-section">
            <div 
              className="spec-section-header"
              onClick={() => toggleSection('schemas')}
            >
              <span className="expand-icon">
                {expandedSections.has('schemas') ? '▼' : '▶'}
              </span>
              <h4>Schemas ({Object.keys(parsedSpec.components.schemas).length})</h4>
            </div>
            {expandedSections.has('schemas') && (
              <div className="spec-section-content">
                {Object.keys(parsedSpec.components.schemas).map((schemaName) => (
                  <div key={schemaName} className="schema-item">
                    {schemaName}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRawView = (spec) => {
    if (!spec) {
      return (
        <div className="spec-empty">
          <p>No API specification data available</p>
        </div>
      );
    }

    let parsedSpec;
    try {
      parsedSpec = typeof spec === 'string' ? JSON.parse(spec) : spec;
    } catch {
      // If parsing fails, fall back to syntax highlighter
      const formattedSpec = formatAPISpec(spec);
      return (
        <div className="raw-spec">
          <SyntaxHighlighter
            language="json"
            style={tomorrow}
            showLineNumbers={true}
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: '#666',
              borderRight: '1px solid #ddd',
              marginRight: '1em'
            }}
            customStyle={{
              margin: 0,
              background: 'transparent',
              fontSize: '13px',
              lineHeight: '1.4'
            }}
          >
            {formattedSpec}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <div className="raw-spec">
        <JSONTreeViewer 
          data={parsedSpec} 
          highlightedPath={currentHighlightedPath}
          onPathHighlighted={handlePathHighlighted}
        />
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <div className="api-spec-panel collapsed">
        <button 
          className="expand-panel-btn"
          onClick={onToggleCollapse}
          title="Show API Specification"
        >
          📄
        </button>
      </div>
    );
  }

  return (
    <div className="api-spec-panel">
      <div className="spec-panel-header">
        <div className="spec-panel-title">
          <h3>API Specification</h3>
          {apiData?.name && (
            <span className="api-name">{apiData.name}</span>
          )}
        </div>
        <div className="spec-panel-controls">
          {apiData && (
            <button
              className="copy-btn"
              onClick={handleCopyAPIData}
              title="Copy API Specification"
              disabled={copySuccess}
            >
              {copySuccess ? '✓' : '📋'}
            </button>
          )}
          <div className="view-mode-toggle">
            <button
              className={`toggle-btn ${viewMode === 'formatted' ? 'active' : ''}`}
              onClick={() => setViewMode('formatted')}
            >
              Formatted
            </button>
            <button
              className={`toggle-btn ${viewMode === 'raw' ? 'active' : ''}`}
              onClick={() => setViewMode('raw')}
            >
              Raw
            </button>
          </div>
          <button 
            className="collapse-btn"
            onClick={onToggleCollapse}
            title="Hide API Specification"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="spec-panel-content">
        {isLoading && (
          <div className="spec-loading">
            <div className="spinner"></div>
            <p>Loading API specification...</p>
          </div>
        )}

        {error && (
          <div className="spec-error">
            <p>Error loading API specification:</p>
            <p className="error-message">{error.message}</p>
          </div>
        )}

        {!isLoading && !error && !selectedAPIId && (
          <div className="spec-empty">
            <p>Select an API from the results to view its specification</p>
          </div>
        )}

        {!isLoading && !error && apiData && (
          <div className="spec-content">
            {viewMode === 'formatted' ? 
              renderFormattedView(apiData.api_data || apiData.spec || apiData.specification || apiData) : 
              renderRawView(apiData.api_data || apiData.spec || apiData.specification || apiData)
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default APISpecPanel;
