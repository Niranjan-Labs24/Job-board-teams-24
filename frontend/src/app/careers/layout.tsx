import { Metadata } from 'next';

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
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
