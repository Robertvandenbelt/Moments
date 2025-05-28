import React from 'react';
import { Image } from 'lucide-react';
import StepCard from './StepCard';

const HomepageHowItWorksSection = () => {
  const steps = [
    {
      title: "Create a Moment",
      description: "Start by giving your moment a name and date. Perfect for birthdays, trips, or any special occasion.",
      visual: (
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Name your moment"
              className="w-full text-xl font-bold text-gray-900 bg-transparent outline-none border-b border-gray-200 pb-2 mb-2"
              defaultValue="Sarah's birthday"
            />
            <p className="text-gray-500">27 May, 2025</p>
          </div>
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors">
              Create moment
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Share with Friends",
      description: "Invite friends to join and contribute. No account needed to start adding photos and memories!",
      visual: (
        <div className="bg-whatsapp-light rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <button className="text-black" tabIndex={-1} aria-label="Close">✕</button>
          </div>
          <div className="text-center">
            <div className="mb-4">
              <span role="img" aria-label="celebration" className="text-4xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-black">Your moment is live!</h3>
            <p className="text-gray-600 mb-6">Share it with your friends and family</p>
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <h4 className="font-semibold text-gray-900">Sarah's birthday</h4>
              <p className="text-gray-500 text-sm">27 May, 2025 - 27 May, 2025</p>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm truncate flex-1">http://getmoments.net/join/195293b3-8277-4a...</span>
                  <button className="px-4 py-1 bg-orange-500 text-white rounded-full text-sm">Copy</button>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-whatsapp text-white rounded-full font-medium">
              Share via WhatsApp
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Create Together",
      description: "Add photos and text cards to build your memory board together. Like your favorites to highlight the best moments.",
      visual: (
        <div className="bg-white rounded-2xl p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Sarah's Birthday</h3>
              <p className="text-sm text-gray-500">27 May, 2025</p>
            </div>
            <div className="flex justify-center gap-2 mb-4">
              <button className="px-4 py-2 bg-teal-500 text-white rounded-full text-sm font-medium">
                All cards
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 flex items-center gap-2">
                Favorites
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden shadow-sm group">
                  <div className="relative flex-1 bg-gradient-to-br from-teal-500 to-teal-400 p-6 flex items-center justify-center">
                    <p className="text-white text-lg font-medium text-center">
                      "Best birthday ever! Thanks everyone for making it so special! 🎉"
                    </p>
                  </div>
                  <div className="px-3 py-2 border-t border-black/10 flex justify-between items-center bg-white">
                    <span className="text-gray-600 text-sm font-medium truncate">Sarah</span>
                    <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-orange-500">
                      ♥
                    </button>
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden shadow-sm group">
                  <div className="relative aspect-square bg-gray-100">
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="px-3 py-2 border-t border-gray-100 flex justify-between items-center bg-white">
                    <span className="text-gray-600 text-sm font-medium truncate">Emma</span>
                    <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-orange-500">
                      ♥
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden shadow-sm group">
                  <div className="relative aspect-square bg-gray-100">
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="px-3 py-2 border-t border-gray-100 flex justify-between items-center bg-white">
                    <span className="text-gray-600 text-sm font-medium truncate">Michael</span>
                    <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                      ♥
                    </button>
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden shadow-sm group">
                  <div className="relative flex-1 bg-gradient-to-br from-teal-500 to-teal-400 p-6 flex items-center justify-center">
                    <p className="text-white text-lg font-medium text-center">
                      "The cake was amazing! Recipe please! 🎂"
                    </p>
                  </div>
                  <div className="px-3 py-2 border-t border-black/10 flex justify-between items-center bg-white">
                    <span className="text-gray-600 text-sm font-medium truncate">Emma</span>
                    <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                      ♥
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Favorite and Download",
      description: "Favorite the cards you like the most and revisit them whenever you like. Or download them in the original quality.",
      visual: (
        <div className="bg-white rounded-2xl p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Sarah's Birthday</h3>
              <p className="text-sm text-gray-500">27 May, 2025</p>
            </div>
            <div className="flex justify-center gap-2">
              <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                All cards
              </button>
              <button className="px-4 py-2 bg-teal-500 text-white rounded-full text-sm font-medium flex items-center gap-2">
                Favorites
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative rounded-xl overflow-hidden shadow-sm group">
                <div className="relative flex-1 bg-gradient-to-br from-teal-500 to-teal-400 p-6 flex items-center justify-center">
                  <p className="text-white text-lg font-medium text-center">
                    "Best birthday ever! Thanks everyone for making it so special! 🎉"
                  </p>
                </div>
                <div className="px-3 py-2 border-t border-black/10 flex justify-between items-center bg-white">
                  <span className="text-gray-600 text-sm font-medium truncate">Sarah</span>
                  <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-orange-500">
                    ♥
                  </button>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden shadow-sm group">
                <div className="relative aspect-square bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div className="px-3 py-2 border-t border-gray-100 flex justify-between items-center bg-white">
                  <span className="text-gray-600 text-sm font-medium truncate">Emma</span>
                  <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-orange-500">
                    ♥
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors">
                Download all
              </button>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-16 bg-gray-50" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Four simple steps to capture moments that matter.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <StepCard 
              key={index}
              title={step.title}
              description={step.description}
              visual={step.visual}
              stepNumber={index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomepageHowItWorksSection;