import React, { useState, useEffect } from 'react';

const VACUUM_FUNCTIONS = {
  truthy: {
    description: 'Checks that a property has been defined or exists',
    options: {},
    example: 'Ensures a field is not null, undefined, or empty'
  },
  falsy: {
    description: 'Checks that a property has not been defined or does not exist',
    options: {},
    example: 'Ensures a field is null, undefined, or empty'
  },
  defined: {
    description: 'Checks an element has been defined',
    options: {},
    example: 'Ensures a property exists in the object'
  },
  undefined: {
    description: 'Checks an element has NOT been defined',
    options: {},
    example: 'Ensures a property does not exist in the object'
  },
  pattern: {
    description: 'Check values against regular expressions',
    options: {
      match: { type: 'string', description: 'Regular expression pattern to match', required: false },
      notMatch: { type: 'string', description: 'Regular expression pattern that should NOT match', required: false }
    },
    example: 'Validates format like email, URL, or custom patterns',
    customValidation: true
  },
  casing: {
    description: 'Checks value is using the correct case',
    options: {
      type: { 
        type: 'select', 
        description: 'Case type to enforce',
        required: true,
        values: ['camelCase', 'PascalCase', 'snake_case', 'kebab-case', 'SCREAMING_SNAKE_CASE', 'MACRO_CASE']
      }
    },
    example: 'Enforces naming conventions for properties'
  },
  length: {
    description: 'Checks the length of a value meets a minimum or maximum length',
    options: {
      min: { type: 'number', description: 'Minimum length', required: false },
      max: { type: 'number', description: 'Maximum length', required: false }
    },
    example: 'Validates string length or array size'
  },
  enumeration: {
    description: 'Checks enum values match supplied values',
    options: {
      values: { type: 'array', description: 'Array of allowed values', required: true }
    },
    example: 'Restricts values to a predefined list'
  },
  alphabetical: {
    description: 'Checks values in an array are alphabetically ordered',
    options: {
      keyedBy: { type: 'string', description: 'Property to sort by (for objects)', required: false }
    },
    example: 'Ensures arrays are sorted alphabetically'
  },
  schema: {
    description: 'Checks that an object matches a supplied JSON Schema',
    options: {
      schema: { type: 'object', description: 'JSON Schema to validate against', required: true }
    },
    example: 'Validates complex object structures'
  },
  oasSchema: {
    description: 'Checks that a specification is a valid OpenAPI schema',
    options: {},
    example: 'Validates OpenAPI specification format'
  },
  xor: {
    description: 'Checks that one or another property is set, but not both',
    options: {
      properties: { type: 'array', description: 'Array of property names', required: true }
    },
    example: 'Ensures exactly one of multiple properties is defined'
  }
};

