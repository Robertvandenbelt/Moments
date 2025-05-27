import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  name: string;
  location: string;
  rating: number;
  image?: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ 
  quote, 
  name, 
  location, 
  rating,
  image
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic">"{quote}"</p>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
          {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-gray-500 text-sm">{location}</p>
        </div>
      </div>
    </div>
  );
};

const HomepageTestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: "We used Moments for my dad's birthday — it's like a private memory book we all made together.",
      name: "Elena",
      location: "Amsterdam",
      rating: 5,
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
    },
    {
      quote: "Our family reunion has never been so well documented. Everyone contributed their favorite photos to our shared Moment.",
      name: "Marcus",
      location: "Berlin",
      rating: 5,
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
    },
    {
      quote: "After our road trip, we created a Moment to capture all the highlights. It's so much better than scrolling through my camera roll.",
      name: "Sophie",
      location: "Paris",
      rating: 4,
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
    }
  ];

  return (
    <section className="py-16" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What People Say
          </h2>
          <p className="text-xl text-white/80">
            Hear from people who are already creating and sharing memories with Moments.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial 
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              location={testimonial.location}
              rating={testimonial.rating}
              image={testimonial.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomepageTestimonialsSection; 