import PageLayout from '@/components/layout/page-layout';

export default function TermsOfService() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-awten-dark-900 mb-6">
          Terms & Conditions
        </h1>

        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-semibold text-awten-dark-900 mt-8 mb-4">
            Acceptance of Terms
          </h2>
          <p className="text-awten-dark-700 mb-6">
            The AWTEN Application, or any related plug-in, console, extension or
            software (the "App"), is the sole property of AWTEN Ltd., a company
            incorporated under the laws of the United States (collectively and
            individually "AWTEN", "Company", "we," "us," or "our").
          </p>
          <p className="text-awten-dark-700 mb-6">
            The use of the App is subject to these terms of use (the "Terms of
            Use"), to our Privacy Policy{' '}
            <a
              href="/privacy-policy"
              className="text-awten-primary-600 hover:text-awten-primary-700"
            >
              /privacy-policy
            </a>
            , which forms an integral part thereof. Re-accessing and/or using
            the App and any of its contents, as updated from time to time,
            indicates that you have read and understood these Terms of Use and
            that you have received, accept, consent to, and approve its
            contents. If you do not agree to these Terms of Use, do not use the
            App.
          </p>
          <p className="text-awten-dark-700 mb-6">
            These Terms of Use will apply to any use made by you, our client,
            which may either be the user of the App, the profile owner or an
            agent thereof acting on their behalf. These Terms form a legally
            binding contract between you or anyone using the App on your behalf
            and the Company. Without derogating from the foregoing, any use of
            the App is subject to these Terms of Use and any and all applicable
            laws, rules and regulations in the country in which the App is being
            used. The responsibility to read, understand and comply with such
            applicable law is at your full responsibility as a user.
          </p>

          <h2 className="text-2xl font-semibold text-awten-dark-900 mt-8 mb-4">
            The App
          </h2>
          <p className="text-awten-dark-700 mb-6">
            AWTEN's App provides users data that allow users to easily plan,
            build, optimize, control, and scale their platform profiles to their
            needs in connection with social media networks and traffic exchange.
          </p>

          <h2 className="text-2xl font-semibold text-awten-dark-900 mt-8 mb-4">
            App's Content
          </h2>
          <p className="text-awten-dark-700 mb-6">
            ALL CONTENT AVAILABLE ON OR THROUGH THE APP IS PROVIDED ON AN "AS
            IS" BASIS, WITH ALL FAULTS, AND AWTEN DOES NOT MAKE AND FULLY
            DISCLAIMS ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND WHATSOEVER
            REGARDING THE APP AND/OR THE CONTENT, ORALLY OR IN WRITING, EXPRESS
            OR IMPLIED, WHETHER IMPLIED BY THE LAW OR OTHERWISE DERIVED FROM IT,
            PROCEDURE OR PRACTICE, TO THE MAXIMUM EXTENT PERMITTED BY LAW,
            INCLUDING ANY REPRESENTATION THAT USE OF THE APP WILL BE
            INTERFERENCE OR ERROR-FREE, OR WITH REGARD TO THE MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, RELIABILITY, OR ACCURACY OF THE
            CONTENT, NON-INFRINGEMENT, OR ANY OTHER VIOLATION.
          </p>
          <p className="text-awten-dark-700 mb-6">
            AWTEN IS NOT AND WILL NOT BE LIABLE FOR ANY USE OF THE APP OR ITS
            CONTENT OR RELIANCE ON THEM, AND BEARS NO LIABILITY FOR THE CONTENT,
            ITS CORRECTNESS, AND/OR FOR ANY USE THAT IS MADE OF IT. THE CONTENT
            IS GENERAL IN NATURE AND IS NOT A SUBSTITUTE FOR PROFESSIONAL
            CONSULTATION OF ANY TYPE. USERS SHOULD NOT RELY ON ADVICE RECEIVED
            THROUGH THE APP FOR MAKING ANY DECISION IN ANY AREA.
          </p>

          <h2 className="text-2xl font-semibold text-awten-dark-900 mt-8 mb-4">
            Contact Information
          </h2>
          <p className="text-awten-dark-700 mb-6">
            If you have questions or concerns regarding these Terms of Use,
            please contact us at:{' '}
            <a
              href="mailto:contact@awten.com"
              className="text-awten-primary-600 hover:text-awten-primary-700"
            >
              contact@awten.com
            </a>
            .
          </p>
          <p className="text-awten-dark-600 text-sm">
            Last updated on January 15, 2025
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
