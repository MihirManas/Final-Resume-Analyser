import './globals.css';
import AntiInspect from '@/components/AntiInspect';
import Header from '@/components/Header';

export const metadata = {
  title: 'My Job Secret | AI Resume Analyzer & API',
  description: 'Bypass HR filters. Build cryptographically verifiable project portfolios and prove your engineering competence directly to tech recruiters.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen flex flex-col">
        <AntiInspect />
        <Header />
        <main className="flex-1 pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
