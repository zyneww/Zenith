const BASE = "https://api.twelvedata.com";
const API_KEY = process.env.TWELVE_DATA_API_KEY || "";

const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", domain: "apple.com" },
  { symbol: "MSFT", name: "Microsoft Corporation", domain: "microsoft.com" },
  { symbol: "GOOGL", name: "Alphabet Inc.", domain: "abc.xyz" },
  { symbol: "AMZN", name: "Amazon.com Inc.", domain: "amazon.com" },
  { symbol: "TSLA", name: "Tesla Inc.", domain: "tesla.com" },
  { symbol: "NVDA", name: "NVIDIA Corporation", domain: "nvidia.com" },
  { symbol: "META", name: "Meta Platforms Inc.", domain: "meta.com" },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", domain: "berkshirehathaway.com" },
  { symbol: "LLY", name: "Eli Lilly and Company", domain: "lilly.com" },
  { symbol: "V", name: "Visa Inc.", domain: "visa.com" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", domain: "jpmorganchase.com" },
  { symbol: "WMT", name: "Walmart Inc.", domain: "walmart.com" },
  { symbol: "JNJ", name: "Johnson & Johnson", domain: "jnj.com" },
  { symbol: "XOM", name: "Exxon Mobil Corporation", domain: "exxonmobil.com" },
  { symbol: "UNH", name: "UnitedHealth Group Inc.", domain: "unitedhealthgroup.com" },
  { symbol: "MA", name: "Mastercard Inc.", domain: "mastercard.com" },
  { symbol: "PG", name: "The Procter & Gamble Company", domain: "pg.com" },
  { symbol: "HD", name: "The Home Depot Inc.", domain: "homedepot.com" },
  { symbol: "CVX", name: "Chevron Corporation", domain: "chevron.com" },
  { symbol: "MRK", name: "Merck & Co. Inc.", domain: "merck.com" },
  { symbol: "PEP", name: "PepsiCo Inc.", domain: "pepsico.com" },
  { symbol: "ABBV", name: "AbbVie Inc.", domain: "abbvie.com" },
  { symbol: "KO", name: "The Coca-Cola Company", domain: "coca-colacompany.com" },
  { symbol: "BAC", name: "Bank of America Corporation", domain: "bankofamerica.com" },
  { symbol: "AVGO", name: "Broadcom Inc.", domain: "broadcom.com" },
  { symbol: "PFE", name: "Pfizer Inc.", domain: "pfizer.com" },
  { symbol: "COST", name: "Costco Wholesale Corporation", domain: "costco.com" },
  { symbol: "TMO", name: "Thermo Fisher Scientific Inc.", domain: "thermofisher.com" },
  { symbol: "ABT", name: "Abbott Laboratories", domain: "abbott.com" },
  { symbol: "DIS", name: "The Walt Disney Company", domain: "disney.com" },
  { symbol: "CRM", name: "Salesforce Inc.", domain: "salesforce.com" },
  { symbol: "NFLX", name: "Netflix Inc.", domain: "netflix.com" },
  { symbol: "ADBE", name: "Adobe Inc.", domain: "adobe.com" },
  { symbol: "INTC", name: "Intel Corporation", domain: "intel.com" },
  { symbol: "AMD", name: "Advanced Micro Devices Inc.", domain: "amd.com" },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", domain: "paypal.com" },
  { symbol: "UBER", name: "Uber Technologies Inc.", domain: "uber.com" },
  { symbol: "NKE", name: "Nike Inc.", domain: "nike.com" },
  { symbol: "BA", name: "The Boeing Company", domain: "boeing.com" },
  { symbol: "GE", name: "General Electric Company", domain: "ge.com" },
  { symbol: "GM", name: "General Motors Company", domain: "gm.com" },
  { symbol: "F", name: "Ford Motor Company", domain: "ford.com" },
  { symbol: "IBM", name: "International Business Machines", domain: "ibm.com" },
  { symbol: "ORCL", name: "Oracle Corporation", domain: "oracle.com" },
  { symbol: "CSCO", name: "Cisco Systems Inc.", domain: "cisco.com" },
  { symbol: "QCOM", name: "QUALCOMM Incorporated", domain: "qualcomm.com" },
  { symbol: "TXN", name: "Texas Instruments Incorporated", domain: "ti.com" },
  { symbol: "AMGN", name: "Amgen Inc.", domain: "amgen.com" },
  { symbol: "HON", name: "Honeywell International Inc.", domain: "honeywell.com" },
  { symbol: "LOW", name: "Lowe's Companies Inc.", domain: "lowes.com" },
];

export interface StockQuote {
  symbol: string;
  name: string;
  domain: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const url = `${BASE}/quote?symbol=${symbol}&apikey=${API_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Twelve Data quote ${res.status}`);
  const json = await res.json();
  if (json.status === "error") throw new Error(json.message || "Twelve Data error");
  const meta = POPULAR_STOCKS.find((s) => s.symbol === symbol);
  return {
    symbol: json.symbol,
    name: meta?.name || symbol,
    domain: meta?.domain || `${symbol.toLowerCase()}.com`,
    price: parseFloat(json.close || json.previous_close || "0"),
    change: parseFloat(json.change || "0"),
    changePercent: parseFloat(json.percent_change || "0"),
    high: parseFloat(json.high || "0"),
    low: parseFloat(json.low || "0"),
    volume: parseInt(json.volume || "0"),
    previousClose: parseFloat(json.previous_close || "0"),
  };
}

export async function fetchStockSparkline(symbol: string): Promise<{ time: number; value: number }[]> {
  const url = `${BASE}/time_series?symbol=${symbol}&interval=1min&outputsize=120&apikey=${API_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Twelve Data sparkline ${res.status}`);
  const json = await res.json();
  if (!json.values) return [];
  return json.values.map((v: any) => ({
    time: new Date(v.datetime).getTime() / 1000,
    value: parseFloat(v.close),
  })).reverse();
}

export function getPopularStocks() {
  return POPULAR_STOCKS;
}
