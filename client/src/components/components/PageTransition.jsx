import React from 'react';

const PageTransition = React.memo(({ children }) => {
  return (
    <div
      style={{
        animation: 'pageFadeIn 0.25s ease-out forwards',
      }}
    >
      {children}
    </div>
  );
});

export default PageTransition;
