import React, { PropsWithChildren } from 'react';
import { Footer, Navbar } from '@/components/layout';

export default function PageLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main
        id="skip"
        className="md:min-h-[calc(100dvh-5rem)] min-h-[calc(100dvh-4rem)] px-4 sm:px-6 lg:px-8"
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
