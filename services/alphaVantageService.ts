const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export interface AlphaVantageQuote {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  latestTradingDay: string;
}

export const fetchQuote = async (symbol: string): Promise<AlphaVantageQuote | null> => {
  if (!ALPHA_VANTAGE_API_KEY) return null;

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    const quote = data['Global Quote'];

    if (!quote || Object.keys(quote).length === 0) return null;

    return {
      symbol: quote['01. symbol'],
      price: quote['05. price'],
      change: quote['09. change'],
      changePercent: quote['10. change percent'],
      latestTradingDay: quote['07. latest trading day'],
    };
  } catch (error) {
    console.error('Error fetching Alpha Vantage quote:', error);
    return null;
  }
};
