// app/layout.tsx (or layout.js)
import '@/app/globals.css'; // Import your global CSS file if necessary

import { ReactNode } from 'react';

export const metadata = {
  title: 'Twitter/X clone',
  description: 'Twitter clone in progress using next.js',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>

        {children}
        
        </body>
    </html>
  );
}