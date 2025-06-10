import React, { useState, useCallback } from 'react';

const ResizeHandle = ({ onResize, minWidth = 300, maxWidth = 800 }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = parseInt(document.documentElement.style.getPropertyValue('--api-spec-panel-width') || '400');

    const handleMouseMove = (e) => {
      const deltaX = startX - e.clientX; // Negative because we're resizing from the right
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
      
      document.documentElement.style.setProperty('--api-spec-panel-width', `${newWidth}px`);
      
      if (onResize) {
        onResize(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [onResize, minWidth, maxWidth]);

  return (
    <div 
      className={`resize-handle ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      title="Drag to resize API specification panel"
    >
      <div className="resize-handle-line"></div>
    </div>
  );
};

export default ResizeHandle;
