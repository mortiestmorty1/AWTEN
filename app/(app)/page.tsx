import { Hero, OurPlan } from '@/components/sections';
import PageLayout from '@/components/layout/page-layout';

export default async function HomePage() {
  return (
    <PageLayout>
      <div className="max-w-screen-xl mx-auto">
        <Hero />
        <OurPlan />
      </div>
    </PageLayout>
  );
}
