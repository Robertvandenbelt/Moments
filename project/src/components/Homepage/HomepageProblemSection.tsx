import React from 'react';
import { MessageSquare, Image, FolderOpen, Sparkles } from 'lucide-react';

const ProblemSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shared memories shouldn't live in your chat history.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            People juggle WhatsApp groups, Google Photos, and chaotic cloud folders. Moments brings peace to the mess — one shared board at a time.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12">
          {/* Chaotic Chat Thread */}
          <div className="bg-white rounded-xl p-6 shadow-md transform transition hover:-translate-y-1 duration-300">
            <div className="rounded-full bg-gray-100 p-3 w-fit mb-4">
              <MessageSquare className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chat Threads</h3>
            <p className="text-gray-600">
              Photos and memories get buried in endless chat conversations and disappear over time.
            </p>
            <div className="mt-4 bg-gray-100 p-3 rounded-lg">
              <div className="flex items-start space-x-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="bg-gray-200 rounded-lg p-2 text-sm">Remember this moment from last year?</div>
              </div>
              <div className="flex items-start space-x-2 mb-2 justify-end">
                <div className="bg-blue-100 rounded-lg p-2 text-sm">Which photo was that?</div>
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="bg-gray-200 rounded-lg p-2 text-sm">I can't find it anymore 😕</div>
              </div>
            </div>
          </div>
          
          {/* Cluttered Albums */}
          <div className="bg-white rounded-xl p-6 shadow-md transform transition hover:-translate-y-1 duration-300">
            <div className="rounded-full bg-gray-100 p-3 w-fit mb-4">
              <FolderOpen className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cluttered Albums</h3>
            <p className="text-gray-600">
              Cloud folders and shared albums quickly become disorganized and hard to navigate.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-sm overflow-hidden">
                  {i % 3 === 0 && (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <Image className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-400 text-center">
              1,254 more items...
            </div>
          </div>
          
          {/* Moments Solution */}
          <div className="bg-gradient-to-br from-orange-50 to-teal-50 rounded-xl p-6 shadow-md transform transition hover:-translate-y-1 duration-300">
            <div className="rounded-full bg-teal-100 p-3 w-fit mb-4">
              <Sparkles className="h-6 w-6 text-teal-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Moments Boards</h3>
            <p className="text-gray-600 mb-6">
              Clean, organized boards dedicated to each special memory you share together.
            </p>
            <div className="space-y-6">
              {/* Summer Trip Board */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Summer Trip 2023
                </h3>
                <p className="text-gray-500">15 Aug, 2023 - 22 Aug, 2023</p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    <img src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    <img src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  </div>
                  <span className="text-sm text-gray-500">12 cards</span>
                </div>
              </div>

              {/* Birthday Board */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Dad's Birthday
                </h3>
                <p className="text-gray-500">27 Sep, 2023</p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    <img src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    <img src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    <img src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    <img src="https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  </div>
                  <span className="text-sm text-gray-500">8 cards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;