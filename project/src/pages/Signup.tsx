import React from 'react';
import SignupForm from '../components/Auth/SignupForm';
import { Link } from 'react-router-dom';

const Signup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-600 flex flex-col items-center justify-center px-6">
      <Link to="/" className="fixed top-6 left-6 z-50 text-white hover:text-orange-300 text-base font-medium transition-colors bg-transparent">
        ← Back to Home
      </Link>
      <div className="w-full max-w-md text-center mb-12">
        <div className="relative mb-8">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/20 rounded-full blur-xl" />
          <h1 className="text-6xl font-bold text-white relative">
            Moments
          </h1>
        </div>
        <p className="text-white/80 text-lg">
          Your private space for shared memories
        </p>
      </div>
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;