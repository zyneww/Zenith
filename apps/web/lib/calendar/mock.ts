import {
  type CalendarType,
  type CalendarEvent,
  type EconomicEvent,
  type EarningsEvent,
  type DividendEvent,
  type IpoEvent,
  type SplitEvent,
  type HolidayEvent,
  CALENDAR_LABELS,
} from './types';

export { CALENDAR_LABELS };

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function dateStr(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

const mockEconomic: EconomicEvent[] = [
  { country: 'États-Unis', countryCode: 'US', event: 'Nonfarm Payrolls (NFP)', time: '13:30', importance: 'high', forecast: 180, previous: 175, actual: 192 },
  { country: 'États-Unis', countryCode: 'US', event: 'Taux de chômage', time: '13:30', importance: 'high', forecast: '4.1%', previous: '4.2%', actual: '4.1%' },
  { country: 'États-Unis', countryCode: 'US', event: 'IPC (CPI) YoY', time: '13:30', importance: 'high', forecast: '3.1%', previous: '3.2%' },
  { country: 'États-Unis', countryCode: 'US', event: 'IPC Core MoM', time: '13:30', importance: 'high', forecast: '0.3%', previous: '0.4%' },
  { country: 'États-Unis', countryCode: 'US', event: 'Décision FOMC', time: '19:00', importance: 'high', forecast: '5.50%', previous: '5.50%' },
  { country: 'États-Unis', countryCode: 'US', event: 'Conférence de presse FOMC', time: '19:30', importance: 'high' },
  { country: 'États-Unis', countryCode: 'US', event: 'Ventes au détail MoM', time: '13:30', importance: 'medium', forecast: '0.3%', previous: '0.2%' },
  { country: 'États-Unis', countryCode: 'US', event: 'PIB (GDP) QoQ', time: '13:30', importance: 'high', forecast: '2.1%', previous: '1.6%' },
  { country: 'États-Unis', countryCode: 'US', event: 'ISM Manufacturing PMI', time: '15:00', importance: 'medium', forecast: 48.5, previous: 48.2 },
  { country: 'États-Unis', countryCode: 'US', event: 'ISM Services PMI', time: '15:00', importance: 'medium', forecast: 52.0, previous: 51.8 },
  { country: 'États-Unis', countryCode: 'US', event: 'Réclamations chômage hebdo', time: '13:30', importance: 'low', forecast: 230000, previous: 228000 },
  { country: 'États-Unis', countryCode: 'US', event: 'Ventes de logements existants', time: '15:00', importance: 'low', forecast: '4.0M', previous: '3.9M' },
  { country: 'Zone Euro', countryCode: 'EU', event: 'Décision BCE (taux directeur)', time: '13:45', importance: 'high', forecast: '4.25%', previous: '4.25%' },
  { country: 'Zone Euro', countryCode: 'EU', event: 'Conférence de presse BCE', time: '14:30', importance: 'high' },
  { country: 'Zone Euro', countryCode: 'EU', event: 'IPC Flash YoY', time: '10:00', importance: 'high', forecast: '2.4%', previous: '2.5%' },
  { country: 'Zone Euro', countryCode: 'EU', event: 'PMI Manufacturing Flash', time: '09:00', importance: 'medium', forecast: 47.0, previous: 46.8 },
  { country: 'Zone Euro', countryCode: 'EU', event: 'PMI Services Flash', time: '09:00', importance: 'medium', forecast: 52.5, previous: 52.1 },
  { country: 'Allemagne', countryCode: 'DE', event: 'IFO climat des affaires', time: '10:00', importance: 'medium', forecast: 89.0, previous: 88.6 },
  { country: 'Allemagne', countryCode: 'DE', event: 'PIB (GDP) QoQ', time: '08:00', importance: 'high', forecast: '0.2%', previous: '0.1%' },
  { country: 'Allemagne', countryCode: 'DE', event: 'ZEW expectation', time: '10:00', importance: 'medium', forecast: 40.0, previous: 38.5 },
  { country: 'France', countryCode: 'FR', event: 'PIB (GDP) QoQ', time: '07:30', importance: 'medium', forecast: '0.3%', previous: '0.2%' },
  { country: 'France', countryCode: 'FR', event: 'Inflation CPI YoY', time: '07:30', importance: 'medium', forecast: '2.2%', previous: '2.3%' },
  { country: 'Royaume-Uni', countryCode: 'GB', event: 'BoE taux directeur', time: '12:00', importance: 'high', forecast: '5.00%', previous: '5.00%' },
  { country: 'Royaume-Uni', countryCode: 'GB', event: 'CPI YoY', time: '07:00', importance: 'high', forecast: '3.2%', previous: '3.4%' },
  { country: 'Royaume-Uni', countryCode: 'GB', event: 'PMI Services', time: '09:30', importance: 'medium', forecast: 52.0, previous: 51.5 },
  { country: 'Japon', countryCode: 'JP', event: 'BoJ taux directeur', time: '03:00', importance: 'high', forecast: '0.10%', previous: '0.10%' },
  { country: 'Japon', countryCode: 'JP', event: 'CPI Tokyo YoY', time: '23:30', importance: 'medium', forecast: '2.1%', previous: '2.2%' },
  { country: 'Japon', countryCode: 'JP', event: 'PIB (GDP) QoQ', time: '23:50', importance: 'high', forecast: '0.4%', previous: '0.3%' },
  { country: 'Chine', countryCode: 'CN', event: 'PIB (GDP) YoY', time: '02:00', importance: 'high', forecast: '5.1%', previous: '5.2%' },
  { country: 'Chine', countryCode: 'CN', event: 'Production industrielle YoY', time: '02:00', importance: 'medium', forecast: '5.5%', previous: '5.6%' },
  { country: 'Chine', countryCode: 'CN', event: 'Ventes au détail YoY', time: '02:00', importance: 'medium', forecast: '3.8%', previous: '3.7%' },
];

const mockEarnings: EarningsEvent[] = [
  { date: dateStr(0), hour: '16:05', symbol: 'AAPL', name: 'Apple Inc.', epsEstimate: 1.39, revenueEstimate: 84500e6, fiscalPeriod: 'Q1 2026', exchange: 'NASDAQ' },
  { date: dateStr(0), hour: '16:05', symbol: 'MSFT', name: 'Microsoft Corp.', epsEstimate: 2.94, revenueEstimate: 68000e6, fiscalPeriod: 'Q1 2026', exchange: 'NASDAQ' },
  { date: dateStr(1), hour: '16:05', symbol: 'GOOGL', name: 'Alphabet Inc.', epsEstimate: 1.64, revenueEstimate: 95200e6, fiscalPeriod: 'Q1 2026', exchange: 'NASDAQ' },
  { date: dateStr(1), hour: '16:05', symbol: 'AMZN', name: 'Amazon.com Inc.', epsEstimate: 1.43, revenueEstimate: 143000e6, fiscalPeriod: 'Q1 2026', exchange: 'NASDAQ' },
  { date: dateStr(2), hour: '16:05', symbol: 'META', name: 'Meta Platforms', epsEstimate: 4.71, revenueEstimate: 36300e6, fiscalPeriod: 'Q1 2026', exchange: 'NASDAQ' },
  { date: dateStr(2), hour: '16:05', symbol: 'TSLA', name: 'Tesla Inc.', epsEstimate: 0.74, revenueEstimate: 24500e6, fiscalPeriod: 'Q1 2026', exchange: 'NASDAQ' },
  { date: dateStr(3), hour: '16:05', symbol: 'NVDA', name: 'NVIDIA Corp.', epsActual: 6.12, epsEstimate: 5.95, revenueActual: 39300e6, revenueEstimate: 38500e6, fiscalPeriod: 'Q1 2026', exchange: 'NASDAQ' },
  { date: dateStr(3), hour: '16:05', symbol: 'NFLX', name: 'Netflix Inc.', epsActual: 4.88, epsEstimate: 4.78, revenueActual: 9470e6, revenueEstimate: 9430e6, fiscalPeriod: 'Q1 2026', exchange: 'NASDAQ' },
  { date: dateStr(4), hour: '16:05', symbol: 'AMD', name: 'Advanced Micro Devices', epsEstimate: 0.18, revenueEstimate: 5470e6, fiscalPeriod: 'Q1 2026', exchange: 'NASDAQ' },
  { date: dateStr(4), hour: '16:05', symbol: 'BABA', name: 'Alibaba Group', epsEstimate: 1.34, revenueEstimate: 30500e6, fiscalPeriod: 'Q4 2025', exchange: 'NYSE' },
  { date: dateStr(5), hour: '16:05', symbol: 'JPM', name: 'JPMorgan Chase', epsActual: 4.81, epsEstimate: 4.72, revenueActual: 42600e6, revenueEstimate: 41900e6, fiscalPeriod: 'Q1 2026', exchange: 'NYSE' },
  { date: dateStr(5), hour: '16:05', symbol: 'DIS', name: 'Walt Disney Co.', epsEstimate: 1.21, revenueEstimate: 23200e6, fiscalPeriod: 'Q2 2026', exchange: 'NYSE' },
  { date: dateStr(6), hour: '16:05', symbol: 'CRM', name: 'Salesforce Inc.', epsEstimate: 2.41, revenueEstimate: 9330e6, fiscalPeriod: 'Q1 2026', exchange: 'NYSE' },
  { date: dateStr(6), hour: '16:05', symbol: 'AVGO', name: 'Broadcom Inc.', epsEstimate: 11.55, revenueEstimate: 14300e6, fiscalPeriod: 'Q2 2026', exchange: 'NASDAQ' },
];

const mockDividends: DividendEvent[] = [
  { exDate: dateStr(0), symbol: 'AAPL', name: 'Apple Inc.', dividend: 0.25, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(0), symbol: 'MSFT', name: 'Microsoft Corp.', dividend: 0.83, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(1), symbol: 'XOM', name: 'Exxon Mobil', dividend: 0.95, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(1), symbol: 'JNJ', name: 'Johnson & Johnson', dividend: 1.24, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(2), symbol: 'KO', name: 'Coca-Cola Co.', dividend: 0.485, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(2), symbol: 'PG', name: 'Procter & Gamble', dividend: 1.0065, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(3), symbol: 'CVX', name: 'Chevron Corp.', dividend: 1.63, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(3), symbol: 'ABBV', name: 'AbbVie Inc.', dividend: 1.64, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(4), symbol: 'PEP', name: 'PepsiCo Inc.', dividend: 1.355, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(4), symbol: 'VZ', name: 'Verizon Comm.', dividend: 0.6775, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(5), symbol: 'T', name: 'AT&T Inc.', dividend: 0.2775, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(5), symbol: 'IBM', name: 'IBM Corp.', dividend: 1.67, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(6), symbol: 'CSCO', name: 'Cisco Systems', dividend: 0.40, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(6), symbol: 'INTC', name: 'Intel Corp.', dividend: 0.125, frequency: 'quarterly', currency: 'USD' },
  { exDate: dateStr(0), symbol: 'O', name: 'Realty Income', dividend: 0.263, frequency: 'monthly', currency: 'USD' },
  { exDate: dateStr(2), symbol: 'JPM', name: 'JPMorgan Chase', dividend: 1.15, frequency: 'quarterly', currency: 'USD' },
];

const mockIpos: IpoEvent[] = [
  { date: dateStr(0), symbol: 'TECH', name: 'TechFlow Holdings', exchange: 'NASDAQ', priceRangeLow: 14, priceRangeHigh: 17, shares: 12_000_000, status: 'expected' },
  { date: dateStr(1), symbol: 'HLTH', name: 'HealthNova Inc.', exchange: 'NYSE', priceRangeLow: 22, priceRangeHigh: 26, shares: 8_500_000, status: 'filed' },
  { date: dateStr(2), symbol: 'EVGO', name: 'EvGo Mobility', exchange: 'NASDAQ', priceRangeLow: 9, priceRangeHigh: 11, shares: 15_000_000, status: 'expected' },
  { date: dateStr(3), symbol: 'FOOD', name: 'FreshMeal Co.', exchange: 'NASDAQ', priceRangeLow: 18, priceRangeHigh: 21, shares: 6_200_000, status: 'priced' },
  { date: dateStr(3), symbol: 'AERO', name: 'AeroSpace Logistics', exchange: 'NYSE', priceRangeLow: 27, priceRangeHigh: 32, shares: 4_800_000, status: 'filed' },
  { date: dateStr(4), symbol: 'DATA', name: 'DataPulse AI', exchange: 'NASDAQ', priceRangeLow: 35, priceRangeHigh: 41, shares: 9_000_000, status: 'expected' },
  { date: dateStr(5), symbol: 'BIOM', name: 'BioMedical Discoveries', exchange: 'NASDAQ', priceRangeLow: 12, priceRangeHigh: 14, shares: 7_300_000, status: 'filed' },
  { date: dateStr(5), symbol: 'REAL', name: 'RealEstate Cloud', exchange: 'NYSE', priceRangeLow: 16, priceRangeHigh: 19, shares: 5_600_000, status: 'expected' },
  { date: dateStr(6), symbol: 'GRID', name: 'GridPower Energy', exchange: 'NYSE', priceRangeLow: 24, priceRangeHigh: 28, shares: 11_000_000, status: 'filed' },
  { date: dateStr(6), symbol: 'SHIP', name: 'ShipLogix Global', exchange: 'NASDAQ', priceRangeLow: 13, priceRangeHigh: 15, shares: 8_700_000, status: 'expected' },
];

const mockSplits: SplitEvent[] = [
  { date: dateStr(0), symbol: 'NVDA', name: 'NVIDIA Corp.', ratio: '10:1', optionable: true },
  { date: dateStr(1), symbol: 'SHOP', name: 'Shopify Inc.', ratio: '2:1', optionable: true },
  { date: dateStr(2), symbol: 'AMZN', name: 'Amazon.com Inc.', ratio: '5:1', optionable: true },
  { date: dateStr(3), symbol: 'TSLA', name: 'Tesla Inc.', ratio: '3:1', optionable: true },
  { date: dateStr(5), symbol: 'AAPL', name: 'Apple Inc.', ratio: '4:1', optionable: true },
];

const mockHolidays: HolidayEvent[] = [
  { date: '2026-06-29', name: 'Fête nationale (US pré-vacances)', country: 'États-Unis', countryCode: 'US', exchange: 'NYSE' },
  { date: '2026-07-03', name: 'Pré-Independence Day (jour raccourci)', country: 'États-Unis', countryCode: 'US', exchange: 'NYSE' },
  { date: '2026-07-04', name: 'Independence Day', country: 'États-Unis', countryCode: 'US', exchange: 'NYSE' },
  { date: '2026-07-04', name: 'Independence Day', country: 'États-Unis', countryCode: 'US', exchange: 'NASDAQ' },
  { date: '2026-06-29', name: 'Fête nationale du Roi', country: 'Espagne', countryCode: 'ES', exchange: 'BME' },
  { date: '2026-07-14', name: 'Fête nationale (Prise de la Bastille)', country: 'France', countryCode: 'FR', exchange: 'Euronext' },
  { date: '2026-07-01', name: 'Canada Day', country: 'Canada', countryCode: 'CA', exchange: 'TSX' },
  { date: '2026-07-04', name: 'Independence Day', country: 'États-Unis', countryCode: 'US', exchange: 'CBOE' },
  { date: '2026-06-29', name: 'St. Peter & St. Paul', country: 'Colombie', countryCode: 'CO', exchange: 'BVC' },
  { date: '2026-07-15', name: 'St. Swithin', country: 'Royaume-Uni', countryCode: 'GB', exchange: 'LSE' },
];

export function getMockCalendar(type: CalendarType): CalendarEvent[] {
  switch (type) {
    case 'economic': return mockEconomic as unknown as CalendarEvent[];
    case 'earnings': return mockEarnings as unknown as CalendarEvent[];
    case 'dividends': return mockDividends as unknown as CalendarEvent[];
    case 'ipos': return mockIpos as unknown as CalendarEvent[];
    case 'splits': return mockSplits as unknown as CalendarEvent[];
    case 'holidays': return mockHolidays as unknown as CalendarEvent[];
  }
}
