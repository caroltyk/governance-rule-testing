import React, { useState, useEffect } from 'react';
import FunctionSelector from './FunctionSelector.jsx';
import JSONPathSelector from './JSONPathSelector.jsx';

const RuleForm = ({ rule, ruleName, onSubmit, onCancel, exemplarDocument }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'error',
    given: '',
    field: '',
    function: '',
    functionOptions: {},
    message: '',
    recommended: false,
    formats: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (rule && ruleName) {
      // Parse existing rule
      const parsedRule = {
        name: ruleName,
        description: rule.description || '',
        severity: rule.severity || 'error',
        given: rule.given || '',
        field: rule.then?.field || '',
        function: rule.then?.function || '',
        functionOptions: rule.then?.functionOptions || {},
        message: rule.message || '',
        recommended: rule.recommended || false,
        formats: rule.formats || []
      };
      setFormData(parsedRule);
    }
  }, [rule, ruleName]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFormatsChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      formats: checked 
        ? [...prev.formats, value]
        : prev.formats.filter(f => f !== value)
    }));
  };

  const handleJSONPathChange = (path) => {
    setFormData(prev => ({ ...prev, given: path }));
    if (errors.given) {
      setErrors(prev => ({ ...prev, given: null }));
    }
  };

  const handleFunctionChange = (func) => {
    setFormData(prev => ({ 
      ...prev, 
      function: func,
      functionOptions: {} // Reset options when function changes
    }));
    if (errors.function) {
      setErrors(prev => ({ ...prev, function: null }));
    }
  };

  const handleFunctionOptionsChange = (options) => {
    setFormData(prev => ({ ...prev, functionOptions: options }));
    // Clear function options error when user makes changes
    if (errors.functionOptions) {
      setErrors(prev => ({ ...prev, functionOptions: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Rule name is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      newErrors.name = 'Rule name can only contain letters, numbers, hyphens, and underscores';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.given.trim()) {
      newErrors.given = 'JSONPath target is required';
    }

    if (!formData.function) {
      newErrors.function = 'Function is required';
    }

    // Custom validation for pattern function
    if (formData.function === 'pattern') {
      const hasMatch = formData.functionOptions.match && formData.functionOptions.match.trim();
      const hasNotMatch = formData.functionOptions.notMatch && formData.functionOptions.notMatch.trim();
      
      if (!hasMatch && !hasNotMatch) {
        newErrors.functionOptions = 'Pattern function requires either "match" or "notMatch" option to be specified';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Build the rule object in vacuum format
    const ruleObject = {
      description: formData.description,
      severity: formData.severity,
      given: formData.given,
      then: {
        field: formData.field || undefined,
        function: formData.function,
        ...(Object.keys(formData.functionOptions).length > 0 && {
          functionOptions: formData.functionOptions
        })
      }
    };

    // Add optional fields
    if (formData.message) {
      ruleObject.message = formData.message;
    }
    
    if (formData.recommended) {
      ruleObject.recommended = true;
    }
    
    if (formData.formats.length > 0) {
      ruleObject.formats = formData.formats;
    }

    onSubmit(formData.name, ruleObject);
  };

  const generateRulePreview = () => {
    const ruleObject = {
      [formData.name || 'rule-name']: {
        description: formData.description || 'Rule description',
        severity: formData.severity,
        given: formData.given || '$.path',
        then: {
          ...(formData.field && { field: formData.field }),
          function: formData.function || 'truthy',
          ...(Object.keys(formData.functionOptions).length > 0 && {
            functionOptions: formData.functionOptions
          })
        },
        ...(formData.message && { message: formData.message }),
        ...(formData.recommended && { recommended: true }),
        ...(formData.formats.length > 0 && { formats: formData.formats })
      }
    };

    return `rules:\n${JSON.stringify(ruleObject, null, 2).slice(1, -1)}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '800px', width: '95%', maxHeight: '95vh' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {rule ? 'Edit Rule' : 'Create New Rule'}
          </h2>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rule-form-content">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Rule Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="my-validation-rule"
                  required
                />
                {errors.name && <div className="error-text">{errors.name}</div>}
                <small className="form-help">
                  Use lowercase letters, numbers, hyphens, and underscores only
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  className={`form-input form-textarea ${errors.description ? 'error' : ''}`}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this rule validates"
                  rows={3}
                  required
                />
                {errors.description && <div className="error-text">{errors.description}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="severity">
                  Severity *
                </label>
                <select
                  id="severity"
                  name="severity"
                  className="form-input"
                  value={formData.severity}
                  onChange={handleInputChange}
                  required
                >
                  <option value="error">Error - Blocks deployment</option>
                  <option value="warn">Warning - Shows warning</option>
                  <option value="info">Info - Informational only</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">
                  Custom Message
                </label>
                <input
                  type="text"
                  id="message"
                  name="message"
                  className="form-input"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Custom error message (optional)"
                />
                <small className="form-help">
                  Override the default error message
                </small>
              </div>
            </div>

            {/* Target Configuration */}
            <div className="form-section">
              <h3>Target Configuration</h3>
              
              <JSONPathSelector
                value={formData.given}
                onChange={handleJSONPathChange}
                exemplarDocument={exemplarDocument}
              />
              {errors.given && <div className="error-text">{errors.given}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="field">
                  Field (Optional)
                </label>
                <input
                  type="text"
                  id="field"
                  name="field"
                  className="form-input"
                  value={formData.field}
                  onChange={handleInputChange}
                  placeholder="Specific field to validate (leave empty for whole object)"
                />
                <small className="form-help">
                  Specify a field within the target object, or leave empty to validate the entire object
                </small>
              </div>
            </div>

            {/* Function Configuration */}
            <div className="form-section">
              <h3>Validation Function</h3>
              
              <FunctionSelector
                selectedFunction={formData.function}
                functionOptions={formData.functionOptions}
                onFunctionChange={handleFunctionChange}
                onOptionsChange={handleFunctionOptionsChange}
              />
              {errors.function && <div className="error-text">{errors.function}</div>}
              {errors.functionOptions && <div className="error-text">{errors.functionOptions}</div>}
            </div>

            {/* Additional Options */}
            <div className="form-section">
              <h3>Additional Options</h3>
              
              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    name="recommended"
                    className="form-checkbox"
                    checked={formData.recommended}
                    onChange={handleInputChange}
                  />
                  Recommended Rule
                </label>
                <small className="form-help">
                  Mark this rule as recommended for best practices
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">OpenAPI Formats</label>
                <div className="checkbox-group">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      value="oas2"
                      className="form-checkbox"
                      checked={formData.formats.includes('oas2')}
                      onChange={handleFormatsChange}
                    />
                    OpenAPI 2.0 (Swagger)
                  </label>
                  <label className="form-label">
                    <input
                      type="checkbox"
                      value="oas3"
                      className="form-checkbox"
                      checked={formData.formats.includes('oas3')}
                      onChange={handleFormatsChange}
                    />
                    OpenAPI 3.x
                  </label>
                </div>
                <small className="form-help">
                  Select which OpenAPI formats this rule applies to (leave empty for all)
                </small>
              </div>
            </div>

            {/* Rule Preview */}
            <div className="form-section">
              <h3>Rule Preview</h3>
              <div className="rule-preview">
                <pre><code>{generateRulePreview()}</code></pre>
              </div>
              <small className="form-help">
                This is how your rule will appear in the YAML ruleset
              </small>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {rule ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RuleForm;
