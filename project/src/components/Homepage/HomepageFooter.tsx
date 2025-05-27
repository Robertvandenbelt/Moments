import React from 'react';

const HomepageFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-orange-400">moments</span>
          </div>
          <p className="mt-4 text-gray-400 max-w-md">
            The simplest way to capture and share memories together.
          </p>
          <div className="mt-4 text-gray-300 flex items-center">
            Built with ❤️ in Europe
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-gray-400 text-sm text-center">
          <div>
            &copy; {new Date().getFullYear()} Moments. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomepageFooter; 