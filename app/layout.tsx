import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'AlphaScan - Crypto Intelligence Dashboard',
  description:
    'Real-time crypto alpha scanning with technical analysis and Smart Money insights',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75" fill="url(%23grad1)">α</text><defs><linearGradient id="grad1"><stop offset="0" stop-color="%2310b981"/><stop offset="1" stop-color="%2306b6d4"/></linearGradient></defs></svg>',
  },
  openGraph: {
    title: 'AlphaScan',
    description: 'Crypto intelligence dashboard with technical analysis',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          async
          src="https://cdn.jsdelivr.net/npm/chart.js"
        />
      </head>
      <body className="bg-[#090909] text-white">
        {children}
      </body>
    </html>
  );
}
