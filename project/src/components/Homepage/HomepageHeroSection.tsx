import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomepageHeroSection = () => {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Your private space for shared memories
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-10">
              Moments is the simplest, most joyful way to capture and share memories together. Perfect for birthdays, trips and spontaneous get-togethers.
            </p>
            <div>
              <Link 
                to="/signup" 
                className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-full text-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Get started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <p className="mt-6 text-white/80 text-sm">
                No public feeds. No clutter. Just your favorite memories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageHeroSection; 