import PageLayout from '@/components/layout/page-layout';
import { CheckMarkIcon } from '@/components/ui/icons/website';
import {
  TargetIcon,
  CreditCardIcon,
  ChartIcon,
  ShieldIcon
} from '@/components/ui/icons/dashboard';

export default function HowItWorksPage() {
  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-awten-dark-900 mb-6">
            How AWTEN Works
          </h1>
          <p className="text-xl text-awten-dark-600 max-w-3xl mx-auto">
            AWTEN makes traffic exchange simple and effective. Here's how our
            platform works to help you grow your website traffic.
          </p>
        </div>

        {/* Step-by-Step Process */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-awten-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TargetIcon className="w-8 h-8 text-awten-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
              1. Create Campaign
            </h3>
            <p className="text-awten-dark-600">
              Set up your traffic campaign with your website URL, targeting
              options, and credit budget.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-awten-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCardIcon className="w-8 h-8 text-awten-success-600" />
            </div>
            <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
              2. Earn Credits
            </h3>
            <p className="text-awten-dark-600">
              Visit other users' websites to earn credits. Each valid visit
              earns you 1 credit.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-awten-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChartIcon className="w-8 h-8 text-awten-warning-600" />
            </div>
            <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
              3. Get Traffic
            </h3>
            <p className="text-awten-dark-600">
              Your campaign receives real visitors from other users, helping you
              grow your audience.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-awten-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldIcon className="w-8 h-8 text-awten-error-600" />
            </div>
            <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
              4. Quality Control
            </h3>
            <p className="text-awten-dark-600">
              Our fraud detection ensures all traffic is genuine and meets
              quality standards.
            </p>
          </div>
        </div>

        {/* Detailed Process */}
        <div className="space-y-16">
          {/* Getting Started */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-awten-dark-900 mb-6">
                Getting Started
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-awten-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-awten-primary-600 font-semibold">
                      1
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-awten-dark-900 mb-2">
                      Sign Up for Free
                    </h3>
                    <p className="text-awten-dark-600">
                      Create your account and get 10 free credits to start with.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-awten-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-awten-primary-600 font-semibold">
                      2
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-awten-dark-900 mb-2">
                      Create Your First Campaign
                    </h3>
                    <p className="text-awten-dark-600">
                      Add your website URL, set targeting options, and allocate
                      credits.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-awten-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-awten-primary-600 font-semibold">
                      3
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-awten-dark-900 mb-2">
                      Start Earning Credits
                    </h3>
                    <p className="text-awten-dark-600">
                      Visit other users' websites to earn credits for your
                      campaigns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-awten-dark-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
                Quick Start Checklist
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                  <span className="text-awten-dark-700">
                    Create your account
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                  <span className="text-awten-dark-700">Verify your email</span>
                </li>
                <li className="flex items-center">
                  <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                  <span className="text-awten-dark-700">
                    Set up your first campaign
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckMarkIcon className="w-5 h-5 text-awten-success-500 mr-3" />
                  <span className="text-awten-dark-700">
                    Start visiting websites
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Credit System */}
          <section className="bg-awten-dark-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-awten-dark-900 mb-8 text-center">
              How the Credit System Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-awten-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCardIcon className="w-8 h-8 text-awten-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-awten-dark-900 mb-3">
                  Earn Credits
                </h3>
                <p className="text-awten-dark-600">
                  Visit other users' websites to earn 1 credit per visit
                  instantly.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-awten-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TargetIcon className="w-8 h-8 text-awten-success-600" />
                </div>
                <h3 className="text-xl font-semibold text-awten-dark-900 mb-3">
                  Spend Credits
                </h3>
                <p className="text-awten-dark-600">
                  Allocate credits to your campaigns. Each credit brings 1
                  visitor to your website.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-awten-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldIcon className="w-8 h-8 text-awten-warning-600" />
                </div>
                <h3 className="text-xl font-semibold text-awten-dark-900 mb-3">
                  Quality Control
                </h3>
                <p className="text-awten-dark-600">
                  Our fraud detection ensures all visits are genuine and meet
                  quality standards.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-3xl font-bold text-awten-dark-900 mb-8 text-center">
              Best Practices for Success
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
                <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
                  For Campaign Owners
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-awten-success-500 mr-3 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-awten-dark-700">
                      Use descriptive campaign titles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-awten-success-500 mr-3 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-awten-dark-700">
                      Set realistic targeting options
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-awten-success-500 mr-3 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-awten-dark-700">
                      Monitor campaign performance regularly
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg border border-awten-dark-200 p-6">
                <h3 className="text-xl font-semibold text-awten-dark-900 mb-4">
                  For Visitors
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-awten-success-500 mr-3 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-awten-dark-700">
                      Click to visit and earn credits instantly
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-awten-success-500 mr-3 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-awten-dark-700">
                      Interact naturally with the content
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-awten-success-500 mr-3 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-awten-dark-700">
                      Don't use automated tools or scripts
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-awten-dark-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-awten-dark-600 mb-8">
            Join thousands of users who are already growing their website
            traffic with AWTEN.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-awten-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-awten-primary-700 transition-colors"
            >
              Get Started Free
            </a>
            <a
              href="/pricing"
              className="bg-white text-awten-primary-600 border border-awten-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-awten-primary-50 transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
