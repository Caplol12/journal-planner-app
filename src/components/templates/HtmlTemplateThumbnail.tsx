import React, { useRef, useState, useEffect } from 'react';
import { injectHtmlSyncScript } from '../../utils/htmlTemplates';

interface HtmlTemplateThumbnailProps {
  htmlContent: string;
  title?: string;
  className?: string;
  virtualWidth?: number;
  virtualHeight?: number;
  interactive?: boolean;
}

export const HtmlTemplateThumbnail: React.FC<HtmlTemplateThumbnailProps> = ({
  htmlContent,
  title = 'Template Preview',
  className = '',
  virtualWidth = 920,
  virtualHeight = 1250,
  interactive = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.35);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      if (containerWidth > 0) {
        // Calculate the exact proportional scale factor to fit the virtual desktop width into the container
        const newScale = containerWidth / virtualWidth;
        setScale(newScale);
      }
    };

    updateScale();

    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateScale();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [virtualWidth]);

  const containerHeight = Math.round(virtualHeight * scale);
  const preparedDoc = injectHtmlSyncScript(htmlContent || '');

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-white rounded-xl shadow-xs ${className}`}
      style={{
        height: `${containerHeight}px`,
        maxHeight: `${containerHeight}px`,
      }}
    >
      <div
        className="absolute top-0 left-1/2"
        style={{
          width: `${virtualWidth}px`,
          height: `${virtualHeight}px`,
          marginLeft: `-${virtualWidth / 2}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          pointerEvents: interactive ? 'auto' : 'none',
        }}
      >
        <iframe
          srcDoc={preparedDoc}
          title={title}
          scrolling="no"
          tabIndex={-1}
          style={{
            width: `${virtualWidth}px`,
            height: `${virtualHeight}px`,
            border: 'none',
            display: 'block',
            backgroundColor: '#ffffff',
          }}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>

      {/* Subtle overlay to prevent accidental scroll captures when clicking on cards */}
      {!interactive && (
        <div className="absolute inset-0 bg-transparent cursor-pointer" />
      )}
    </div>
  );
};
