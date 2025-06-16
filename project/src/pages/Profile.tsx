import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, getProfileStats } from '../services/supabase';
import LogoutButton from '../components/Auth/LogoutButton';
import { Profile as ProfileType } from '../lib/types';
import 'material-symbols/outlined.css';

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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="relative w-12 h-12">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-4 border-surface-container-highest" />
          {/* Progress */}
          <div className="absolute inset-0 rounded-full border-4 border-primary animate-spin" 
            style={{
              borderRightColor: 'transparent',
              borderTopColor: 'transparent'
            }}
          />
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-orange-50">
      {/* M3 Medium App Bar */}
      <div className="sticky top-0 z-20 bg-gray-100 backdrop-blur-xl border-b border-outline-variant">
        <div className="px-6 h-20 flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Back Arrow, Headline & Subtitle (side by side) */}
          <div className="flex items-center gap-4">
            <Link 
              to="/timeline" 
              className="relative p-4 rounded-full hover:bg-surface-container-highest transition-colors h-12 w-12 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
              <span 
                className="material-symbols-outlined text-on-surface"
                style={{ 
                  fontSize: '24px',
                  fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24"
                }}
              >
                arrow_back
              </span>
            </Link>
            <div className="flex flex-col justify-center">
              <span className="text-xl sm:text-2xl font-roboto-flex font-normal text-on-surface leading-tight">
                {displayName}
              </span>
              <span className="text-sm sm:text-base font-roboto-flex font-normal text-on-surface-variant leading-snug">
                {user?.email}
              </span>
            </div>
          </div>
          {/* Right: Placeholder for symmetry */}
          <div className="w-10 h-10" />
        </div>
      </div>

      <div className="px-4 pt-6 pb-10">
        <div className="max-w-2xl mx-auto">
          {/* Stats List */}
          <ul className="divide-y divide-outline-variant bg-surface rounded-xl shadow-level1 mb-8">
            {/* Private Moments */}
            <li className="flex items-center px-4 py-3">
              <span className="material-symbols-outlined text-on-primary-container bg-primary-container rounded-lg w-10 h-10 flex items-center justify-center mr-4"
                style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}>
                lock
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-title-medium font-roboto-flex text-on-surface">Private moments</p>
                <p className="text-body-medium font-roboto-flex text-on-surface-variant truncate">Moments you created that no one else joined</p>
              </div>
              <span className="text-title-large font-roboto-flex text-on-surface font-semibold ml-4">{stats.privateCount}</span>
            </li>
            {/* Shared Moments */}
            <li className="flex items-center px-4 py-3">
              <span className="material-symbols-outlined text-on-primary-container bg-primary-container rounded-lg w-10 h-10 flex items-center justify-center mr-4"
                style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}>
                group
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-title-medium font-roboto-flex text-on-surface">Shared moments</p>
                <p className="text-body-medium font-roboto-flex text-on-surface-variant truncate">Moments you created that others joined</p>
              </div>
              <span className="text-title-large font-roboto-flex text-on-surface font-semibold ml-4">{stats.sharedCount}</span>
            </li>
            {/* Joined Moments */}
            <li className="flex items-center px-4 py-3">
              <span className="material-symbols-outlined text-on-primary-container bg-primary-container rounded-lg w-10 h-10 flex items-center justify-center mr-4"
                style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}>
                person_add
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-title-medium font-roboto-flex text-on-surface">Joined moments</p>
                <p className="text-body-medium font-roboto-flex text-on-surface-variant truncate">Moments created by others that you joined</p>
              </div>
              <span className="text-title-large font-roboto-flex text-on-surface font-semibold ml-4">{stats.joinedCount}</span>
            </li>
            {/* Cards Added */}
            <li className="flex items-center px-4 py-3">
              <span className="material-symbols-outlined text-on-primary-container bg-primary-container rounded-lg w-10 h-10 flex items-center justify-center mr-4"
                style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}>
                photo_library
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-title-medium font-roboto-flex text-on-surface">Cards added</p>
                <p className="text-body-medium font-roboto-flex text-on-surface-variant truncate">Photo or text cards you contributed to your own or others moments</p>
              </div>
              <span className="text-title-large font-roboto-flex text-on-surface font-semibold ml-4">{stats.cardsAdded}</span>
            </li>
          </ul>

          <div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;