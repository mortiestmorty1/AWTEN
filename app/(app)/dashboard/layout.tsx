import React, { PropsWithChildren } from 'react';
import { Metadata } from 'next';
import { getURL } from '@/lib/utils';
import DashboardLayoutClient from '@/app/(app)/dashboard/dashboard-layout-client';
import { AppProvider } from '@/contexts/AppContext';

const meta = {
  title: 'AWTEN Dashboard',
  description: 'Manage your traffic campaigns and track performance.',
  cardImage: '/og.png',
  robots: 'nofollow, noindex',
  favicon: '/favicon.ico',
  url: getURL()
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: meta.title,
    description: meta.description,
    referrer: 'origin-when-cross-origin',
    keywords: ['AWTEN', 'Dashboard', 'Traffic Exchange', 'Campaigns'],
    authors: [{ name: 'AWTEN' }],
    creator: 'AWTEN',
    publisher: 'AWTEN',
    robots: meta.robots,
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
    openGraph: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
      type: 'website',
      siteName: meta.title
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AWTEN',
      creator: '@AWTEN',
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage]
    }
  };
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <AppProvider>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </AppProvider>
  );
}
