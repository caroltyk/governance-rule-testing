import React from 'react';

const ModeToggle = ({ mode, onModeChange, disabled = false }) => {
  return (
    <div className="mode-toggle">
      <span className="mode-toggle-label">Mode:</span>
      <div className={`mode-toggle-switch ${disabled ? 'disabled' : ''}`}>
        <button
          type="button"
          className={`mode-toggle-option ${mode === 'basic' ? 'active' : ''}`}
          onClick={() => !disabled && onModeChange('basic')}
          disabled={disabled}
          title="User-friendly forms and table view"
        >
          Basic
        </button>
        <button
          type="button"
          className={`mode-toggle-option ${mode === 'advanced' ? 'active' : ''}`}
          onClick={() => !disabled && onModeChange('advanced')}
          disabled={disabled}
          title="Raw YAML/JSON editing"
        >
          Advanced
        </button>
      </div>
      <div className="mode-toggle-indicator">
        <span className={`mode-indicator ${mode}`}>
          {mode.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default ModeToggle;
