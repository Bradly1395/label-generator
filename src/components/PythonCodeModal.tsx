import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, ArrowRight } from 'lucide-react';
import { LabelConfig } from '../types';
import { generatePythonScript } from '../utils/pythonScriptGenerator';

interface PythonCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LabelConfig;
}

export const PythonCodeModal: React.FC<PythonCodeModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonScript = generatePythonScript(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPy = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'etiquetas_sicosa_pptx.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Script de Python Convertido (.pptx)
              </h3>
              <p className="text-xs text-slate-400">
                Usa <code className="text-amber-400">python-pptx</code> para crear presentaciones de PowerPoint nativas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Callout */}
        <div className="px-6 py-3 bg-slate-800/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
              reportlab (PDF)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              python-pptx (PowerPoint .pptx)
            </span>
          </div>

          <div className="text-slate-400">
            Instalación: <code className="text-sky-300 bg-slate-800 px-1.5 py-0.5 rounded">pip install python-pptx Pillow</code>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-auto p-6 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed select-text">
          <pre className="whitespace-pre">{pythonScript}</pre>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            El script sincroniza automáticamente los parámetros actuales del panel.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPy}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .py</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
