import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Careers at Teams 24 | Open Positions',
  description: 'Join Teams 24 and build the future. Explore our open positions in engineering, design, operations, and more.',
  openGraph: {
    title: 'Careers at Teams 24 | Open Positions',
    description: 'Join Teams 24 and build the future. Explore our open positions in engineering, design, operations, and more.',
    type: 'website',
    siteName: 'Teams 24 Careers',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers at Teams 24',
    description: 'Join Teams 24 and build the future. Explore our open positions.',
  },
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W5600BXJZT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W5600BXJZT');
          `}
        </Script>
      </body>
    </html>
  );
}
