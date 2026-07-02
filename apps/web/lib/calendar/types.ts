export type CalendarType = 'economic' | 'earnings' | 'dividends' | 'ipos' | 'splits' | 'holidays';

export interface EconomicEvent {
  date?: string;
  time: string;
  country?: string;
  countryCode?: string;
  currency?: string;
  event: string;
  importance: 'high' | 'medium' | 'low';
  actual?: string | number;
  forecast?: string | number;
  previous?: string | number;
  source?: string;
  impact?: string;
}

export interface EarningsEvent {
  date: string;
  hour?: string;
  symbol: string;
  name: string;
  epsActual?: number;
  epsEstimate: number;
  revenueActual?: number;
  revenueEstimate: number;
  fiscalPeriod: string;
  exchange: string;
}

export interface DividendEvent {
  exDate: string;
  symbol: string;
  name: string;
  dividend: number;
  frequency: string;
  amount?: number;
  currency?: string;
}

export interface IpoEvent {
  date: string;
  symbol: string;
  name: string;
  exchange: string;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  shares?: number;
  status: string;
}

export interface SplitEvent {
  date: string;
  symbol: string;
  name: string;
  ratio: string;
  optionable?: boolean;
}

export interface HolidayEvent {
  date: string;
  name: string;
  country: string;
  countryCode: string;
  exchange?: string;
}

export type CalendarEvent = EconomicEvent | EarningsEvent | DividendEvent | IpoEvent | SplitEvent | HolidayEvent;

export const CALENDAR_TYPES = ['economic', 'earnings', 'dividends', 'ipos', 'splits', 'holidays'] as const;
export const CALENDAR_LABELS: Record<CalendarType, string> = {
  economic: 'Économique',
  earnings: 'Résultats',
  dividends: 'Dividendes',
  ipos: 'IPOs',
  splits: 'Splits',
  holidays: 'Fériés',
};
