import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomepageCTASection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-center">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start your first Moment today
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Create a private space for you and your friends to share and preserve your favorite memories together.
          </p>
          <div className="flex flex-col items-center">
            <Link 
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-orange-500 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors shadow-lg"
            >
              Try it with your friends today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <p className="mt-6 text-white/80">
              No public feeds. No clutter. Just your favorite memories.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageCTASection; 