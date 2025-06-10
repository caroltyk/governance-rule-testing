import React from 'react';

const FormatToggle = ({ format, onFormatChange, disabled = false }) => {
  const handleToggle = () => {
    if (!disabled) {
      const newFormat = format === 'yaml' ? 'json' : 'yaml';
      onFormatChange(newFormat);
    }
  };

  return (
    <div className="format-toggle">
      <span className="format-toggle-label">Format:</span>
      <div className={`format-toggle-switch ${disabled ? 'disabled' : ''}`}>
        <button
          type="button"
          className={`format-toggle-option ${format === 'json' ? 'active' : ''}`}
          onClick={() => !disabled && onFormatChange('json')}
          disabled={disabled}
        >
          JSON
        </button>
        <button
          type="button"
          className={`format-toggle-option ${format === 'yaml' ? 'active' : ''}`}
          onClick={() => !disabled && onFormatChange('yaml')}
          disabled={disabled}
        >
          YAML
        </button>
      </div>
      <div className="format-toggle-indicator">
        <span className={`format-indicator ${format}`}>
          {format.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default FormatToggle;
