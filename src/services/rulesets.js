import api from './api.js';

export const rulesetService = {
  // Get all rulesets
  getRulesets: async (params = {}) => {
    const response = await api.get('/rulesets', { params });
    return response.data;
  },

  // Get a specific ruleset by ID
  getRuleset: async (id) => {
    const response = await api.get(`/rulesets/${id}`);
    return response.data;
  },

  // Create a new ruleset
  createRuleset: async (rulesetData) => {
    // Check if we have rules data that looks like a Spectral ruleset
    const hasSpectralRules = rulesetData.rules && 
      (typeof rulesetData.rules === 'object') && 
      !Array.isArray(rulesetData.rules) &&
      Object.keys(rulesetData.rules).length > 0;

    if (hasSpectralRules) {
      // Send as multipart form data with the Spectral ruleset as a file
      const formData = new FormData();
      formData.append('name', rulesetData.name || '');
      formData.append('description', rulesetData.description || '');
      formData.append('active', rulesetData.active !== undefined ? rulesetData.active : true);
      
      // Create a Spectral ruleset object and convert to file blob
      const spectralRuleset = {
        description: rulesetData.description || '',
        rules: rulesetData.rules
      };
      
      // Add any additional Spectral properties if they exist
      if (rulesetData.formats) spectralRuleset.formats = rulesetData.formats;
      if (rulesetData.aliases) spectralRuleset.aliases = rulesetData.aliases;
      if (rulesetData.functionsDir) spectralRuleset.functionsDir = rulesetData.functionsDir;
      
      const spectralBlob = new Blob([JSON.stringify(spectralRuleset, null, 2)], {
        type: 'application/json'
      });
      formData.append('ruleset_file', spectralBlob, 'ruleset.json');
      
      const response = await api.post('/rulesets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } else {
      // Send as JSON for non-Spectral rulesets (backward compatibility)
      const response = await api.post('/rulesets', rulesetData);
      return response.data;
    }
  },

  // Update an existing ruleset
  updateRuleset: async (id, rulesetData) => {
    // Check if we have rules data that looks like a Spectral ruleset
    const hasSpectralRules = rulesetData.rules && 
      (typeof rulesetData.rules === 'object') && 
      !Array.isArray(rulesetData.rules) &&
      Object.keys(rulesetData.rules).length > 0;

    if (hasSpectralRules) {
      // Send as multipart form data with the Spectral ruleset as a file
      const formData = new FormData();
      if (rulesetData.name !== undefined) formData.append('name', rulesetData.name);
      if (rulesetData.description !== undefined) formData.append('description', rulesetData.description);
      if (rulesetData.active !== undefined) formData.append('active', rulesetData.active);
      
      // Create a Spectral ruleset object and convert to file blob
      const spectralRuleset = {
        description: rulesetData.description || '',
        rules: rulesetData.rules
      };
      
      // Add any additional Spectral properties if they exist
      if (rulesetData.formats) spectralRuleset.formats = rulesetData.formats;
      if (rulesetData.aliases) spectralRuleset.aliases = rulesetData.aliases;
      if (rulesetData.functionsDir) spectralRuleset.functionsDir = rulesetData.functionsDir;
      
      const spectralBlob = new Blob([JSON.stringify(spectralRuleset, null, 2)], {
        type: 'application/json'
      });
      formData.append('file', spectralBlob, 'ruleset.json');
      
      const response = await api.put(`/rulesets/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } else {
      // Send as JSON for non-Spectral rulesets (backward compatibility)
      const response = await api.put(`/rulesets/${id}`, rulesetData);
      return response.data;
    }
  },

  // Delete a ruleset
  deleteRuleset: async (id) => {
    const response = await api.delete(`/rulesets/${id}`);
    return response.data;
  },

  // Evaluate APIs against a ruleset
  evaluateRuleset: async (evaluationData) => {
    const response = await api.post('/rulesets/evaluate', evaluationData);
    return response.data;
  },

  // Get all APIs
  getAPIs: async (params = {}) => {
    const response = await api.get('/apis', { params });
    return response.data;
  },

  // Get a specific API by ID
  getAPI: async (id) => {
    const response = await api.get(`/apis/${id}`);
    return response.data;
  },

  // Get all labels
  getLabels: async (params = {}) => {
    const response = await api.get('/labels/', { params });
    return response.data;
  },

  // Get a specific label by ID
  getLabel: async (id) => {
    const response = await api.get(`/labels/${id}/`);
    return response.data;
  },
};
