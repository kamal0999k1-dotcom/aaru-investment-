import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_MODEL = 'gemini-3.1-pro-preview';
const SEARCH_MODEL = 'gemini-3-flash-preview';

const getFinalPrompt = (): string => {
  return `
SYSTEM INSTRUCTION:
You are a professional trading analyst AI.
Analyze the uploaded chart image in detail using expert-level technical analysis.
Incorporate the following expert knowledge into your analysis:

1. INDICATOR BASICS:
   - Technical indicators are mathematical calculations based on historic price or volume.
   - Trend Indicators: SMA (200-bar for long-term, 50-bar for intermediate), MACD, ADX.
   - Momentum Indicators: Stochastic Oscillator, RSI.
   - Volume Indicators: OBV, MFI, Accumulation/Distribution.
   - Volatility Indicators: Bollinger Bands, ATR.
   - Support/Resistance: Fibonacci Retracements.

2. SPECIFIC SIGNAL RULES:
   - SMA: Positive slope indicates uptrend. Price crossing above SMA is a long signal.
   - MACD: Bullish if crossing above zero line or signal line. Stronger signals occur far from the zero line.
   - ADX: Measures trend strength (not direction). >25 is a strong trend, <20 is no trend.
   - STOCHASTIC: Overbought >80, Oversold <20. Sell when crossing back below 80.
   - RSI: Overbought >70, Oversold <30. In uptrends, RSI tends to stay in 40-90 range.
   - VOLUME: Increasing volume reinforces trend direction. OBV measures buying/selling pressure.
   - BOLLINGER BANDS: Tightening bands indicate a sharp price move is imminent.
   - FIBONACCI: Key retracement levels are 38.2%, 50%, and 61.8%.

3. RISK MANAGEMENT & STRATEGY:
   - Avoid keeping positions open over weekends as it is generally less profitable.
   - Optimal Stop Loss: Use a sliding and variable ATR window (e.g., period 12, multiplier 6).
   - Position Prevention: After a stop loss, avoid re-entry until price moves beyond a constant ATR barrier (e.g., period 12, multiplier 2).

Identify any significant chart patterns (e.g., Cup and Handle, Double Top, Bull Flag, etc.).
Your goal is to extract specific trading information and return it in a valid JSON format.

FIELDS TO EXTRACT:
1. pattern: The name of the chart pattern detected.
2. sentiment: Whether the trend is "Bullish" or "Bearish".
3. entry: The suggested entry price or range.
4. stopLoss: The suggested stop loss price (consider ATR-based sliding stops).
5. takeProfit: The suggested take profit price.
6. ticker: The market/asset symbol (e.g. BTCUSDT).
7. indicators: An array of objects for each indicator detected.
   Each object should have:
   - name: The name of the indicator.
   - value: The detected value.
   - interpretation: A brief explanation based on the rules above.
8. reasoning: A detailed explanation of your analysis, including why you identified the specific pattern and how the indicators support your conclusion.

RESPONSE FORMAT:
Return ONLY a valid JSON object with the following keys:
{
  "pattern": "string",
  "sentiment": "string",
  "entry": "string",
  "stopLoss": "string",
  "takeProfit": "string",
  "ticker": "string",
  "indicators": [{"name": "string", "value": "string", "interpretation": "string"}],
  "reasoning": "string"
}

Be specific, data-driven, and confident.
  `;
};

export const analyzeChartImage = async (base64ImageData: string, mimeType: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };

    // Use Pro with Thinking for high-quality analysis
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: { parts: [{ text: getFinalPrompt() }, imagePart] },
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    
    if (!response || !response.text) {
        throw new Error("Empty response from AI.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Error analyzing chart image:", error);
    if (error instanceof Error) {
        return JSON.stringify({ error: error.message });
    }
    return JSON.stringify({ error: "An unknown error occurred during analysis." });
  }
};

export const getMarketContext = async (ticker: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: `What is the current market sentiment and recent news for ${ticker}? Provide a brief summary for a trading analyst.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error getting market context:", error);
    return "Market context unavailable.";
  }
};
