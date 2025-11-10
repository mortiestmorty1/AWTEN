import PageLayout from '@/components/layout/page-layout';
import {
  TargetIcon,
  ShieldIcon,
  ChartIcon,
  UsersIcon
} from '@/components/ui/icons/dashboard';

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-awten-dark-900 mb-6">
            About AWTEN
          </h1>
          <p className="text-xl text-awten-dark-600 max-w-3xl mx-auto">
            We're building the future of traffic exchange with advanced fraud
            detection, quality assurance, and fair credit systems that benefit
            everyone.
          </p>
        </div>

        {/* Mission Statement */}
        <section className="mb-16">
          <div className="bg-awten-primary-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-awten-dark-900 mb-6 text-center">
              Our Mission
            </h2>
            <p className="text-lg text-awten-dark-700 text-center max-w-4xl mx-auto">
              To democratize website traffic growth by creating a fair,
              transparent, and high-quality traffic exchange platform that helps
              businesses and individuals reach their audience without the
              complexity and fraud risks of traditional methods.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-awten-dark-900 mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-awten-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldIcon className="w-8 h-8 text-awten-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
                Security First
              </h3>
              <p className="text-awten-dark-600">
                Advanced fraud detection and security measures protect all users
                and ensure quality traffic.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-awten-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TargetIcon className="w-8 h-8 text-awten-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
                Fair Exchange
              </h3>
              <p className="text-awten-dark-600">
                Transparent 1:1 credit system ensures everyone gets equal value
                for their participation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-awten-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChartIcon className="w-8 h-8 text-awten-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
                Quality Focus
              </h3>
              <p className="text-awten-dark-600">
                We prioritize genuine, engaged traffic over quantity to deliver
                real value to our users.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-awten-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UsersIcon className="w-8 h-8 text-awten-error-600" />
              </div>
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
                Community Driven
              </h3>
              <p className="text-awten-dark-600">
                Built by and for the community, with features that grow based on
                user feedback.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-awten-dark-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-awten-dark-700">
                <p>
                  AWTEN was born from a simple observation: traditional traffic
                  exchange platforms were plagued by fraud, poor quality
                  traffic, and unfair systems that favored certain users over
                  others.
                </p>
                <p>
                  We set out to build something different - a platform that uses
                  advanced technology to ensure every visit is genuine, every
                  credit is earned fairly, and every user has an equal
                  opportunity to grow their website traffic.
                </p>
                <p>
                  Today, AWTEN serves thousands of users worldwide, from
                  individual bloggers to large agencies, helping them reach
                  their traffic goals through our innovative credit-based
                  exchange system.
                </p>
              </div>
            </div>
            <div className="bg-awten-dark-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-6">
                Key Milestones
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-awten-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-awten-primary-600 font-semibold text-sm">
                      2024
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-awten-dark-900">
                      Platform Launch
                    </h4>
                    <p className="text-awten-dark-600 text-sm">
                      AWTEN officially launched with core features
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-awten-success-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-awten-success-600 font-semibold text-sm">
                      1K
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-awten-dark-900">
                      First 1,000 Users
                    </h4>
                    <p className="text-awten-dark-600 text-sm">
                      Reached our first major user milestone
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-awten-warning-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-awten-warning-600 font-semibold text-sm">
                      AI
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-awten-dark-900">
                      AI Fraud Detection
                    </h4>
                    <p className="text-awten-dark-600 text-sm">
                      Launched advanced fraud prevention system
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-awten-error-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-awten-error-600 font-semibold text-sm">
                      10K
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-awten-dark-900">
                      10,000+ Visits
                    </h4>
                    <p className="text-awten-dark-600 text-sm">
                      Processed over 10,000 successful traffic exchanges
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-awten-dark-900 mb-12 text-center">
            Our Technology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
                Advanced Fraud Detection
              </h3>
              <p className="text-awten-dark-600">
                Machine learning algorithms analyze user behavior patterns to
                detect and prevent fraudulent traffic, ensuring only genuine
                visits count toward your campaigns.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
                Real-time Analytics
              </h3>
              <p className="text-awten-dark-600">
                Comprehensive analytics dashboard provides real-time insights
                into campaign performance, visitor behavior, and credit usage
                patterns.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
                Secure Infrastructure
              </h3>
              <p className="text-awten-dark-600">
                Enterprise-grade security with end-to-end encryption, secure
                payment processing, and compliance with international data
                protection standards.
              </p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-awten-dark-900 mb-12 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-awten-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-awten-primary-600">
                  JD
                </span>
              </div>
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-2">
                John Doe
              </h3>
              <p className="text-awten-primary-600 mb-2">Founder & CEO</p>
              <p className="text-awten-dark-600 text-sm">
                Former Google engineer with 10+ years in web analytics and
                traffic optimization.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-awten-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-awten-success-600">
                  AS
                </span>
              </div>
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-2">
                Alice Smith
              </h3>
              <p className="text-awten-primary-600 mb-2">CTO</p>
              <p className="text-awten-dark-600 text-sm">
                Expert in machine learning and fraud detection systems with a
                PhD in Computer Science.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-awten-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-awten-warning-600">
                  MJ
                </span>
              </div>
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-2">
                Mike Johnson
              </h3>
              <p className="text-awten-primary-600 mb-2">Head of Product</p>
              <p className="text-awten-dark-600 text-sm">
                Product strategist with experience building user-centric
                platforms at scale.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-awten-dark-50 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-awten-dark-900 mb-6">
            Get in Touch
          </h2>
          <p className="text-lg text-awten-dark-600 mb-8 max-w-2xl mx-auto">
            Have questions about AWTEN? We'd love to hear from you. Our team is
            here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@awten.com"
              className="bg-awten-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-awten-primary-700 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/signup"
              className="bg-white text-awten-primary-600 border border-awten-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-awten-primary-50 transition-colors"
            >
              Join AWTEN
            </a>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
