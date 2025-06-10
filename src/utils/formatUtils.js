import yaml from 'js-yaml';

/**
 * Convert YAML string to JSON string
 * @param {string} yamlString - YAML content as string
 * @returns {string} JSON string
 */
export const yamlToJson = (yamlString) => {
  try {
    if (!yamlString.trim()) return '';
    const parsed = yaml.load(yamlString);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw new Error(`YAML parsing error: ${error.message}`);
  }
};

/**
 * Convert JSON string to YAML string
 * @param {string} jsonString - JSON content as string
 * @returns {string} YAML string
 */
export const jsonToYaml = (jsonString) => {
  try {
    if (!jsonString.trim()) return '';
    const parsed = JSON.parse(jsonString);
    return yaml.dump(parsed, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
  } catch (error) {
    throw new Error(`JSON parsing error: ${error.message}`);
  }
};

/**
 * Auto-detect format of content string
 * @param {string} content - Content to analyze
 * @returns {'yaml'|'json'|'unknown'} Detected format
 */
export const detectFormat = (content) => {
  if (!content.trim()) return 'unknown';
  
  // Try JSON first (stricter format)
  try {
    JSON.parse(content);
    return 'json';
  } catch (jsonError) {
    // Try YAML
    try {
      yaml.load(content);
      return 'yaml';
    } catch (yamlError) {
      return 'unknown';
    }
  }
};

/**
 * Validate content for specific format
 * @param {string} content - Content to validate
 * @param {'yaml'|'json'} format - Expected format
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
export const validateFormat = (content, format) => {
  if (!content.trim()) {
    return { isValid: true };
  }

  try {
    if (format === 'json') {
      JSON.parse(content);
    } else if (format === 'yaml') {
      yaml.load(content);
    }
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: `Invalid ${format.toUpperCase()}: ${error.message}` 
    };
  }
};

/**
 * Convert content between formats
 * @param {string} content - Content to convert
 * @param {'yaml'|'json'} fromFormat - Source format
 * @param {'yaml'|'json'} toFormat - Target format
 * @returns {string} Converted content
 */
export const convertFormat = (content, fromFormat, toFormat) => {
  if (!content.trim()) return '';
  if (fromFormat === toFormat) return content;

  if (fromFormat === 'yaml' && toFormat === 'json') {
    return yamlToJson(content);
  } else if (fromFormat === 'json' && toFormat === 'yaml') {
    return jsonToYaml(content);
  }
  
  throw new Error(`Unsupported conversion: ${fromFormat} to ${toFormat}`);
};

/**
 * Parse content regardless of format and return as JavaScript object
 * @param {string} content - Content to parse
 * @param {'yaml'|'json'} format - Expected format
 * @returns {any} Parsed JavaScript object
 */
export const parseContent = (content, format) => {
  if (!content.trim()) return null;

  if (format === 'json') {
    return JSON.parse(content);
  } else if (format === 'yaml') {
    return yaml.load(content);
  }
  
  throw new Error(`Unsupported format: ${format}`);
};

/**
 * Get user's preferred format from localStorage
 * @returns {'yaml'|'json'} Preferred format
 */
export const getPreferredFormat = () => {
  try {
    return localStorage.getItem('ruleset-editor-format') || 'yaml';
  } catch {
    return 'yaml';
  }
};

/**
 * Save user's preferred format to localStorage
 * @param {'yaml'|'json'} format - Format to save
 */
export const setPreferredFormat = (format) => {
  try {
    localStorage.setItem('ruleset-editor-format', format);
  } catch {
    // Ignore localStorage errors
  }
};
