import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import FormatToggle from './FormatToggle.jsx';
import ModeToggle from './ModeToggle.jsx';
import RuleTable from './RuleTable.jsx';
import OpenAPIUploader from './OpenAPIUploader.jsx';
import { 
  convertFormat, 
  getPreferredFormat,
  setPreferredFormat 
} from '../utils/formatUtils.js';
import { 
  convertGovernanceRulesToDisplay, 
  isGovernanceBackendFormat 
} from '../utils/ruleFormatUtils.js';

const RulesetViewer = ({ ruleset, onClose }) => {
  const [viewFormat, setViewFormat] = useState(getPreferredFormat());
  const [viewMode, setViewMode] = useState('basic');
  const [rulesContent, setRulesContent] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [exemplarDocument, setExemplarDocument] = useState(null);

  useEffect(() => {
    if (ruleset && ruleset.rules) {
      try {
        let contentToDisplay = ruleset.rules;
        
        // If rules are in governance backend format, convert for display
        if (isGovernanceBackendFormat(ruleset.rules)) {
          contentToDisplay = convertGovernanceRulesToDisplay(ruleset.rules);
        }
        
        const jsonContent = JSON.stringify(contentToDisplay, null, 2);
        if (viewFormat === 'yaml') {
          setRulesContent(convertFormat(jsonContent, 'json', 'yaml'));
        } else {
          setRulesContent(jsonContent);
        }
      } catch (err) {
        setRulesContent('// Error displaying rules');
      }
    } else {
      setRulesContent(viewFormat === 'yaml' ? '# No rules defined' : '// No rules defined');
    }
  }, [ruleset, viewFormat]);

  const handleFormatChange = (newFormat) => {
    setViewFormat(newFormat);
    setPreferredFormat(newFormat);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(rulesContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatCreatedDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '1000px', width: '95%', maxHeight: '95vh' }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Ruleset Details</h2>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              {ruleset.name}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          {/* Ruleset Metadata */}
          <div className="card" style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
              <div>
                <strong style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>Name:</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--font-size-sm)' }}>{ruleset.name}</p>
              </div>
              
              <div>
                <strong style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>Status:</strong>
                <div style={{ marginTop: '0.25rem' }}>
                  <span className={`ruleset-status ${ruleset.active ? 'active' : 'inactive'}`}>
                    {ruleset.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div>
                <strong style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>Rules Count:</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--font-size-sm)' }}>
                  {ruleset.rules ? ruleset.rules.length : 0} rule{(ruleset.rules?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div>
                <strong style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>Created:</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--font-size-sm)' }}>
                  {formatCreatedDate(ruleset.created_at)}
                </p>
              </div>
            </div>
            
            {ruleset.description && (
              <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)' }}>
                <strong style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>Description:</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                  {ruleset.description}
                </p>
              </div>
            )}
          </div>

          {/* OpenAPI Document Upload (Basic Mode Only) */}
          {viewMode === 'basic' && (
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <OpenAPIUploader
                onDocumentUploaded={setExemplarDocument}
                currentDocument={exemplarDocument}
              />
            </div>
          )}

          {/* Rules Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                Rules Configuration
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <ModeToggle 
                  mode={viewMode} 
                  onModeChange={setViewMode}
                />
                {viewMode === 'advanced' && (
                  <FormatToggle 
                    format={viewFormat} 
                    onFormatChange={handleFormatChange}
                  />
                )}
                <button 
                  className="btn btn-outline btn-small"
                  onClick={handleCopyToClipboard}
                  disabled={!rulesContent || rulesContent.includes('Error') || rulesContent.includes('No rules')}
                  title="Copy to clipboard"
                >
                  {copySuccess ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            {copySuccess && (
              <div className="success" style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                Rules copied to clipboard!
              </div>
            )}

            {viewMode === 'basic' ? (
              <RuleTable
                rules={ruleset.rules}
                readOnly={true}
                onEditRule={() => {}}
                onDeleteRule={() => {}}
                onAddRule={() => {}}
              />
            ) : (
              <div>
                <div style={{ height: '500px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }}>
                  <Editor
                    height="100%"
                    language={viewFormat}
                    value={rulesContent}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      folding: true,
                      lineNumbers: 'on',
                      renderWhitespace: 'selection',
                    }}
                    theme="vs"
                  />
                </div>
                
                <small style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-xs)', display: 'block' }}>
                  {ruleset.rules && ruleset.rules.length > 0 
                    ? `Viewing ${ruleset.rules.length} rule${ruleset.rules.length !== 1 ? 's' : ''} in ${viewFormat.toUpperCase()} format`
                    : 'No rules configured for this ruleset'
                  }
                </small>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

    </div>
  );
};

export default RulesetViewer;
