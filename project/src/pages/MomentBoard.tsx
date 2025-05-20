import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MomentBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        <Link to="/timeline" className="inline-block text-gray-900 hover:text-gray-700 transition-colors">
          <ArrowLeft size={32} />
        </Link>
      </div>

      <div className="px-6">
        <h1 className="text-2xl font-bold text-gray-900">Moment Board {id}</h1>
        <p className="text-gray-500 mt-2">This page is under construction</p>
      </div>
    </div>
  );
};

export default MomentBoard;