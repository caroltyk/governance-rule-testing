import React, { useState, useRef } from 'react';
import { parseContent, validateFormat } from '../utils/formatUtils.js';

const OpenAPIUploader = ({ onDocumentUploaded, currentDocument }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [documentInfo, setDocumentInfo] = useState(null);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (currentDocument) {
      analyzeDocument(currentDocument);
    }
  }, [currentDocument]);

  const analyzeDocument = (doc) => {
    try {
      const parsed = typeof doc === 'string' ? JSON.parse(doc) : doc;
      
      const info = {
        title: parsed.info?.title || 'Unknown API',
        version: parsed.info?.version || 'Unknown',
        openApiVersion: parsed.openapi || parsed.swagger || 'Unknown',
        pathCount: Object.keys(parsed.paths || {}).length,
        operationCount: Object.values(parsed.paths || {}).reduce((count, pathItem) => {
          return count + Object.keys(pathItem).filter(key => 
            ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'].includes(key)
          ).length;
        }, 0),
        hasComponents: !!(parsed.components || parsed.definitions),
        hasSecuritySchemes: !!(parsed.components?.securitySchemes || parsed.securityDefinitions)
      };
      
      setDocumentInfo(info);
    } catch (err) {
      setDocumentInfo(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setUploading(true);
    setError('');

    try {
      // Validate file type
      const validExtensions = ['.json', '.yaml', '.yml'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        throw new Error('Please upload a JSON or YAML file');
      }

      // Read file content
      const content = await readFileContent(file);
      
      // Detect format and validate
      const format = fileExtension === '.json' ? 'json' : 'yaml';
      const validation = validateFormat(content, format);
      
      if (!validation.isValid) {
        throw new Error(`Invalid ${format.toUpperCase()} format: ${validation.error}`);
      }

      // Parse content
      const parsed = parseContent(content, format);
      
      // Validate it's an OpenAPI document
      if (!parsed.openapi && !parsed.swagger) {
        throw new Error('This does not appear to be a valid OpenAPI/Swagger document');
      }

      // Success - pass the document to parent
      onDocumentUploaded(parsed, file.name);
      analyzeDocument(parsed);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleRemoveDocument = () => {
    onDocumentUploaded(null, null);
    setDocumentInfo(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlUpload = async () => {
    const url = prompt('Enter OpenAPI document URL:');
    if (!url) return;

    setUploading(true);
    setError('');

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const content = await response.text();
      
      // Try to detect format from content
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        try {
          parsed = parseContent(content, 'yaml');
        } catch {
          throw new Error('Could not parse as JSON or YAML');
        }
      }

      // Validate it's an OpenAPI document
      if (!parsed.openapi && !parsed.swagger) {
        throw new Error('This does not appear to be a valid OpenAPI/Swagger document');
      }

      onDocumentUploaded(parsed, url);
      analyzeDocument(parsed);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="openapi-uploader">
      <div className="form-group">
        <label className="form-label">
          Exemplar OpenAPI Document
          <span className="optional-label">(Optional)</span>
        </label>
        
        {!currentDocument ? (
          <div>
            <div
              className={`upload-dropzone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              
              {uploading ? (
                <div className="upload-status">
                  <div className="spinner"></div>
                  <p>Processing document...</p>
                </div>
              ) : (
                <div className="upload-content">
                  <div className="upload-icon">📄</div>
                  <p><strong>Drop your OpenAPI document here</strong></p>
                  <p>or click to browse files</p>
                  <small>Supports JSON and YAML formats</small>
                </div>
              )}
            </div>
            
            <div className="upload-actions">
              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={handleUrlUpload}
                disabled={uploading}
              >
                Load from URL
              </button>
            </div>
          </div>
        ) : (
          <div className="document-info">
            <div className="document-header">
              <div className="document-icon">✅</div>
              <div className="document-details">
                <h4>{documentInfo?.title}</h4>
                <p>Version {documentInfo?.version} • OpenAPI {documentInfo?.openApiVersion}</p>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-small"
                onClick={handleRemoveDocument}
                title="Remove document"
              >
                Remove
              </button>
            </div>
            
            {documentInfo && (
              <div className="document-stats">
                <div className="stat">
                  <strong>{documentInfo.pathCount}</strong>
                  <span>Paths</span>
                </div>
                <div className="stat">
                  <strong>{documentInfo.operationCount}</strong>
                  <span>Operations</span>
                </div>
                <div className="stat">
                  <strong>{documentInfo.hasComponents ? 'Yes' : 'No'}</strong>
                  <span>Components</span>
                </div>
                <div className="stat">
                  <strong>{documentInfo.hasSecuritySchemes ? 'Yes' : 'No'}</strong>
                  <span>Security</span>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error-text" style={{ marginTop: '0.5rem' }}>
            {error}
          </div>
        )}

        <small className="form-help">
          Upload an OpenAPI document to get JSONPath suggestions and test your rules against real API specifications.
        </small>
      </div>
    </div>
  );
};

export default OpenAPIUploader;
