import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import FormatToggle from './FormatToggle.jsx';
import ModeToggle from './ModeToggle.jsx';
import RuleTable from './RuleTable.jsx';
import RuleForm from './RuleForm.jsx';
import OpenAPIUploader from './OpenAPIUploader.jsx';
import { 
  convertFormat, 
  parseContent, 
  validateFormat, 
  detectFormat,
  getPreferredFormat,
  setPreferredFormat 
} from '../utils/formatUtils.js';

const RulesetForm = ({ ruleset, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
    rules: [],
  });
  const [rulesText, setRulesText] = useState('');
  const [editorFormat, setEditorFormat] = useState(getPreferredFormat());
  const [editMode, setEditMode] = useState('basic');
  const [error, setError] = useState('');
  const [formatError, setFormatError] = useState('');
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [exemplarDocument, setExemplarDocument] = useState(null);

  useEffect(() => {
    if (ruleset) {
      setFormData({
        name: ruleset.name || '',
        description: ruleset.description || '',
        active: ruleset.active !== undefined ? ruleset.active : true,
        rules: ruleset.rules || [],
      });
      
      // Convert rules to preferred format for editing
      if (ruleset.rules && ruleset.rules.length > 0) {
        try {
          const jsonText = JSON.stringify(ruleset.rules, null, 2);
          if (editorFormat === 'yaml') {
            setRulesText(convertFormat(jsonText, 'json', 'yaml'));
          } else {
            setRulesText(jsonText);
          }
        } catch (err) {
          setRulesText('');
        }
      }
    }
  }, [ruleset, editorFormat]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRulesChange = (value) => {
    setRulesText(value || '');
    setFormatError('');
    
    // Validate format in real-time
    if (value && value.trim()) {
      const validation = validateFormat(value, editorFormat);
      if (!validation.isValid) {
        setFormatError(validation.error);
      }
    }
  };

  const handleFormatChange = (newFormat) => {
    setFormatError('');
    
    try {
      if (rulesText.trim()) {
        // Convert current content to new format
        const convertedText = convertFormat(rulesText, editorFormat, newFormat);
        setRulesText(convertedText);
      }
      setEditorFormat(newFormat);
      setPreferredFormat(newFormat);
    } catch (err) {
      setFormatError(`Error converting to ${newFormat.toUpperCase()}: ${err.message}`);
    }
  };

  const handleAddRule = (ruleName, ruleObject) => {
    const newRules = { ...formData.rules };
    newRules[ruleName] = ruleObject;
    
    setFormData(prev => ({ ...prev, rules: newRules }));
    updateRulesText(newRules);
    setShowRuleForm(false);
    setEditingRule(null);
  };

  const handleEditRule = (ruleName, ruleObject) => {
    const newRules = { ...formData.rules };
    
    // If rule name changed, delete old and add new
    if (editingRule?.name !== ruleName) {
      delete newRules[editingRule.name];
    }
    
    newRules[ruleName] = ruleObject;
    
    setFormData(prev => ({ ...prev, rules: newRules }));
    updateRulesText(newRules);
    setShowRuleForm(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (ruleName) => {
    if (confirm(`Are you sure you want to delete the rule "${ruleName}"?`)) {
      const newRules = { ...formData.rules };
      delete newRules[ruleName];
      
      setFormData(prev => ({ ...prev, rules: newRules }));
      updateRulesText(newRules);
    }
  };

  const updateRulesText = (rules) => {
    try {
      const jsonText = JSON.stringify(rules, null, 2);
      if (editorFormat === 'yaml') {
        setRulesText(convertFormat(jsonText, 'json', 'yaml'));
      } else {
        setRulesText(jsonText);
      }
    } catch (err) {
      console.error('Error updating rules text:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setFormatError('');

    try {
      let submitData = {
        name: formData.name,
        description: formData.description,
        active: formData.active,
      };
      
      if (editMode === 'basic') {
        // In basic mode, use the rules from formData (governance format)
        submitData.rules = formData.rules;
      } else {
        // In advanced mode, parse from text editor
        if (rulesText.trim()) {
          const parsed = parseContent(rulesText, editorFormat);
          if (parsed !== null) {
            // Check if this looks like a Spectral ruleset
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
              // Check for Spectral format indicators
              const hasSpectralRules = parsed.rules && 
                typeof parsed.rules === 'object' && 
                !Array.isArray(parsed.rules) &&
                Object.keys(parsed.rules).length > 0;
              
              const hasSpectralProperties = parsed.formats || parsed.extends || parsed.parserOptions;
              
              if (hasSpectralRules || hasSpectralProperties) {
                // This is a Spectral ruleset - pass the entire structure
                submitData = {
                  name: formData.name,
                  description: parsed.description || formData.description,
                  active: formData.active,
                  rules: parsed.rules || {},
                  // Include Spectral-specific properties
                  ...(parsed.formats && { formats: parsed.formats }),
                  ...(parsed.aliases && { aliases: parsed.aliases }),
                  ...(parsed.functionsDir && { functionsDir: parsed.functionsDir }),
                  ...(parsed.extends && { extends: parsed.extends }),
                  ...(parsed.parserOptions && { parserOptions: parsed.parserOptions }),
                };
              } else {
                // Regular governance format
                submitData.rules = Array.isArray(parsed) ? parsed : [parsed];
              }
            } else {
              // Array or other format
              submitData.rules = Array.isArray(parsed) ? parsed : [parsed];
            }
          } else {
            submitData.rules = [];
          }
        } else {
          submitData.rules = [];
        }
      }

      onSubmit(submitData);
    } catch (err) {
      setError(`Invalid ${editorFormat.toUpperCase()} format in rules: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '1000px', width: '95%', maxHeight: '95vh' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {ruleset ? 'Edit Ruleset' : 'Create New Ruleset'}
          </h2>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter ruleset name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-input form-textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter ruleset description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                name="active"
                className="form-checkbox"
                checked={formData.active}
                onChange={handleInputChange}
              />
              Active
            </label>
          </div>

          {/* OpenAPI Document Upload (Basic Mode Only) */}
          {editMode === 'basic' && (
            <div className="form-group">
              <OpenAPIUploader
                onDocumentUploaded={setExemplarDocument}
                currentDocument={exemplarDocument}
              />
            </div>
          )}

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="rules">
                Rules
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ModeToggle 
                  mode={editMode} 
                  onModeChange={setEditMode}
                  disabled={isLoading}
                />
                {editMode === 'advanced' && (
                  <FormatToggle 
                    format={editorFormat} 
                    onFormatChange={handleFormatChange}
                    disabled={isLoading}
                  />
                )}
              </div>
            </div>
            
            {formatError && editMode === 'advanced' && (
              <div className="error" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                {formatError}
              </div>
            )}
            
            {editMode === 'basic' ? (
              <RuleTable
                rules={formData.rules}
                onEditRule={(ruleName, rule) => {
                  // Prevent any form submission or event bubbling
                  setEditingRule({ name: ruleName, rule });
                  setShowRuleForm(true);
                }}
                onDeleteRule={handleDeleteRule}
                onAddRule={() => {
                  setEditingRule(null);
                  setShowRuleForm(true);
                }}
              />
            ) : (
              <div>
                <div style={{ height: '500px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <Editor
                    height="100%"
                    defaultLanguage={editorFormat}
                    language={editorFormat}
                    value={rulesText}
                    onChange={handleRulesChange}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                    }}
                  />
                </div>
                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                  Enter rules in {editorFormat.toUpperCase()} format. You can paste either YAML or JSON content and switch formats using the toggle above. Leave empty for no rules.
                </small>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (ruleset ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>

      {/* Rule Form Modal */}
      {showRuleForm && (
        <div 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <RuleForm
            rule={editingRule?.rule}
            ruleName={editingRule?.name}
            onSubmit={editingRule ? handleEditRule : handleAddRule}
            onCancel={() => {
              setShowRuleForm(false);
              setEditingRule(null);
            }}
            exemplarDocument={exemplarDocument}
          />
        </div>
      )}
    </div>
  );
};

export default RulesetForm;
