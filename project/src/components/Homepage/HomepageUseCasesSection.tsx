import React from 'react';
import { Cake, Globe, Home, GraduationCap, Heart, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UseCaseProps {
  icon: React.ElementType;
  title: string;
  color: string;
}

const UseCase: React.FC<UseCaseProps> = ({ icon: Icon, title, color }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center ${color}`}>
    <Icon className="h-8 w-8 mr-4" />
    <span className="text-lg font-medium">{title}</span>
  </div>
);

const HomepageUseCasesSection: React.FC = () => {
  const useCases = [
    { icon: Cake, title: "Birthday dinners", color: "text-pink-500" },
    { icon: Globe, title: "Road trips", color: "text-blue-500" },
    { icon: Home, title: "Family weekends", color: "text-green-500" },
    { icon: GraduationCap, title: "Graduations", color: "text-purple-500" },
    { icon: Heart, title: "Weddings", color: "text-red-500" },
    { icon: UtensilsCrossed, title: "Tuesday pasta night", color: "text-yellow-500" }
  ];

  return (
    <section className="py-16 bg-gray-50" id="use-cases">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Moments to Capture
          </h2>
          <p className="text-xl text-gray-600">
            Life is full of moments worth remembering. Here are a few ideas to get you started.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <UseCase 
              key={index}
              icon={useCase.icon}
              title={useCase.title}
              color={useCase.color}
            />
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            And countless other moments that matter to you and your loved ones.
          </p>
          <Link 
            to="/signup"
            className="inline-flex items-center px-5 py-2 bg-teal-400 text-white rounded-full text-lg font-medium hover:bg-teal-500 transition-colors"
          >
            Create your first moment
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomepageUseCasesSection; 