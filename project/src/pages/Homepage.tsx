import React from 'react';
import { Link } from 'react-router-dom';
import HomepageHeroSection from '../components/Homepage/HomepageHeroSection';
import HomepageProblemSection from '../components/Homepage/HomepageProblemSection';
import HomepageHowItWorksSection from '../components/Homepage/HomepageHowItWorksSection';
import HomepageUseCasesSection from '../components/Homepage/HomepageUseCasesSection';
import HomepageTestimonialsSection from '../components/Homepage/HomepageTestimonialsSection';
import HomepageCTASection from '../components/Homepage/HomepageCTASection';
import HomepageFooter from '../components/Homepage/HomepageFooter';

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-600">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-teal-500 hover:text-teal-600 transition-colors">
            Moments
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <HomepageHeroSection />

        {/* Problem Section */}
        <HomepageProblemSection />

        {/* How It Works Section */}
        <HomepageHowItWorksSection />

        {/* Use Cases Section */}
        <HomepageUseCasesSection />

        {/* Testimonials Section */}
        <HomepageTestimonialsSection />

        {/* CTA Section */}
        <HomepageCTASection />
      </main>

      {/* Footer */}
      <HomepageFooter />
    </div>
  );
};

export default Homepage; 