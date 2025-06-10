import React, { useState } from 'react';
import RulesetViewer from './RulesetViewer.jsx';

const RulesetCard = ({ ruleset, onEdit, onDelete }) => {
  const [showViewer, setShowViewer] = useState(false);

  const handleEdit = () => {
    onEdit(ruleset);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the ruleset "${ruleset.name}"?`)) {
      onDelete(ruleset.id);
    }
  };

  const handleViewDetails = () => {
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
  };

  return (
    <>
      <div className="card ruleset-card">
        <h3>{ruleset.name}</h3>
        <p>{ruleset.description || 'No description provided'}</p>
        
        <div className={`ruleset-status ${ruleset.active ? 'active' : 'inactive'}`}>
          {ruleset.active ? 'Active' : 'Inactive'}
        </div>
        
        {ruleset.created_at && (
          <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
            Created: {new Date(ruleset.created_at).toLocaleDateString()}
          </p>
        )}
        
        {ruleset.rules && ruleset.rules.length > 0 ? (
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            {ruleset.rules.length} rule{ruleset.rules.length !== 1 ? 's' : ''}
          </p>
        ) : (
          <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '1rem', fontStyle: 'italic' }}>
            No rules defined
          </p>
        )}
        
        <div className="ruleset-actions">
          <button className="btn btn-outline" onClick={handleViewDetails}>
            View Details
          </button>
          <button className="btn btn-secondary" onClick={handleEdit}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {showViewer && (
        <RulesetViewer
          ruleset={ruleset}
          onClose={handleCloseViewer}
        />
      )}
    </>
  );
};

export default RulesetCard;
