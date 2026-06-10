// apps/web/lib/email/index.ts
import { logger } from "@/lib/logger";
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors when API key is missing
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email templates
export const emailTemplates = {
  'alert-triggered': (data: {
    symbol: string;
    targetPrice: number;
    currentPrice: number;
    condition: string;
  }): EmailTemplate => ({
    subject: `🚨 Zenith Alert: ${data.symbol} ${data.condition} $${data.targetPrice}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Zenith Alert</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0b0e14;
            color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .logo {
            font-size: 24px;
            font-weight: 700;
            color: #00e5ff;
            margin-bottom: 10px;
          }
          .alert-box {
            background: linear-gradient(135deg, #131722 0%, #1a1f2e 100%);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            border: 1px solid rgba(0, 229, 255, 0.2);
          }
          .alert-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 24px;
            color: #00e5ff;
          }
          .price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .price-label {
            font-size: 14px;
            color: #8b92a8;
          }
          .price-value {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
          }
          .current-price {
            color: #00e5ff;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #00e5ff 0%, #7b3fe4 100%);
            color: #0b0e14;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin-top: 24px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 12px;
            color: #8b92a8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Zenith</div>
            <div style="font-size: 14px; color: #8b92a8;">Financial Intelligence Platform</div>
          </div>
          
          <div class="alert-box">
            <div class="alert-title">🔔 Price Alert Triggered</div>
            
            <div class="price-row">
              <span class="price-label">Symbol</span>
              <span class="price-value">${data.symbol}</span>
            </div>
            
            <div class="price-row">
              <span class="price-label">Condition</span>
              <span class="price-value">${data.condition.toUpperCase()}</span>
            </div>
            
            <div class="price-row">
              <span class="price-label">Target Price</span>
              <span class="price-value">$${data.targetPrice.toLocaleString()}</span>
            </div>
            
            <div class="price-row">
              <span class="price-label">Current Price</span>
              <span class="price-value current-price">$${data.currentPrice.toLocaleString()}</span>
            </div>
            
            <center>
              <a href="https://zenith.xyz/markets/${data.symbol.toLowerCase()}" class="cta-button">
                View Chart →
              </a>
            </center>
          </div>
          
          <div class="footer">
            <p>You're receiving this because you set a price alert on Zenith.</p>
            <p>© 2026 Zenith. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
ZENITH ALERT TRIGGERED

Symbol: ${data.symbol}
Condition: ${data.condition.toUpperCase()}
Target Price: $${data.targetPrice.toLocaleString()}
Current Price: $${data.currentPrice.toLocaleString()}

View chart: https://zenith.xyz/markets/${data.symbol.toLowerCase()}

You're receiving this because you set a price alert on Zenith.
© 2026 Zenith. All rights reserved.
    `,
  }),

  'recap-daily': (data: {
    portfolioValue: number;
    dailyChange: number;
    dailyChangePercent: number;
    topGainers: Array<{ symbol: string; change: number }>;
    topLosers: Array<{ symbol: string; change: number }>;
  }): EmailTemplate => ({
    subject: `📊 Your Daily Zenith Recap - ${data.dailyChange >= 0 ? '+' : ''}${data.dailyChangePercent.toFixed(2)}%`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Zenith Daily Recap</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0b0e14;
            color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .logo {
            font-size: 24px;
            font-weight: 700;
            color: #00e5ff;
            margin-bottom: 10px;
          }
          .portfolio-card {
            background: linear-gradient(135deg, #131722 0%, #1a1f2e 100%);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            border: 1px solid rgba(0, 229, 255, 0.2);
            text-align: center;
          }
          .portfolio-value {
            font-size: 36px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 8px;
          }
          .portfolio-change {
            font-size: 18px;
            font-weight: 600;
          }
          .positive { color: #00e5ff; }
          .negative { color: #ff4757; }
          .section {
            background: linear-gradient(135deg, #131722 0%, #1a1f2e 100%);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #8b92a8;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .asset-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .asset-name {
            font-weight: 600;
          }
          .asset-change {
            font-weight: 600;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #00e5ff 0%, #7b3fe4 100%);
            color: #0b0e14;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin-top: 24px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 12px;
            color: #8b92a8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Zenith</div>
            <div style="font-size: 14px; color: #8b92a8;">Daily Recap</div>
          </div>
          
          <div class="portfolio-card">
            <div class="portfolio-value">$${data.portfolioValue.toLocaleString()}</div>
            <div class="portfolio-change ${data.dailyChange >= 0 ? 'positive' : 'negative'}">
              ${data.dailyChange >= 0 ? '+' : ''}$${data.dailyChange.toLocaleString()} 
              (${data.dailyChange >= 0 ? '+' : ''}${data.dailyChangePercent.toFixed(2)}%)
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Top Gainers</div>
            ${data.topGainers.map(g => `
              <div class="asset-row">
                <span class="asset-name">${g.symbol}</span>
                <span class="asset-change positive">+${g.change.toFixed(2)}%</span>
              </div>
            `).join('')}
          </div>
          
          <div class="section">
            <div class="section-title">Top Losers</div>
            ${data.topLosers.map(l => `
              <div class="asset-row">
                <span class="asset-name">${l.symbol}</span>
                <span class="asset-change negative">${l.change.toFixed(2)}%</span>
              </div>
            `).join('')}
          </div>
          
          <center>
            <a href="https://zenith.xyz/dashboard" class="cta-button">
              View Dashboard →
            </a>
          </center>
          
          <div class="footer">
            <p>Your daily recap from Zenith.</p>
            <p>© 2026 Zenith. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
ZENITH DAILY RECAP

Portfolio Value: $${data.portfolioValue.toLocaleString()}
Daily Change: ${data.dailyChange >= 0 ? '+' : ''}$${data.dailyChange.toLocaleString()} (${data.dailyChange >= 0 ? '+' : ''}${data.dailyChangePercent.toFixed(2)}%)

Top Gainers:
${data.topGainers.map(g => `  ${g.symbol}: +${g.change.toFixed(2)}%`).join('\n')}

Top Losers:
${data.topLosers.map(l => `  ${l.symbol}: ${l.change.toFixed(2)}%`).join('\n')}

View dashboard: https://zenith.xyz/dashboard

Your daily recap from Zenith.
© 2026 Zenith. All rights reserved.
    `,
  }),

  'welcome': (data: { name: string }): EmailTemplate => ({
    subject: `🚀 Welcome to Zenith, ${data.name}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Zenith</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0b0e14;
            color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .logo {
            font-size: 32px;
            font-weight: 700;
            color: #00e5ff;
            margin-bottom: 10px;
          }
          .welcome-box {
            background: linear-gradient(135deg, #131722 0%, #1a1f2e 100%);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            border: 1px solid rgba(0, 229, 255, 0.2);
            text-align: center;
          }
          .welcome-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #00e5ff;
          }
          .welcome-text {
            font-size: 16px;
            line-height: 1.6;
            color: #8b92a8;
            margin-bottom: 24px;
          }
          .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 32px;
          }
          .feature {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
          }
          .feature-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .feature-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .feature-desc {
            font-size: 12px;
            color: #8b92a8;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #00e5ff 0%, #7b3fe4 100%);
            color: #0b0e14;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 12px;
            color: #8b92a8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Zenith</div>
          </div>
          
          <div class="welcome-box">
            <div class="welcome-title">Welcome, ${data.name}! 🎉</div>
            <div class="welcome-text">
              You're now part of the Zenith community. Get ready to track markets, 
              analyze trends, and make smarter decisions with real-time financial intelligence.
            </div>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">📊</div>
                <div class="feature-title">Real-Time Charts</div>
                <div class="feature-desc">TradingView-level charts</div>
              </div>
              <div class="feature">
                <div class="feature-icon">🔔</div>
                <div class="feature-title">Price Alerts</div>
                <div class="feature-desc">Never miss a move</div>
              </div>
              <div class="feature">
                <div class="feature-icon">💼</div>
                <div class="feature-title">Portfolio Tracking</div>
                <div class="feature-desc">All your assets in one place</div>
              </div>
              <div class="feature">
                <div class="feature-icon">📈</div>
                <div class="feature-title">Indicators</div>
                <div class="feature-desc">RSI, MACD, SMA & more</div>
              </div>
            </div>
            
            <a href="https://zenith.xyz/dashboard" class="cta-button">
              Get Started →
            </a>
          </div>
          
          <div class="footer">
            <p>© 2026 Zenith. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Zenith, ${data.name}!

You're now part of the Zenith community. Get ready to track markets, analyze trends, and make smarter decisions with real-time financial intelligence.

Features:
- Real-Time Charts: TradingView-level charts
- Price Alerts: Never miss a move
- Portfolio Tracking: All your assets in one place
- Indicators: RSI, MACD, SMA & more

Get started: https://zenith.xyz/dashboard

© 2026 Zenith. All rights reserved.
    `,
  }),
};

// Send email function
export async function sendEmail({
  to,
  template,
  data,
}: {
  to: string;
  template: keyof typeof emailTemplates;
  data: any;
}) {
  const templateFn = emailTemplates[template];
  if (!templateFn) {
    throw new Error(`Unknown email template: ${template}`);
  }

  const { subject, html, text } = templateFn(data);

  // If RESEND_API_KEY is missing, log and return mock success
  if (!process.env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not configured, email not sent:', { to, subject });
    return { success: true, id: 'mock-email-id' };
  }

  try {
    const result = await getResend().emails.send({
      from: 'Zenith <alerts@zenith.xyz>',
      to,
      subject,
      html,
      text,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
}

export default {
  sendEmail,
  emailTemplates,
};
