'use client';

import React, { PropsWithChildren } from 'react';
import { Footer } from '@/components/layout/footer';
import NavbarClient from './navbar/navbar-client';

export default function PageLayoutClient({ children }: PropsWithChildren) {
  return (
    <>
      <NavbarClient />
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
