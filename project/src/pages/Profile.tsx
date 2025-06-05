import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile, getProfileStats } from '../services/supabase';
import LogoutButton from '../components/Auth/LogoutButton';
import ProfileStat from '../components/ProfileStat';
import { Profile as ProfileType } from '../lib/types';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [stats, setStats] = useState({
    privateCount: 0,
    sharedCount: 0,
    joinedCount: 0,
    cardsAdded: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          const [profileData, statsData] = await Promise.all([
            getProfile(user.id),
            getProfileStats(user.id)
          ]);
          setProfile(profileData);
          setStats(statsData);
        } catch (error) {
          console.error('Error fetching profile data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-primary px-8 pt-6 pb-10">
      <Link to="/timeline" className="text-white">
        <ArrowLeft size={32} />
      </Link>

      <div className="max-w-4xl mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-medium overflow-hidden">
            <ProfileStat 
              count={stats.privateCount} 
              label="private moments" 
              description="Moments you created that no one else joined" 
              type="private" 
            />
          </div>
          <div className="bg-white rounded-medium overflow-hidden">
            <ProfileStat 
              count={stats.sharedCount} 
              label="shared moments" 
              description="Moments you created that others joined" 
              type="shared" 
            />
          </div>
          <div className="bg-white rounded-medium overflow-hidden">
            <ProfileStat 
              count={stats.joinedCount} 
              label="joined moments" 
              description="Moments created by others that you joined" 
              type="joined" 
            />
          </div>
          <div className="bg-white rounded-medium overflow-hidden">
            <ProfileStat 
              count={stats.cardsAdded} 
              label="cards added" 
              description="Photo or text cards you contributed to your own or others moments"
              type="cards" 
            />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-on-surface">{displayName}</h1>
          <p className="text-on-surface text-sm">{user?.email}</p>
        </div>

        <div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default Profile;