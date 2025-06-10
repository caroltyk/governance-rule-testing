import React, { useState, useEffect } from 'react';

const COMMON_JSONPATHS = [
  { path: '$.info', description: 'API information (title, version, description)' },
  { path: '$.info.title', description: 'API title' },
  { path: '$.info.version', description: 'API version' },
  { path: '$.info.description', description: 'API description' },
  { path: '$.info.contact', description: 'API contact information' },
  { path: '$.info.license', description: 'API license information' },
  { path: '$.servers[*]', description: 'All server definitions' },
  { path: '$.servers[*].url', description: 'Server URLs' },
  { path: '$.paths', description: 'All API paths' },
  { path: '$.paths[*]', description: 'All path items' },
  { path: '$.paths[*][*]', description: 'All operations (GET, POST, etc.)' },
  { path: '$.paths[*][*].summary', description: 'Operation summaries' },
  { path: '$.paths[*][*].description', description: 'Operation descriptions' },
  { path: '$.paths[*][*].operationId', description: 'Operation IDs' },
  { path: '$.paths[*][*].tags', description: 'Operation tags' },
  { path: '$.paths[*][*].parameters[*]', description: 'All parameters' },
  { path: '$.paths[*][*].parameters[*].name', description: 'Parameter names' },
  { path: '$.paths[*][*].parameters[*].description', description: 'Parameter descriptions' },
  { path: '$.paths[*][*].requestBody', description: 'Request body definitions' },
  { path: '$.paths[*][*].responses', description: 'Response definitions' },
  { path: '$.paths[*][*].responses[*]', description: 'All response objects' },
  { path: '$.paths[*][*].responses[*].description', description: 'Response descriptions' },
  { path: '$.paths[*][*].security', description: 'Operation security requirements' },
  { path: '$.components', description: 'Reusable components' },
  { path: '$.components.schemas', description: 'Schema definitions' },
  { path: '$.components.schemas[*]', description: 'All schema objects' },
  { path: '$.components.parameters', description: 'Parameter definitions' },
  { path: '$.components.responses', description: 'Response definitions' },
  { path: '$.components.securitySchemes', description: 'Security scheme definitions' },
  { path: '$.security', description: 'Global security requirements' },
  { path: '$.tags', description: 'API tags' },
  { path: '$.tags[*]', description: 'All tag objects' },
  { path: '$.tags[*].name', description: 'Tag names' },
  { path: '$.tags[*].description', description: 'Tag descriptions' },
  { path: '$.externalDocs', description: 'External documentation' }
];

const JSONPathSelector = ({ value, onChange, exemplarDocument }) => {
  const [customPath, setCustomPath] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [extractedPaths, setExtractedPaths] = useState([]);

  useEffect(() => {
    if (exemplarDocument) {
      extractPathsFromDocument(exemplarDocument);
    }
  }, [exemplarDocument]);

  useEffect(() => {
    // Auto-switch to custom mode if the value doesn't match any preset
    if (value && value.trim()) {
      const isPresetPath = COMMON_JSONPATHS.some(preset => preset.path === value) ||
                          extractedPaths.includes(value);
      
      if (!isPresetPath) {
        setShowCustom(true);
        setCustomPath(value);
      }
    }
  }, [value, extractedPaths]);

  const extractPathsFromDocument = (doc) => {
    const paths = new Set();
    
    const traverse = (obj, currentPath = '$') => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            traverse(item, `${currentPath}[${index}]`);
          });
          if (obj.length > 0) {
            paths.add(`${currentPath}[*]`);
          }
        } else {
          Object.keys(obj).forEach(key => {
            const newPath = currentPath === '$' ? `$.${key}` : `${currentPath}.${key}`;
            paths.add(newPath);
            traverse(obj[key], newPath);
          });
        }
      }
    };

    try {
      const parsed = typeof doc === 'string' ? JSON.parse(doc) : doc;
      traverse(parsed);
      setExtractedPaths(Array.from(paths).sort());
    } catch (error) {
      console.error('Error extracting paths from document:', error);
      setExtractedPaths([]);
    }
  };

  const handlePresetSelect = (e) => {
    const selectedPath = e.target.value;
    if (selectedPath) {
      onChange(selectedPath);
      setShowCustom(false);
      setCustomPath('');
    }
  };

  const handleCustomPathChange = (e) => {
    const path = e.target.value;
    setCustomPath(path);
    onChange(path);
  };

  const toggleCustom = () => {
    setShowCustom(!showCustom);
    if (!showCustom) {
      setCustomPath(value || '');
    }
  };

  const validateJSONPath = (path) => {
    // Basic JSONPath validation
    if (!path) return false;
    if (!path.startsWith('$')) return false;
    
    // Check for basic syntax issues
    const invalidChars = /[^a-zA-Z0-9_\-\.\[\]\*\$]/;
    return !invalidChars.test(path.replace(/\['\w+'\]/g, ''));
  };

  const isValidPath = validateJSONPath(value);

  return (
    <div className="jsonpath-selector">
      <div className="form-group">
        <label className="form-label">
          JSONPath Target *
          <button
            type="button"
            className="help-button"
            onClick={() => setShowCustom(!showCustom)}
            title="Toggle between preset and custom JSONPath"
          >
            {showCustom ? '📋' : '✏️'}
          </button>
        </label>

        {!showCustom ? (
          <div>
            <select
              value={value || ''}
              onChange={handlePresetSelect}
              className="form-input"
              required
            >
              <option value="">Select a JSONPath target</option>
              
              <optgroup label="Common Paths">
                {COMMON_JSONPATHS.map(({ path, description }) => (
                  <option key={path} value={path}>
                    {path} - {description}
                  </option>
                ))}
              </optgroup>

              {extractedPaths.length > 0 && (
                <optgroup label="Paths from Exemplar Document">
                  {extractedPaths.slice(0, 50).map(path => (
                    <option key={path} value={path}>
                      {path}
                    </option>
                  ))}
                  {extractedPaths.length > 50 && (
                    <option disabled>... and {extractedPaths.length - 50} more</option>
                  )}
                </optgroup>
              )}
            </select>
            
            <small className="form-help">
              Select a common JSONPath or switch to custom mode to write your own.
              {exemplarDocument && ` Found ${extractedPaths.length} paths in exemplar document.`}
            </small>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={customPath}
              onChange={handleCustomPathChange}
              className={`form-input ${!isValidPath && customPath ? 'error' : ''}`}
              placeholder="$.info.title"
              required
            />
            
            <small className="form-help">
              Enter a JSONPath expression (e.g., $.info.title, $.paths[*][*].summary)
              {!isValidPath && customPath && (
                <span className="error-text"> - Invalid JSONPath syntax</span>
              )}
            </small>
          </div>
        )}
      </div>

      {value && (
        <div className="jsonpath-preview">
          <strong>Selected Path:</strong> <code>{value}</code>
          {!isValidPath && (
            <div className="error-text">
              ⚠️ This JSONPath may have syntax issues
            </div>
          )}
        </div>
      )}

      <div className="jsonpath-help">
        <details>
          <summary>JSONPath Syntax Help</summary>
          <div className="help-content">
            <ul>
              <li><code>$</code> - Root element</li>
              <li><code>.property</code> - Child property</li>
              <li><code>[*]</code> - All array elements</li>
              <li><code>[0]</code> - First array element</li>
              <li><code>['property']</code> - Property with special characters</li>
              <li><code>..</code> - Recursive descent</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default JSONPathSelector;
