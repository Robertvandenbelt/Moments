import React from 'react';
import { PlusCircle, Share, Heart } from 'lucide-react';

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
      <div className="rounded-full bg-orange-100 p-3 w-fit mb-4">
        <Icon className="h-6 w-6 text-orange-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="bg-gray-50 rounded-lg p-4">
        {visual}
      </div>
    </div>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      icon: PlusCircle,
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
      icon: Share,
      title: "Share with Friends",
      description: "Invite friends to join and contribute. No account needed to start adding photos and memories!",
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
      title: "Create Together",
      description: "Add photos and text cards to build your memory board together. Like your favorites to highlight the best moments.",
      visual: (
        <div className="space-y-4">
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-lg">Sarah's Birthday</h3>
            <p className="text-gray-500 text-sm">27 May, 2025</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              {/* Text Card */}
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <p className="text-gray-700 text-sm">"Best birthday ever! Thanks everyone for making it so special! 🎉"</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Sarah</span>
                  <button className="text-orange-500">♥</button>
                </div>
              </div>
              {/* Photo Card */}
              <div className="aspect-square rounded-lg shadow-sm relative overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg" 
                  alt="Birthday cake with candles" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                  <button className="text-white float-right">♥</button>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {/* Photo Card */}
              <div className="aspect-square rounded-lg shadow-sm relative overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/2072181/pexels-photo-2072181.jpeg" 
                  alt="Friends celebrating with balloons" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                  <button className="text-white float-right">♥</button>
                </div>
              </div>
              {/* Text Card */}
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <p className="text-gray-700 text-sm">"The cake was amazing! Recipe please! 🎂"</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Emma</span>
                  <button className="text-orange-500">♥</button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
              ))}
            </div>
            <span className="text-xs text-gray-500">4 cards</span>
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
            Three simple steps to capture moments that matter.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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

export default HowItWorksSection;