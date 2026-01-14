
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  RotateCcw, 
  Image as ImageIcon, 
  Palette, 
  Zap, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { processImages, generateLUTData, LUT_SIZE } from './services/colorProcessor';
import { analyzeColorGrading } from './services/geminiService';

const App: React.FC = () => {
  const [refImage, setRefImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ref' | 'source') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (type === 'ref') setRefImage(result);
        else setSourceImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const runGrading = useCallback(async () => {
    if (!refImage || !sourceImage) return;

    setIsProcessing(true);
    setError(null);
    try {
      const processedDataUrl = await processImages(sourceImage, refImage, intensity / 100);
      setPreviewImage(processedDataUrl);
      
      // AI analysis - Triggered only when reference image changes or first load
      if (!aiAnalysis) {
        const analysis = await analyzeColorGrading(refImage);
        setAiAnalysis(analysis);
      }
    } catch (err) {
      setError('Failed to process color grading. Ensure images are valid.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [refImage, sourceImage, intensity, aiAnalysis]);

  useEffect(() => {
    if (refImage && sourceImage) {
      const timer = setTimeout(runGrading, 300);
      return () => clearTimeout(timer);
    }
  }, [refImage, sourceImage, intensity, runGrading]);

  const downloadLUT = () => {
    if (!refImage || !sourceImage) return;
    
    // Generating LUT logic
    const lutContent = generateLUTData(sourceImage, refImage, intensity / 100);
    const blob = new Blob([lutContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina_grade_${new Date().getTime()}.cube`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setRefImage(null);
    setSourceImage(null);
    setPreviewImage(null);
    setAiAnalysis(null);
    setIntensity(100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              LuminaLUT <span className="text-sm font-normal text-neutral-500 ml-1">v1.0</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={reset}
              className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={downloadLUT}
              disabled={!previewImage}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-600/20"
            >
              <Download className="w-4 h-4" />
              Export .cube
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Controls */}
        <div className="lg:col-span-4 space-y-6">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Inputs</h2>
            
            <div className="space-y-4">
              <label className="block group">
                <span className="block text-sm mb-2 text-neutral-300">Reference Grade</span>
                <div className={`relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden
                  ${refImage ? 'border-indigo-500/50' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'}`}>
                  {refImage ? (
                    <img src={refImage} alt="Ref" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                      <span className="text-xs text-neutral-500">Drop reference image</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'ref')} />
                </div>
              </label>

              <label className="block group">
                <span className="block text-sm mb-2 text-neutral-300">Source Footage Preview</span>
                <div className={`relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden
                  ${sourceImage ? 'border-indigo-500/50' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'}`}>
                  {sourceImage ? (
                    <img src={sourceImage} alt="Source" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                      <span className="text-xs text-neutral-500">Drop source image</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'source')} />
                </div>
              </label>
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Adjustment</h2>
              <span className="text-xs font-mono text-indigo-400">{intensity}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={intensity} 
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-neutral-600 font-medium">
              <span>NATURAL</span>
              <span>MATCHED</span>
            </div>
          </section>

          {aiAnalysis && (
            <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">AI Profile Analysis</h3>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed italic">
                "{aiAnalysis}"
              </p>
            </section>
          )}

          <div className="bg-neutral-900/30 p-4 rounded-xl space-y-2 border border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-400">
              <Info className="w-4 h-4" />
              <span className="text-xs font-semibold">Technical Specs</span>
            </div>
            <ul className="text-[11px] text-neutral-500 space-y-1 list-disc pl-4">
              <li>LUT Resolution: {LUT_SIZE}x{LUT_SIZE}x{LUT_SIZE}</li>
              <li>Algorithm: RGB 1D-Histogram Matching</li>
              <li>Interpolation: Linear</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Previews */}
        <div className="lg:col-span-8 space-y-6">
          <section className="flex flex-col h-full gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Real-time Preview</h2>
              {isProcessing && (
                <div className="flex items-center gap-2 text-indigo-500 animate-pulse">
                  <Zap className="w-3 h-3 fill-current" />
                  <span className="text-[10px] font-bold">CALCULATING KERNEL...</span>
                </div>
              )}
            </div>
            
            <div className="relative flex-1 bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex items-center justify-center min-h-[400px]">
              {previewImage ? (
                <div className="w-full h-full flex flex-col p-4 gap-4">
                   <div className="relative flex-1 rounded-lg overflow-hidden border border-neutral-800 group">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white/80 font-mono">
                      RESULT_FINAL
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto">
                    <Palette className="w-6 h-6 text-neutral-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-neutral-400 font-medium">No preview available</p>
                    <p className="text-neutral-600 text-sm">Upload both reference and source to begin grading</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
                <div className={`p-2 rounded-full ${refImage ? 'bg-green-500/10 text-green-500' : 'bg-neutral-800 text-neutral-600'}`}>
                  {refImage ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-300">REF IMAGE</h4>
                  <p className="text-[10px] text-neutral-500">{refImage ? 'Sample Loaded' : 'Awaiting input'}</p>
                </div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
                <div className={`p-2 rounded-full ${sourceImage ? 'bg-green-500/10 text-green-500' : 'bg-neutral-800 text-neutral-600'}`}>
                  {sourceImage ? <CheckCircle2 className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-300">SRC IMAGE</h4>
                  <p className="text-[10px] text-neutral-500">{sourceImage ? 'Sample Loaded' : 'Awaiting input'}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default App;
