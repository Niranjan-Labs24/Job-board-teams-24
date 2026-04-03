import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Careers at Teams24 | Tech, Operations, Marketing & Sales Jobs | Remote & In-Office',
  description: "Join Teams24 — India's Skill based, IT staffing studio. Work with US and European startups from In Office or remotely. Roles in full-stack development, performance marketing, Salesforce, customer support & more. Apply now.",
  keywords: "jobs in India, IT jobs India, tech jobs Chennai, remote jobs India, full stack developer jobs Chennai, full stack developer jobs India, performance marketer jobs India, Salesforce jobs India, Salesforce jobs Chennai, startup jobs Chennai, startup jobs India, Teams24 careers, work with US clients India, IT staffing company jobs India, in-office tech jobs India 2026",
  authors: [{ name: 'Teams24' }],
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  alternates: {
    canonical: 'https://careers.teams24.co/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Teams24 Careers',
    title: 'Careers at Teams24 | Remote & In-Office Jobs with Global Startups',
    description: 'Teams24 is hiring across tech, marketing, and operations — in-office and remote. Work with US and European clients. Real ownership, fast-track growth.',
    url: 'https://careers.teams24.co/',
    images: [
      {
        url: 'https://careers.teams24.co/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Teams24 Careers — Remote & In-Office Jobs',
      },
    ],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@teams24co',
    title: 'Careers at Teams24 | Remote & In-Office Jobs',
    description: 'Hiring across tech, marketing, and operations — in-office and remote. Work directly with US & EU startups.',
    images: ['https://careers.teams24.co/og-image.png'],
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
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Teams24",
              "alternateName": "Teams 24",
              "url": "https://www.teams24.co",
              "logo": "https://www.teams24.co/logo.png",
              "description": "Teams24 is a subscription-based IT staffing and AI automation studio headquartered in Chennai, India. We place pre-vetted developers, marketers, Salesforce consultants, and operations talent with startups across the US, Europe, and India — both in-office and remotely.",
              "foundingDate": "2023",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Shakti Tower 1, 766, Anna Salai, Thousand Lights",
                "addressLocality": "Chennai",
                "addressRegion": "Tamil Nadu",
                "postalCode": "600002",
                "addressCountry": "IN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "HR / Careers",
                "email": "careers@teams24.co",
                "url": "https://careers.teams24.co"
              },
              "sameAs": [
                "https://www.linkedin.com/company/teams24",
                "https://www.instagram.com/teams24co",
                "https://twitter.com/teams24co"
              ]
            })
          }}
        />
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
