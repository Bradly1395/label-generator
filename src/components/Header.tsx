import React from 'react';
import { FileDown, Code2, RefreshCw, Presentation, Layers } from 'lucide-react';
import { PresetConfig } from '../types';

interface HeaderProps {
  onGeneratePptx: () => void;
  isGenerating: boolean;
  onOpenPythonCode: () => void;
  onReset: () => void;
  onSelectPreset: (presetId: string) => void;
  activePresetId: string;
}

export const PRESETS: PresetConfig[] = [
  {
    id: 'sicosa_default',
    name: 'SICOSA Original (70/pág)',
    description: '10 filas × 7 columnas, 2.88cm × 2.69cm, Letter',
    config: {
      startNumber: 20900,
      totalLabels: 70,
      rows: 10,
      cols: 7,
      labelWidthCm: 2.88,
      labelHeightCm: 2.69,
      imageHeightCm: 1.6,
      marginTopCm: 0.5,
      marginBottomCm: 0.5,
      marginLeftCm: 0.5,
      marginRightCm: 0.5,
      fontSizePt: 22,
      fontFamily: 'Arial',
      fontBold: false,
      showBorder: true,
      borderWidthPt: 0.8,
    },
  },
  {
    id: 'inventory_30',
    name: 'Inventario Mediano (30/pág)',
    description: '6 filas × 5 columnas, 4.0cm × 4.2cm',
    config: {
      startNumber: 1001,
      totalLabels: 60,
      rows: 6,
      cols: 5,
      labelWidthCm: 4.0,
      labelHeightCm: 4.2,
      imageHeightCm: 2.4,
      marginTopCm: 1.0,
      marginBottomCm: 1.0,
      marginLeftCm: 0.7,
      marginRightCm: 0.7,
      fontSizePt: 26,
      fontFamily: 'Arial',
      fontBold: true,
      showBorder: true,
      borderWidthPt: 1.0,
    },
  },
  {
    id: 'micro_88',
    name: 'Micro Etiquetas (88/pág)',
    description: '11 filas × 8 columnas, 2.5cm × 2.3cm',
    config: {
      startNumber: 50000,
      totalLabels: 88,
      rows: 11,
      cols: 8,
      labelWidthCm: 2.5,
      labelHeightCm: 2.3,
      imageHeightCm: 1.3,
      marginTopCm: 0.8,
      marginBottomCm: 0.8,
      marginLeftCm: 0.7,
      marginRightCm: 0.7,
      fontSizePt: 18,
      fontFamily: 'Arial',
      fontBold: false,
      showBorder: true,
      borderWidthPt: 0.7,
    },
  },
];

export const Header: React.FC<HeaderProps> = ({
  onGeneratePptx,
  isGenerating,
  onOpenPythonCode,
  onReset,
  onSelectPreset,
  activePresetId,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20 text-white">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight leading-none text-slate-100">
                Generador de Etiquetas PPTX
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                PowerPoint .pptx
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Convertidor de PDF ReportLab a diapositivas PowerPoint nativas
            </p>
          </div>
        </div>

        {/* Presets & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Preset Selector */}
          <div className="relative hidden md:flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <Layers className="w-4 h-4 text-slate-400 ml-2 mr-1" />
            <select
              value={activePresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-transparent text-xs text-slate-200 py-1 px-2 focus:outline-none cursor-pointer font-medium"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-800 text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Python Code View Button */}
          <button
            id="view-python-code-btn"
            onClick={onOpenPythonCode}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors shadow-sm"
            title="Ver y descargar código Python equivalente (python-pptx)"
          >
            <Code2 className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Código Python</span>
          </button>

          {/* Reset Button */}
          <button
            id="reset-config-btn"
            onClick={onReset}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Restablecer valores originales de SICOSA"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Primary Generate PPTX Button */}
          <button
            id="generate-pptx-btn"
            onClick={onGeneratePptx}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg shadow-md hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            <FileDown className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : ''}`} />
            <span>{isGenerating ? 'Generando...' : 'Descargar .PPTX'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
