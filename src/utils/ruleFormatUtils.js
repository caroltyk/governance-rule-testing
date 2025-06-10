import yaml from 'js-yaml';

/**
 * Parses a rule definition from YAML string to object
 * @param {string} definitionYaml - YAML string containing the rule definition
 * @returns {object} Parsed rule object
 */
export const parseRuleDefinition = (definitionYaml) => {
  try {
    return yaml.load(definitionYaml);
  } catch (error) {
    console.error('Error parsing rule definition:', error);
    return null;
  }
};

/**
 * Converts governance backend format rules to display format
 * @param {Array} governanceRules - Array of rules from governance backend
 * @returns {object} Rules in display format (key-value pairs)
 */
export const convertGovernanceRulesToDisplay = (governanceRules) => {
  if (!Array.isArray(governanceRules)) {
    return {};
  }

  const displayRules = {};
  
  governanceRules.forEach((governanceRule) => {
    const { id, name, active, definition } = governanceRule;
    
    // Parse the YAML definition
    const parsedRule = parseRuleDefinition(definition);
    
    if (parsedRule) {
      // Use the name from metadata as the key
      displayRules[name] = {
        ...parsedRule,
        // Add metadata for reference
        _metadata: {
          id,
          name,
          active
        }
      };
    }
  });

  return displayRules;
};

/**
 * Converts governance backend format rules to table format
 * @param {Array} governanceRules - Array of rules from governance backend
 * @returns {Array} Rules in table format with metadata
 */
export const convertGovernanceRulesToTable = (governanceRules) => {
  if (!Array.isArray(governanceRules)) {
    return [];
  }

  const result = governanceRules.map((governanceRule) => {
    const { id, name, active, definition } = governanceRule;
    
    // Parse the YAML definition
    const parsedRule = parseRuleDefinition(definition);
    
    if (parsedRule) {
      const tableRule = {
        // Use name from metadata
        name: name,
        // Include parsed rule properties
        description: parsedRule.description,
        severity: parsedRule.severity,
        given: parsedRule.given,
        message: parsedRule.message,
        then: parsedRule.then,
        // Include metadata
        _metadata: {
          id,
          name,
          active
        }
      };
      return tableRule;
    }
    
    // Return a fallback if parsing fails
    const fallbackRule = {
      name: name,
      description: 'Error parsing rule definition',
      severity: 'error',
      given: 'N/A',
      message: '',
      then: null,
      _metadata: {
        id,
        name,
        active
      }
    };
    return fallbackRule;
  }).filter(Boolean);
  
  return result;
};

/**
 * Converts a rule from display format back to governance backend format
 * @param {string} ruleName - Name of the rule
 * @param {object} rule - Rule object in display format
 * @param {object} metadata - Optional metadata (id, active status)
 * @returns {object} Rule in governance backend format
 */
export const convertRuleToGovernanceFormat = (ruleName, rule, metadata = {}) => {
  // Extract metadata if it exists in the rule
  const existingMetadata = rule._metadata || {};
  
  // Create a clean rule object without metadata
  const cleanRule = { ...rule };
  delete cleanRule._metadata;
  
  // Convert rule to YAML string
  const definitionYaml = yaml.dump(cleanRule, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });
  
  return {
    id: metadata.id || existingMetadata.id || null,
    name: metadata.name || existingMetadata.name || ruleName,
    active: metadata.active !== undefined ? metadata.active : (existingMetadata.active !== undefined ? existingMetadata.active : true),
    definition: definitionYaml
  };
};

/**
 * Detects if rules are in governance backend format
 * @param {any} rules - Rules data to check
 * @returns {boolean} True if in governance backend format
 */
export const isGovernanceBackendFormat = (rules) => {
  return Array.isArray(rules) && 
         rules.length > 0 && 
         rules[0].hasOwnProperty('id') && 
         rules[0].hasOwnProperty('name') && 
         rules[0].hasOwnProperty('definition');
};

/**
 * Converts rules array back to governance backend format
 * @param {Array} rulesArray - Array of rules in table format
 * @returns {Array} Rules in governance backend format
 */
export const convertTableRulesToGovernance = (rulesArray) => {
  if (!Array.isArray(rulesArray)) {
    return [];
  }
  
  return rulesArray.map(rule => {
    return convertRuleToGovernanceFormat(rule.name, rule, rule._metadata);
  });
};

/**
 * Converts display format rules back to governance backend format
 * @param {object} displayRules - Rules in display format (key-value pairs)
 * @returns {Array} Rules in governance backend format
 */
export const convertDisplayRulesToGovernance = (displayRules) => {
  if (!displayRules || typeof displayRules !== 'object') {
    return [];
  }
  
  return Object.entries(displayRules).map(([ruleName, rule]) => {
    return convertRuleToGovernanceFormat(ruleName, rule);
  });
};
