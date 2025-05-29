import React from 'react';
import { PlusCircle, Heart, Download, Image } from 'lucide-react';

const StepCard = ({ 
  icon: Icon, 
  title, 
  description, 
  visual
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  visual: React.ReactNode;
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md transform transition hover:-translate-y-1 duration-300">
      <div className="flex justify-start mb-4">
        <div className="rounded-full bg-orange-100 p-3 w-12 h-12 flex items-center justify-center">
          <Icon className="h-6 w-6 text-orange-500" />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="bg-gray-50 rounded-lg p-4">
        {visual}
      </div>
    </div>
  );
};

const HomepageHowItWorksSection = () => {
  const steps = [
    {
      icon: PlusCircle,
      title: "Create and share with friends",
      description: "Start by giving your moment a name and date, then invite friends to join and contribute. No account needed!",
      visual: (
        <div className="bg-[#e8ffd7] rounded-lg p-4">
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
            <button className="w-full py-3 bg-[#25D366] text-white rounded-full font-medium">
              Share via WhatsApp
            </button>
          </div>
        </div>
      )
    },
    {
      icon: Heart,
      title: "Create together, favorite and download",
      description: "Add photos and text cards to build your memory board together. Favorite the cards you like the most and download them in original quality.",
      visual: (
        <div className="bg-white rounded-2xl p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Sarah's Birthday</h3>
              <p className="text-sm text-gray-500">27 May, 2025</p>
            </div>
            <div className="flex justify-center gap-2">
              <button className="px-4 py-2 bg-teal-500 text-white rounded-full text-sm font-medium">
                All cards
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 flex items-center gap-2">
                <Heart size={16} /> Favorites
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Text Card */}
              <div className="relative rounded-xl overflow-hidden shadow-sm group">
                <div className="relative aspect-square bg-gradient-to-br from-teal-500 to-lime-300">
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <p className="text-white text-lg font-medium text-center">
                      "Best birthday ever! 🎉"
                    </p>
                  </div>
                </div>
                <div className="px-3 py-2 border-t border-black/10 flex justify-between items-center bg-white">
                  <span className="text-gray-600 text-sm font-medium truncate">Sarah</span>
                  <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-orange-500">
                    <Heart size={18} className="fill-current" />
                  </button>
                </div>
              </div>
              {/* Photo Card */}
              <div className="relative rounded-xl overflow-hidden shadow-sm group">
                <div className="relative aspect-square bg-gray-200">
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div className="px-3 py-2 border-t border-gray-100 flex justify-between items-center bg-white">
                  <span className="text-gray-600 text-sm font-medium truncate">Emma</span>
                  <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-orange-500">
                    <Heart size={18} className="fill-current" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium flex items-center gap-2">
                <Download size={16} />
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
            Create and share memories in two simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <StepCard 
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              visual={step.visual}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomepageHowItWorksSection;