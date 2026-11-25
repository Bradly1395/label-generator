import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { LabelConfig } from '../types';

interface SlidePreviewProps {
  config: LabelConfig;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({ config }) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredLabel, setHoveredLabel] = useState<{
    row: number;
    col: number;
    num: string;
  } | null>(null);

  const isLandscape = config.pageOrientation === 'landscape';
  const pageW = isLandscape ? config.pageHeightCm : config.pageWidthCm;
  const pageH = isLandscape ? config.pageWidthCm : config.pageHeightCm;

  const labelsPerPage = config.rows * config.cols;
  const totalPages = Math.max(1, Math.ceil(config.totalLabels / labelsPerPage));

  // Ensure valid current page
  const activePage = Math.min(currentPage, totalPages - 1);

  // Calculate numbers for current slide
  const pageStartNumber = config.startNumber + activePage * labelsPerPage;

  // Format number
  const formatNumber = (n: number) => {
    let s = n.toString();
    if (config.padZeros > 0) {
      s = s.padStart(config.padZeros, '0');
    }
    return `${config.prefix || ''}${s}${config.suffix || ''}`;
  };

  // Dimensions in scale for preview rendering
  const scale = 36 * zoomLevel; // pixels per cm at 100% zoom
  const canvasWidthPx = pageW * scale;
  const canvasHeightPx = pageH * scale;

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Top Toolbar */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Slide Pagination */}
        <div className="flex items-center gap-2">
          <button
            id="prev-slide-btn"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={activePage === 0}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Diapositiva anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-slate-700 px-2">
            Diapositiva {activePage + 1} de {totalPages}
          </span>

          <button
            id="next-slide-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={activePage >= totalPages - 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Diapositiva siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
            (Etiquetas {pageStartNumber} a {Math.min(config.startNumber + config.totalLabels - 1, pageStartNumber + labelsPerPage - 1)})
          </span>
        </div>

        {/* Zoom & Metadata */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
              title="Reducir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-medium text-slate-600 px-2 min-w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-600 hover:text-slate-900 rounded ml-0.5"
              title="Zoom normal (100%)"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-200/70">
        <div
          id="slide-sheet-canvas"
          style={{
            width: `${canvasWidthPx}px`,
            height: `${canvasHeightPx}px`,
          }}
          className="bg-white shadow-xl rounded-sm border border-slate-300 relative transition-all duration-150 select-none shrink-0"
        >
          {/* Printable Margin Box Guidelines (subtle dashed line) */}
          <div
            style={{
              top: `${config.marginTopCm * scale}px`,
              left: `${config.marginLeftCm * scale}px`,
              right: `${config.marginRightCm * scale}px`,
              bottom: `${config.marginBottomCm * scale}px`,
            }}
            className="absolute pointer-events-none border border-dashed border-sky-300/60 rounded-xs"
          />

          {/* Render Labels Grid */}
          {Array.from({ length: config.rows }).map((_, rIndex) => {
            return (
              <React.Fragment key={`row-${rIndex}`}>
                {Array.from({ length: config.cols }).map((_, cIndex) => {
                  const labelIndexOnPage = rIndex * config.cols + cIndex;
                  const itemNumber = pageStartNumber + labelIndexOnPage;
                  const isOutOfBounds = itemNumber > config.startNumber + config.totalLabels - 1;

                  if (isOutOfBounds) return null;

                  const xPx = (config.marginLeftCm + cIndex * (config.labelWidthCm + config.spacingXCm)) * scale;
                  const yPx = (config.marginTopCm + rIndex * (config.labelHeightCm + config.spacingYCm)) * scale;
                  const wPx = config.labelWidthCm * scale;
                  const hPx = config.labelHeightCm * scale;
                  const imgHPx = config.imageHeightCm * scale;
                  const textHPx = Math.max(0, hPx - imgHPx);

                  const formattedNumber = formatNumber(itemNumber);

                  return (
                    <div
                      key={`label-${rIndex}-${cIndex}`}
                      style={{
                        position: 'absolute',
                        left: `${xPx}px`,
                        top: `${yPx}px`,
                        width: `${wPx}px`,
                        height: `${hPx}px`,
                        borderColor: config.borderColor || '#000000',
                        borderWidth: config.showBorder ? `${Math.max(1, (config.borderWidthPt || 0.8) * 0.75 * zoomLevel)}px` : '0px',
                        borderStyle: 'solid',
                      }}
                      onMouseEnter={() =>
                        setHoveredLabel({
                          row: rIndex + 1,
                          col: cIndex + 1,
                          num: formattedNumber,
                        })
                      }
                      onMouseLeave={() => setHoveredLabel(null)}
                      className="bg-white flex flex-col items-center justify-between overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-500 hover:z-20 transition-shadow"
                    >
                      {/* Logo Section */}
                      {config.logoImageBase64 && config.imageHeightCm > 0 && (
                        <div
                          style={{
                            height: `${imgHPx}px`,
                            width: '100%',
                          }}
                          className="flex items-center justify-center p-0.5 overflow-hidden"
                        >
                          <img
                            src={config.logoImageBase64}
                            alt="Logo"
                            className="max-h-full max-w-full object-contain pointer-events-none"
                          />
                        </div>
                      )}

                      {/* Number Section */}
                      <div
                        style={{
                          height: `${textHPx}px`,
                          width: '100%',
                          fontSize: `${config.fontSizePt * 0.9 * (scale / 36)}px`,
                          fontFamily: config.fontFamily || 'Arial',
                          fontWeight: config.fontBold ? 'bold' : 'normal',
                          color: config.fontColor || '#000000',
                          lineHeight: 1,
                        }}
                        className="flex items-center justify-center text-center font-sans tracking-tight px-0.5 select-none"
                      >
                        <span>{formattedNumber}</span>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="bg-white px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <span>
            Hoja Carta: <strong className="text-slate-700">{pageW} × {pageH} cm</strong>
          </span>
          <span>
            Etiqueta: <strong className="text-slate-700">{config.labelWidthCm} × {config.labelHeightCm} cm</strong>
          </span>
        </div>

        {hoveredLabel ? (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-md border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              Etiqueta <strong>#{hoveredLabel.num}</strong> (Fila {hoveredLabel.row}, Columna {hoveredLabel.col})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Info className="w-3.5 h-3.5" />
            <span>Pasa el cursor sobre una etiqueta para inspeccionar</span>
          </div>
        )}
      </div>
    </div>
  );
};
