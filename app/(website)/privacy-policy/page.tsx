import PageLayout from '@/components/layout/page-layout';

export default function PrivacyPolicy() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-awten-dark-900 mb-6">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-awten-dark-700 mb-6">
            We at AWTEN (collectively and individually "AWTEN", "Company", "we,"
            "us," or "our") respect your privacy, and therefore we undertake to
            do our best efforts to protect it. Accordingly, this Privacy Policy
            (the "Policy") describes our policy regarding our users' data, how
            we collect and process any information relating to an identified or
            identifiable natural person ("Personal Information") and how we use
            it, whether collected and processed through the AWTEN website, or
            any related plug-in, console extension, or software (the "App")
            during the use of the App as part of our services provided to our
            users ("Services").
          </p>

          <p className="text-awten-dark-700 mb-6">
            This Policy forms an integral part of our Terms of Use (the "Terms
            of Use") and governs your use of our App and applies to all of the
            Services, features, and functionality offered by the Company. Unless
            specifically stated otherwise in this Policy, all capitalized terms
            shall have the meaning ascribed to them in the Terms of Use.
          </p>

          <h2 className="text-2xl font-semibold text-awten-dark-900 mt-8 mb-4">
            Your Acknowledgment of This Policy
          </h2>
          <p className="text-awten-dark-700 mb-6">
            By using the Services, you give your consent to our processing of
            any Personal Information as part of the Services, and that all
            Personal Information that you submit or that is collected through
            the App and/or our Services is true and may be processed by the
            Company in the manner and for the purposes described in this Privacy
            Policy. If you do not agree to the terms and conditions set forth
            herein, please do not use our Services.
          </p>

          <h2 className="text-2xl font-semibold text-awten-dark-900 mt-8 mb-4">
            Personal Information You Provide to Us
          </h2>
          <p className="text-awten-dark-700 mb-6">
            Some of the Services as currently provided or may be provided in the
            future, require registration for the App. When registering for the
            App, you will be asked to provide the following Personal
            Information:
          </p>

          <h3 className="text-xl font-semibold text-awten-dark-900 mt-6 mb-4">
            Categories of Personal Information
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-awten-dark-200">
              <thead>
                <tr className="bg-awten-dark-50">
                  <th className="border border-awten-dark-200 px-4 py-3 text-left font-semibold text-awten-dark-900">
                    Categories
                  </th>
                  <th className="border border-awten-dark-200 px-4 py-3 text-left font-semibold text-awten-dark-900">
                    Sources
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-awten-dark-200 px-4 py-3 text-awten-dark-700">
                    Identifiers, such as your registration details, name, user
                    ID, email address, telephone number, corporate details,
                    credentials
                  </td>
                  <td className="border border-awten-dark-200 px-4 py-3 text-awten-dark-700">
                    Directly from you (including automatically when you interact
                    with our Services); Third-party account providers, if you
                    link a third-party account to our Services
                  </td>
                </tr>
                <tr>
                  <td className="border border-awten-dark-200 px-4 py-3 text-awten-dark-700">
                    Username of the social network profile in connection with
                    the App
                  </td>
                  <td className="border border-awten-dark-200 px-4 py-3 text-awten-dark-700">
                    Directly from you, or automatically when you provide your
                    permission in order to receive our Services
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-awten-dark-700 mb-6">
            Please make sure you provide correct and complete information.
            Please note that without the foregoing information we will not be
            able to complete the registration and provide our Services. As long
            as the Personal Information you provided changes, you are requested
            to update us. We will retain your Personal Information in accordance
            with the requirements of the law.
          </p>

          <h2 className="text-2xl font-semibold text-awten-dark-900 mt-8 mb-4">
            Contact Us
          </h2>
          <p className="text-awten-dark-700 mb-6">
            If you have any questions about this Privacy Policy, the practices
            of this site, or your dealings with this site, please contact us at:
          </p>
          <p className="text-awten-dark-700 mb-6">
            Email:{' '}
            <a
              href="mailto:contact@awten.com"
              className="text-awten-primary-600 hover:text-awten-primary-700"
            >
              contact@awten.com
            </a>
          </p>
          <p className="text-awten-dark-600 text-sm">
            Last updated on January 15, 2025
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
