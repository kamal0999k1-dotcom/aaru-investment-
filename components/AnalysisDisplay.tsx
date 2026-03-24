import React from 'react';

interface AnalysisData {
  pattern: string;
  sentiment: string;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  ticker?: string;
  indicators?: { name: string; value: string; interpretation: string }[];
  reasoning?: string;
  error?: string;
}

interface AnalysisDisplayProps {
  analysis: string;
}

const ResultBox: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent = 'blue' }) => (
  <div className={`bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm transition-all hover:scale-[1.02] hover:shadow-md backdrop-blur-sm`}>
    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-bold">{label}</span>
    <span className={`text-xl font-black text-[#1e3a8a] tracking-tight`}>{value}</span>
  </div>
);

const IndicatorRow: React.FC<{ name: string; value: string; interpretation: string }> = ({ name, value, interpretation }) => (
  <div className="bg-white border border-gray-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50 transition-colors shadow-sm">
    <div className="flex flex-col">
      <span className="text-xs font-bold text-[#0d9488] uppercase tracking-wider">{name}</span>
      <span className="text-lg font-black text-[#1e3a8a]">{value}</span>
    </div>
    <div className="text-sm text-slate-600 italic sm:text-right max-w-xs">
      {interpretation}
    </div>
  </div>
);

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis) return null;

  let data: AnalysisData;
  try {
    data = JSON.parse(analysis);
  } catch (e) {
    return (
      <div className="text-center text-red-400 bg-red-900/50 p-8 rounded-2xl w-full border border-red-500/20">
        <h3 className="font-bold text-xl mb-2">Parsing Error</h3>
        <p className="text-sm opacity-80">Could not parse analysis results. Raw output: {analysis.substring(0, 100)}...</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="text-center text-red-400 bg-red-900/50 p-8 rounded-2xl w-full border border-red-500/20">
        <h3 className="font-bold text-xl mb-2">Analysis Failed</h3>
        <p className="text-sm opacity-80">{data.error}</p>
      </div>
    );
  }

  const isBullish = data.sentiment.toLowerCase().includes('bull');

  return (
    <div className="w-full space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResultBox label="Chart Pattern" value={data.pattern} />
        <ResultBox 
          label="Sentiment" 
          value={data.sentiment} 
          accent={isBullish ? 'emerald' : 'red'} 
        />
        <ResultBox label="Entry" value={data.entry} accent="blue" />
        <ResultBox label="Stop Loss" value={data.stopLoss} accent="rose" />
        <ResultBox label="Take Profit" value={data.takeProfit} accent="emerald" />
        {data.ticker && <ResultBox label="Ticker" value={data.ticker} />}
      </div>
      
      {data.indicators && data.indicators.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {data.indicators.map((indicator, idx) => (
              <IndicatorRow key={idx} {...indicator} />
            ))}
          </div>
        </div>
      )}

      {data.reasoning && (
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p className="text-slate-700 leading-relaxed text-base font-medium">
            {data.reasoning}
          </p>
        </div>
      )}
      
    </div>
  );
};
