// app/layout.tsx (or layout.js)

import { ReactNode } from 'react';
import SideNav from '@/app/ui/Home/SideNav';
import SearchFollow from '@/app/ui/Home/SearchFollow';

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
        <div className='alignment' style={{ overflowY: "visible" }}>
          <SideNav></SideNav>
          {children}
          <SearchFollow></SearchFollow>
        </div>
      </body>
    </html>
  );
}