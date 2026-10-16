import React, { useEffect, useMemo, useState } from 'react';

export const CAR_PARTS = [];
const PATH_PATTERN = /<path\b[^>]*>/gi;
const BACKGROUND_PATH = /d=["']M0\s+305\.79/;

const CarInspectionDiagram = React.memo(({ value = {}, onChange, readOnly = false, className = '' }) => {
  const [svgMarkup, setSvgMarkup] = useState('');
  const [pathCount, setPathCount] = useState(0);
  const [hoveredPath, setHoveredPath] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/car.svg')
      .then(response => response.text())
      .then(source => {
        if (cancelled) return;
        let index = 0;
        const marked = source.replace(PATH_PATTERN, tag => {
          const ignored = BACKGROUND_PATH.test(tag);
          const pathId = `svg_path_${index}`;
          index += 1;
          return tag.replace(/\s*\/?>$/, ` data-inspection-path="${pathId}"${ignored ? ' data-inspection-background="true"' : ''}>`);
        });
        setPathCount(index);
        setSvgMarkup(marked.replace('<svg ', '<svg class="inspection-svg" '));
      })
      .catch(() => setSvgMarkup(''));
    return () => { cancelled = true; };
  }, []);

  const selectedPaths = useMemo(() => Object.keys(value).filter(key => key.startsWith('svg_path_') && value[key]), [value]);
  const allPaths = Object.fromEntries(Array.from({ length: pathCount }, (_, index) => [`svg_path_${index}`, true]));
  const selectedSelector = selectedPaths.map(id => `[data-inspection-path="${id}"]`).join(',');
  const hoverSelector = hoveredPath ? `[data-inspection-path="${hoveredPath}"]` : '';

  const findPath = event => event.target.closest?.('[data-inspection-path]:not([data-inspection-background])');
  const handleClick = event => {
    if (readOnly || !onChange) return;
    const path = findPath(event);
    if (path) {
      const id = path.getAttribute('data-inspection-path');
      onChange({ ...value, [id]: !value[id] });
    }
  };
  const handleMouseOver = event => {
    const path = findPath(event);
    setHoveredPath(path?.getAttribute('data-inspection-path') || null);
  };

  return (
    <div className={`relative select-none w-full ${className}`} dir="rtl">
      <style>{`
        .inspection-svg { display:block; width:100%; height:auto; background:#F1F5F9; }
        .inspection-svg [data-inspection-path]:not([data-inspection-background]) { transition:fill .14s ease, opacity .14s ease; cursor:pointer; }
        .inspection-svg [data-inspection-background] { pointer-events:none; }
        .inspection-svg [data-inspection-path]:not([data-inspection-background]):hover { fill:#FDE68A !important; opacity:.95; }
        ${selectedSelector} { fill:#F59E0B !important; opacity:.95; }
        ${hoverSelector} { fill:#FDE68A !important; opacity:1; }
        .inspection-svg.is-readonly [data-inspection-path] { cursor:default; }
      `}</style>

    </div>
  );
});

export default CarInspectionDiagram;