const FunctionSelector = ({ selectedFunction, functionOptions, onFunctionChange, onOptionsChange }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customFunction, setCustomFunction] = useState('');

  useEffect(() => {
    // Auto-switch to custom mode if the function doesn't match any preset
    if (selectedFunction && selectedFunction.trim()) {
      const isPresetFunction = VACUUM_FUNCTIONS.hasOwnProperty(selectedFunction);
      
      if (!isPresetFunction) {
        setShowCustom(true);
        setCustomFunction(selectedFunction);
      }
    }
  }, [selectedFunction]);

  const handleFunctionChange = (e) => {
    const newFunction = e.target.value;
    onFunctionChange(newFunction);
    setShowCustom(false);
    setCustomFunction('');
    // Reset options when function changes
    onOptionsChange({});
  };

  const handleCustomFunctionChange = (e) => {
    const newFunction = e.target.value;
    setCustomFunction(newFunction);
    onFunctionChange(newFunction);
    // Reset options when function changes
    onOptionsChange({});
  };

  const toggleCustom = () => {
    setShowCustom(!showCustom);
    if (!showCustom) {
      setCustomFunction(selectedFunction || '');
    }
  };

  const handleOptionChange = (optionName, value) => {
    const newOptions = { ...functionOptions };
    
    if (value === '' || value === null || value === undefined) {
      delete newOptions[optionName];
    } else {
      newOptions[optionName] = value;
    }
    
    onOptionsChange(newOptions);
  };

  const renderOptionInput = (optionName, optionConfig) => {
    const currentValue = functionOptions[optionName] || '';

    switch (optionConfig.type) {
      case 'select':
        return (
          <select
            value={currentValue}
            onChange={(e) => handleOptionChange(optionName, e.target.value)}
            className="form-input"
            required={optionConfig.required}
          >
            <option value="">Select {optionName}</option>
            {optionConfig.values.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleOptionChange(optionName, parseInt(e.target.value) || '')}
            className="form-input"
            placeholder={`Enter ${optionName}`}
            required={optionConfig.required}
          />
        );

      case 'array':
        return (
          <textarea
            value={Array.isArray(currentValue) ? currentValue.join('\n') : currentValue}
            onChange={(e) => {
              const lines = e.target.value.split('\n').filter(line => line.trim());
              handleOptionChange(optionName, lines);
            }}
            className="form-input form-textarea"
            placeholder="Enter one value per line"
            rows={3}
            required={optionConfig.required}
          />
        );

      case 'object':
        return (
          <textarea
            value={typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : currentValue}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleOptionChange(optionName, parsed);
              } catch {
                handleOptionChange(optionName, e.target.value);
              }
            }}
            className="form-input form-textarea"
            placeholder="Enter JSON object"
            rows={4}
            required={optionConfig.required}
          />
        );

      default:
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleOptionChange(optionName, e.target.value)}
            className="form-input"
            placeholder={`Enter ${optionName}`}
            required={optionConfig.required}
          />
        );
    }
  };

  const selectedFunctionConfig = selectedFunction ? VACUUM_FUNCTIONS[selectedFunction] : null;

  return (
    <div className="function-selector">
      <div className="form-group">
        <label className="form-label">
          Function *
          <button
            type="button"
            className="help-button"
            onClick={() => setShowHelp(!showHelp)}
            title="Show function help"
          >
            ?
          </button>
          <button
            type="button"
            className="help-button"
            onClick={toggleCustom}
            title="Toggle between preset and custom function"
          >
            {showCustom ? '📋' : '✏️'}
          </button>
        </label>

        {!showCustom ? (
          <div>
            <select
              value={selectedFunction || ''}
              onChange={handleFunctionChange}
              className="form-input"
              required
            >
              <option value="">Select a function</option>
              {Object.entries(VACUUM_FUNCTIONS).map(([name, config]) => (
                <option key={name} value={name}>
                  {name} - {config.description}
                </option>
              ))}
            </select>
            <small className="form-help">
              Select a built-in function or switch to custom mode to enter your own function name.
            </small>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={customFunction}
              onChange={handleCustomFunctionChange}
              className="form-input"
              placeholder="Enter custom function name (e.g., oasComponentDescriptions)"
              required
            />
            <small className="form-help">
              Enter a custom function name. This can be any valid function identifier.
            </small>
          </div>
        )}
      </div>

      {showHelp && selectedFunctionConfig && (
        <div className="function-help">
          <h4>{selectedFunction}</h4>
          <p><strong>Description:</strong> {selectedFunctionConfig.description}</p>
          <p><strong>Example:</strong> {selectedFunctionConfig.example}</p>
          {Object.keys(selectedFunctionConfig.options).length > 0 && (
            <div>
              <strong>Available Options:</strong>
              <ul>
                {Object.entries(selectedFunctionConfig.options).map(([name, config]) => (
                  <li key={name}>
                    <code>{name}</code> ({config.type}){config.required && ' *'}: {config.description}
                  </li>
                ))}
              </ul>
              {selectedFunction === 'pattern' && (
                <p><strong>Note:</strong> At least one of "match" or "notMatch" must be specified.</p>
              )}
            </div>
          )}
        </div>
      )}

      {selectedFunctionConfig && Object.keys(selectedFunctionConfig.options).length > 0 && (
        <div className="function-options">
          <h4>Function Options</h4>
          {Object.entries(selectedFunctionConfig.options).map(([optionName, optionConfig]) => (
            <div key={optionName} className="form-group">
              <label className="form-label">
                {optionName}
                {optionConfig.required && ' *'}
              </label>
              <small className="form-help">{optionConfig.description}</small>
              {renderOptionInput(optionName, optionConfig)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FunctionSelector;
