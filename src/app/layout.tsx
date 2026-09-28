import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { MotionProvider } from '@/components/layout/MotionProvider';
import './globals.css';

// Self-hosted variable font (weight 300–800, width 62–125%), subset to Latin + Turkish.
const archivo = localFont({
  src: '../fonts/Archivo.woff2',
  variable: '--font-archivo',
  weight: '300 800',
  display: 'swap',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }],
});

export const metadata: Metadata = {
  title: 'İsmail Yiğit Şendur, software engineer',
  description:
    'Portfolio of İsmail Yiğit Şendur: software engineer and Software Engineering student at İzmir University of Economics.',
  openGraph: {
    title: 'İsmail Yiğit Şendur, software engineer',
    description: 'AI agents, real-time apps and healthcare tools, with the interfaces on top.',
    type: 'website',
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>◍</text></svg>",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e6e9ec' },
    { media: '(prefers-color-scheme: dark)', color: '#151a21' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="font-sans">
        <noscript>
          {/* without JS the reveal animations never run, so show everything */}
          <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
