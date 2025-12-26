
import React from 'react';
import './globals.css';

export const metadata = {
  title: 'TutorTrack Pro | Premium Tuition Management',
  description: 'A high-performance tuition management dashboard for private tutors.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#f8fafc] text-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
