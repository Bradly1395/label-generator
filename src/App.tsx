import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Header, PRESETS } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { SlidePreview } from './components/SlidePreview';
import { PythonCodeModal } from './components/PythonCodeModal';
import { LabelConfig } from './types';
import { DEFAULT_LOGO_SVG } from './utils/defaultLogo';
import { generatePptxFile } from './utils/pptxGenerator';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const INITIAL_CONFIG: LabelConfig = {
  startNumber: 20900,
  totalLabels: 70,
  rows: 10,
  cols: 7,

  pageWidthCm: 21.59,
  pageHeightCm: 27.94,

  labelWidthCm: 2.88,
  labelHeightCm: 2.69,
  imageHeightCm: 1.6,

  marginTopCm: 0.5,
  marginBottomCm: 0.5,
  marginLeftCm: 0.5,
  marginRightCm: 0.5,

  spacingXCm: 0,
  spacingYCm: 0,

  fontSizePt: 22,
  fontFamily: 'Arial',
  fontColor: '#000000',
  fontBold: false,

  prefix: '',
  suffix: '',
  padZeros: 0,

  showBorder: true,
  borderWidthPt: 0.8,
  borderColor: '#000000',

  logoImageBase64: DEFAULT_LOGO_SVG,
  logoFileName: 'logo_sicosa.svg',

  pageOrientation: 'portrait',
};

export default function App() {
  const [config, setConfig] = useState<LabelConfig>(INITIAL_CONFIG);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string>('sicosa_default');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleConfigChange = (updated: Partial<LabelConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleSelectPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setConfig((prev) => ({ ...prev, ...found.config }));
      setActivePresetId(presetId);
    }
  };

  const handleReset = () => {
    setConfig(INITIAL_CONFIG);
    setActivePresetId('sicosa_default');
  };

  const handleGeneratePptx = async () => {
    try {
      setIsGenerating(true);
      await generatePptxFile(config);

      // Trigger confetti celebration on successful generation
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setNotification({
        type: 'success',
        message: '¡Presentación de PowerPoint (.pptx) descargada con éxito!',
      });
    } catch (err) {
      console.error('Error generating PPTX:', err);
      setNotification({
        type: 'error',
        message: 'Ocurrió un error al generar el archivo .pptx',
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased selection:bg-amber-500/30">
      {/* Top Header */}
      <Header
        onGeneratePptx={handleGeneratePptx}
        isGenerating={isGenerating}
        onOpenPythonCode={() => setIsPythonModalOpen(true)}
        onReset={handleReset}
        onSelectPreset={handleSelectPreset}
        activePresetId={activePresetId}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : 'bg-rose-900 text-rose-100 border-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Panel */}
        <div className="lg:col-span-4 xl:col-span-4">
          <ConfigPanel config={config} onChange={handleConfigChange} />
        </div>

        {/* Right Interactive Slide Canvas Preview */}
        <div className="lg:col-span-8 xl:col-span-8 h-[calc(100vh-8rem)] min-h-[600px]">
          <SlidePreview config={config} />
        </div>
      </main>

      {/* Python Code Converter Modal */}
      <PythonCodeModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        config={config}
      />
    </div>
  );
}
