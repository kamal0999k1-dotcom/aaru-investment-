import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { ChartIcon } from './components/icons/ChartIcon';
import { fileToBase64 } from './utils/fileUtils';
import { analyzeChartImage, getMarketContext } from './services/geminiService';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [marketContext, setMarketContext] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'upload' | 'results'>('upload');

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setAnalysis(null);
    setMarketContext(null);
    setError(null);
  }, []);

  const handleReset = useCallback(() => {
    setImageFile(null);
    setImageUrl(null);
    setAnalysis(null);
    setMarketContext(null);
    setError(null);
    setView('upload');
  }, []);

  const handleAnalyzeClick = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setIsScanning(true);
    setError(null);
    setAnalysis(null);
    setMarketContext(null);

    try {
      const base64Data = await fileToBase64(imageFile);
      
      // Step 1: Deep Analysis with Thinking
      const analysisResult = await analyzeChartImage(base64Data, imageFile.type);
      
      let parsed;
      try {
        parsed = JSON.parse(analysisResult);
      } catch (e) {
        throw new Error("Failed to parse analysis results.");
      }

      if (parsed.error) {
        setError(parsed.error);
        return;
      }

      setAnalysis(analysisResult);

      // Step 2: Market Context (Parallel)
      const context = parsed.ticker ? await getMarketContext(parsed.ticker) : null;

      setMarketContext(context);
      setView('results');

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 selection:bg-teal-100">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-50/50 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 border-b border-gray-200 backdrop-blur-md bg-white/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={handleReset}>
            <div className="w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-transform bg-white rounded-xl shadow-sm border border-gray-100">
              <svg viewBox="0 0 100 100" className="w-11 h-11" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 4 Green Bars */}
                <rect x="20" y="60" width="8" height="20" rx="1" fill="#10b981" />
                <rect x="35" y="45" width="8" height="35" rx="1" fill="#10b981" />
                <rect x="50" y="30" width="8" height="50" rx="1" fill="#10b981" />
                <rect x="65" y="15" width="8" height="65" rx="1" fill="#10b981" />
                
                {/* Gold Swoosh Arrow */}
                <path 
                  d="M15 75C15 75 30 95 85 55" 
                  stroke="#f59e0b" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M85 55L75 55M85 55L85 65" 
                  stroke="#f59e0b" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold tracking-tight text-[#1e3a8a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                AARU INVESTMENT PVT.LTD
              </h1>
              <p className="text-xs text-[#0d9488] font-bold tracking-[0.15em] mt-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                FUTURE OF TRADING
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-0">
        {view === 'upload' ? (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                {imageUrl ? (
                  <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
                      <img src={imageUrl} alt="Chart preview" className="w-full h-auto max-h-[60vh] object-contain" />
                      {isScanning && <div className="animate-scan" />}
                      <button 
                        onClick={handleReset} 
                        className="absolute top-4 right-4 bg-white/90 text-slate-900 rounded-full p-2 hover:bg-red-500 hover:text-white transition-all hover:scale-110 z-20 shadow-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={handleAnalyzeClick}
                      disabled={isLoading}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                        isLoading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-[#0d9488] text-white hover:bg-[#0f766e] hover:scale-[1.01] shadow-teal-500/20'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-3">
                              <svg className="animate-spin h-5 w-5 text-[#0d9488]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="text-slate-700">{isScanning ? 'Deep Scanning...' : 'Processing...'}</span>
                            </div>
                            <p className="text-[10px] mt-1 text-[#0d9488] font-bold animate-pulse">KAMAL'S Algorithm working</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Analyze Chart
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <ImageUploader onImageSelect={handleImageSelect} />
                )}
              </div>
            </div>

            {error && (
              <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-400 text-center animate-shake">
                <p className="font-bold uppercase tracking-wider text-sm">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in pb-12 pt-4">
            <div className="w-full">
              <AnalysisDisplay analysis={analysis!} />
            </div>

            {marketContext && (
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm max-w-4xl mx-auto">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#0d9488] mb-4 font-black">Market Intelligence</h3>
                <p className="text-slate-700 leading-relaxed text-sm font-medium">
                  {marketContext}
                </p>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button 
                onClick={handleReset}
                className="px-10 py-4 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Analysis
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
