import React, { useState } from 'react';
import { useRulesets, useCreateRuleset, useUpdateRuleset, useDeleteRuleset } from '../hooks/useRulesets.js';
import RulesetCard from './RulesetCard.jsx';
import RulesetForm from './RulesetForm.jsx';

const RulesetList = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRuleset, setEditingRuleset] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const { data: rulesetsData, isLoading, error } = useRulesets();
  const createMutation = useCreateRuleset();
  const updateMutation = useUpdateRuleset();
  const deleteMutation = useDeleteRuleset();

  const rulesets = rulesetsData?.rulesets || [];

  const handleCreateNew = () => {
    setEditingRuleset(null);
    setShowForm(true);
  };

  const handleEdit = (ruleset) => {
    setEditingRuleset(ruleset);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRuleset(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingRuleset) {
        await updateMutation.mutateAsync({
          id: editingRuleset.id,
          data: formData,
        });
        setSuccessMessage('Ruleset updated successfully!');
      } else {
        await createMutation.mutateAsync(formData);
        setSuccessMessage('Ruleset created successfully!');
      }
      handleCloseForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving ruleset:', error);
    }
  };

  const handleDelete = async (rulesetId) => {
    try {
      await deleteMutation.mutateAsync(rulesetId);
      setSuccessMessage('Ruleset deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting ruleset:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading rulesets...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        Error loading rulesets: {error.message}
      </div>
    );
  }

  return (
    <div>
      {successMessage && (
        <div className="success">{successMessage}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Rulesets ({rulesets.length})</h2>
        <button className="btn btn-primary btn-large" onClick={handleCreateNew}>
          + Create New Ruleset
        </button>
      </div>

      {rulesets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No rulesets found</h3>
          <p>Create your first ruleset to get started with API governance.</p>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            Create Ruleset
          </button>
        </div>
      ) : (
        <div className="ruleset-grid">
          {rulesets.map((ruleset) => (
            <RulesetCard
              key={ruleset.id}
              ruleset={ruleset}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <RulesetForm
          ruleset={editingRuleset}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      )}
    </div>
  );
};

export default RulesetList;
