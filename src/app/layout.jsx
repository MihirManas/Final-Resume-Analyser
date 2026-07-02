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
      <body suppressHydrationWarning className="bg-[#020408] text-white antialiased min-h-screen flex flex-col">
        {/* Mobile View Blocker */}
        <div className="flex md:hidden min-h-screen flex-col items-center justify-center p-6 text-center bg-[#020408] z-[9999] fixed inset-0">
          <div className="w-16 h-16 rounded-2xl bg-[#009DFF]/10 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#009DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-white">Oops! Desktop Only</h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            This website is not yet ready for phone screen, experience it in laptop only, we are waiting to host you.
          </p>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-col min-h-screen w-full">
          <AntiInspect />
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
