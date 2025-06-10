import React, { useState, useMemo } from 'react';

const JSONTreeViewer = ({ data, highlightedPath = null, onPathHighlighted = null }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [highlightedNodeInfo, setHighlightedNodeInfo] = useState(null);

  // Parse JSON and create a tree structure with line numbers
  const parseJSONToTree = (obj) => {
    const nodes = [];
    let lineCounter = { current: 1 };

    const addNode = (key, value, nodePath, nodeLevel, isLast = false) => {
      const nodeId = nodePath;
      const isExpandable = typeof value === 'object' && value !== null;
      const isExpanded = expandedNodes.has(nodeId);

      nodes.push({
        id: nodeId,
        key,
        value,
        level: nodeLevel,
        lineNumber: lineCounter.current++,
        isExpandable,
        isExpanded,
        isLast,
        type: getValueType(value)
      });

      // If expanded and has children, recursively add child nodes
      if (isExpanded && isExpandable) {
        const entries = Array.isArray(value) 
          ? value.map((item, index) => [index, item])
          : Object.entries(value);

        entries.forEach(([childKey, childValue], index) => {
          const childPath = `${nodePath}.${childKey}`;
          const isLastChild = index === entries.length - 1;
          addNode(childKey, childValue, childPath, nodeLevel + 1, isLastChild);
        });
      }
    };

    if (typeof obj === 'object' && obj !== null) {
      const entries = Array.isArray(obj) 
        ? obj.map((item, index) => [index, item])
        : Object.entries(obj);

      entries.forEach(([key, value], index) => {
        const nodePath = String(key);
        const isLast = index === entries.length - 1;
        addNode(key, value, nodePath, 0, isLast);
      });
    } else {
      addNode('root', obj, 'root', 0);
    }

    return nodes;
  };

  const getValueType = (value) => {
    if (value === null) return 'null';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Auto-expand first 2 levels on initial load
  useMemo(() => {
    if (data && expandedNodes.size === 0) {
      const autoExpand = new Set();
      const addAutoExpand = (obj, path = '', level = 0) => {
        if (level < 2 && typeof obj === 'object' && obj !== null) {
          const entries = Array.isArray(obj) 
            ? obj.map((item, index) => [index, item])
            : Object.entries(obj);

          entries.forEach(([key, value]) => {
            const nodePath = path ? `${path}.${key}` : String(key);
            if (typeof value === 'object' && value !== null) {
              autoExpand.add(nodePath);
              addAutoExpand(value, nodePath, level + 1);
            }
          });
        }
      };
      addAutoExpand(data);
      setExpandedNodes(autoExpand);
    }
  }, [data]);

  // Helper function to check if a path exists in the data
  const pathExists = (pathArray, dataObj) => {
    let current = dataObj;
    for (const segment of pathArray) {
      if (current && typeof current === 'object' && segment in current) {
        current = current[segment];
      } else {
        return false;
      }
    }
    return true;
  };

  // Helper function to find the closest existing parent path
  const findClosestParentPath = (pathArray, dataObj) => {
    // Try progressively shorter paths until we find one that exists
    for (let i = pathArray.length; i > 0; i--) {
      const testPath = pathArray.slice(0, i);
      if (pathExists(testPath, dataObj)) {
        return testPath;
      }
    }
    // If no path exists, return empty array (root level)
    return [];
  };

  // Handle highlighted path changes
  React.useEffect(() => {
    if (highlightedPath && highlightedPath.length > 0 && data) {
      let actualPath = highlightedPath;
      let isFallback = false;
      
      // Check if the exact path exists, if not find the closest parent
      if (!pathExists(highlightedPath, data)) {
        actualPath = findClosestParentPath(highlightedPath, data);
        isFallback = true;
        console.log(`Path ${highlightedPath.join('.')} not found, using closest parent: ${actualPath.join('.')}`);
      }
      
      // Convert path array to node ID
      const targetNodeId = actualPath.length > 0 ? actualPath.join('.') : 'root';
      
      // Store node ID and fallback status for CSS class application
      setHighlightedNodeInfo({ nodeId: targetNodeId, isFallback });
      
      // Expand all parent nodes in the path
      const newExpanded = new Set(expandedNodes);
      let currentPath = '';
      
      actualPath.forEach((segment, index) => {
        if (index === 0) {
          currentPath = String(segment);
        } else {
          currentPath += '.' + segment;
        }
        
        // Add all paths to expanded nodes (including the target if it's expandable)
        newExpanded.add(currentPath);
      });
      
      setExpandedNodes(newExpanded);
      
      // Scroll to the highlighted element after a short delay to allow rendering
      setTimeout(() => {
        const element = document.querySelector(`[data-node-id="${targetNodeId}"]`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          // Notify parent that highlighting is complete
          if (onPathHighlighted) {
            onPathHighlighted(targetNodeId, actualPath, highlightedPath);
          }
        } else {
          console.warn(`Element with node ID "${targetNodeId}" not found in DOM`);
        }
      }, 100);
    } else {
      setHighlightedNodeInfo(null);
    }
  }, [highlightedPath, onPathHighlighted, data, expandedNodes]);

  const renderValue = (value, type) => {
    switch (type) {
      case 'string':
        return <span className="json-string">"{value}"</span>;
      case 'number':
        return <span className="json-number">{value}</span>;
      case 'boolean':
        return <span className="json-boolean">{String(value)}</span>;
      case 'null':
        return <span className="json-null">null</span>;
      case 'array':
        return <span className="json-bracket">[{value.length === 0 ? '' : '...'}]</span>;
      case 'object':
        const keys = Object.keys(value);
        return <span className="json-bracket">{`{${keys.length === 0 ? '' : '...'}}`}</span>;
      default:
        return <span className="json-value">{String(value)}</span>;
    }
  };

  const getIndentation = (level) => {
    return '  '.repeat(level);
  };

  const nodes = useMemo(() => {
    if (!data) return [];
    return parseJSONToTree(data);
  }, [data, expandedNodes]);

  if (!data) {
    return (
      <div className="json-tree-empty">
        <p>No JSON data to display</p>
      </div>
    );
  }

  return (
    <div className="json-tree-viewer">
      <div className="json-tree-content">
        {nodes.map((node) => {
          const isHighlighted = highlightedNodeInfo && highlightedNodeInfo.nodeId === node.id;
          const isFallback = isHighlighted && highlightedNodeInfo.isFallback;
          return (
            <div 
              key={`${node.id}-${node.lineNumber}`} 
              className={`json-tree-line ${isHighlighted ? 'highlighted' : ''} ${isFallback ? 'fallback' : ''}`}
              data-node-id={node.id}
            >
              <div className="line-number-container">
                <span className="line-number">{node.lineNumber}</span>
                {node.isExpandable ? (
                  <button
                    className="expand-arrow"
                    onClick={() => toggleNode(node.id)}
                    title={node.isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {node.isExpanded ? '▼' : '▶'}
                  </button>
                ) : (
                  <span className="expand-arrow-placeholder"></span>
                )}
              </div>
              <div className="json-content">
                <span className="indentation">{getIndentation(node.level)}</span>
                {node.key !== 'root' && (
                  <>
                    <span className="json-key">"{node.key}"</span>
                    <span className="json-colon">: </span>
                  </>
                )}
                {renderValue(node.value, node.type)}
                {!node.isLast && node.level > 0 && <span className="json-comma">,</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JSONTreeViewer;
