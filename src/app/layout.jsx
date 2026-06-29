import './globals.css';

export const metadata = {
  title: 'Resume Analyzer',
  description: 'Bypass HR filters. Build cryptographically verifiable project portfolios and prove your engineering competence directly to tech recruiters.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
