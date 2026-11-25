import React, { useRef } from 'react';
import {
  Hash,
  Grid,
  Maximize2,
  Image as ImageIcon,
  Type,
  Sliders,
  AlertTriangle,
  Upload,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { LabelConfig } from '../types';
import { DEFAULT_LOGO_SVG } from '../utils/defaultLogo';

interface ConfigPanelProps {
  config: LabelConfig;
  onChange: (updated: Partial<LabelConfig>) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Space calculation validations
  const isLandscape = config.pageOrientation === 'landscape';
  const pageW = isLandscape ? config.pageHeightCm : config.pageWidthCm;
  const pageH = isLandscape ? config.pageWidthCm : config.pageHeightCm;

  const totalLabelW = config.cols * config.labelWidthCm + (config.cols - 1) * config.spacingXCm;
  const totalLabelH = config.rows * config.labelHeightCm + (config.rows - 1) * config.spacingYCm;

  const availW = pageW - config.marginLeftCm - config.marginRightCm;
  const availH = pageH - config.marginTopCm - config.marginBottomCm;

  const widthOverflow = totalLabelW > availW + 0.05;
  const heightOverflow = totalLabelH > availH + 0.05;
  const hasOverflow = widthOverflow || heightOverflow;

  const labelsPerPage = config.rows * config.cols;
  const totalPages = Math.ceil(config.totalLabels / labelsPerPage);
  const textAreaH = Math.max(0, config.labelHeightCm - config.imageHeightCm);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        onChange({
          logoImageBase64: evt.target.result,
          logoFileName: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    onChange({
      logoImageBase64: DEFAULT_LOGO_SVG,
      logoFileName: 'logo_sicosa.svg',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-6 overflow-y-auto max-h-[calc(100vh-6rem)]">
      {/* Header Summary */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-slate-800 text-base">Parámetros de Etiquetas</h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          {labelsPerPage} por hoja ({totalPages} {totalPages === 1 ? 'diapositiva' : 'diapositivas'})
        </span>
      </div>

      {/* Overflow warning banner */}
      {hasOverflow && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Atención: Las etiquetas exceden el área imprimible</p>
            <p className="mt-0.5 text-amber-700">
              {widthOverflow && `Ancho necesario: ${totalLabelW.toFixed(2)} cm (Disponible: ${availW.toFixed(2)} cm). `}
              {heightOverflow && `Alto necesario: ${totalLabelH.toFixed(2)} cm (Disponible: ${availH.toFixed(2)} cm).`}
            </p>
          </div>
        </div>
      )}

      {/* 1. NUMBERING & QUANTITY */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Hash className="w-4 h-4 text-amber-500" />
          <span>Numeración y Conteo</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Número Inicial
            </label>
            <input
              type="number"
              value={config.startNumber}
              onChange={(e) => onChange({ startNumber: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Total de Etiquetas
            </label>
            <input
              type="number"
              min={1}
              max={10000}
              value={config.totalLabels}
              onChange={(e) => onChange({ totalLabels: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Prefijo</label>
            <input
              type="text"
              placeholder="Ej: SIC-"
              value={config.prefix}
              onChange={(e) => onChange({ prefix: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Sufijo</label>
            <input
              type="text"
              placeholder="Ej: -A"
              value={config.suffix}
              onChange={(e) => onChange({ suffix: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Relleno Ceros</label>
            <select
              value={config.padZeros}
              onChange={(e) => onChange({ padZeros: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value={0}>Normal (20900)</option>
              <option value={5}>5 dígitos (00123)</option>
              <option value={6}>6 dígitos (000123)</option>
              <option value={8}>8 dígitos (00000123)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. GRID & PAGE SETUP */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Grid className="w-4 h-4 text-amber-500" />
          <span>Distribución (Filas × Columnas)</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Filas ({config.rows})
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={config.rows}
              onChange={(e) => onChange({ rows: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Columnas ({config.cols})
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={config.cols}
              onChange={(e) => onChange({ cols: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Orientación
            </label>
            <select
              value={config.pageOrientation}
              onChange={(e) => onChange({ pageOrientation: e.target.value as 'portrait' | 'landscape' })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="portrait">Vertical (Carta 21.59 × 27.94 cm)</option>
              <option value="landscape">Horizontal (Carta 27.94 × 21.59 cm)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Márgenes (cm)
            </label>
            <input
              type="number"
              step="0.05"
              min={0}
              value={config.marginLeftCm}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                onChange({
                  marginLeftCm: val,
                  marginRightCm: val,
                  marginTopCm: val,
                  marginBottomCm: val,
                });
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. LABEL DIMENSIONS */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Maximize2 className="w-4 h-4 text-amber-500" />
            <span>Dimensiones de Etiqueta (cm)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {config.labelWidthCm} × {config.labelHeightCm} cm
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Ancho (cm)</label>
            <input
              type="number"
              step="0.01"
              value={config.labelWidthCm}
              onChange={(e) => onChange({ labelWidthCm: parseFloat(e.target.value) || 0.5 })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Alto Total (cm)</label>
            <input
              type="number"
              step="0.01"
              value={config.labelHeightCm}
              onChange={(e) => onChange({ labelHeightCm: parseFloat(e.target.value) || 0.5 })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Alto Imagen (cm)</label>
            <input
              type="number"
              step="0.01"
              max={config.labelHeightCm}
              value={config.imageHeightCm}
              onChange={(e) => onChange({ imageHeightCm: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center justify-between">
          <span className="text-slate-500">Área para número / texto:</span>
          <span className="font-mono font-bold text-slate-800">{textAreaH.toFixed(2)} cm de alto</span>
        </div>
      </div>

      {/* 4. LOGO & BRANDING */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>Logo / Imagen</span>
          </div>
          <button
            onClick={handleResetLogo}
            className="text-[11px] text-slate-500 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Usar SICOSA</span>
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-16 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
            {config.logoImageBase64 ? (
              <img
                src={config.logoImageBase64}
                alt="Logo preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-[10px] text-slate-400">Sin logo</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-800 truncate">
              {config.logoFileName || 'logo1.jpg'}
            </p>
            <p className="text-[11px] text-slate-400">PNG, JPG o SVG</p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-amber-600" />
            <span>Cambiar</span>
          </button>
        </div>
      </div>

      {/* 5. TYPOGRAPHY & BORDER */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Type className="w-4 h-4 text-amber-500" />
          <span>Tipografía y Bordes</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Tamaño de Fuente (pt)
            </label>
            <input
              type="number"
              min={8}
              max={72}
              value={config.fontSizePt}
              onChange={(e) => onChange({ fontSizePt: parseInt(e.target.value) || 12 })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Tipografía
            </label>
            <select
              value={config.fontFamily}
              onChange={(e) => onChange({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="Arial">Arial (Equivalente Helvetica)</option>
              <option value="Calibri">Calibri</option>
              <option value="Segoe UI">Segoe UI</option>
              <option value="Courier New">Courier New (Monospaced)</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.fontBold}
              onChange={(e) => onChange({ fontBold: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-slate-300"
            />
            <span className="text-xs font-medium text-slate-700">Texto en Negrita</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showBorder}
              onChange={(e) => onChange({ showBorder: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-slate-300"
            />
            <span className="text-xs font-medium text-slate-700">Borde de Etiqueta</span>
          </label>
        </div>
      </div>
    </div>
  );
};
