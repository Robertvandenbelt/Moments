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
      {/* M3 Top App Bar */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-outline-variant">
        <div className="px-6 h-20 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link 
              to="/timeline" 
              className="relative p-4 rounded-full hover:bg-surface-container-highest transition-colors"
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
          </div>

          {/* Invisible placeholder for right alignment */}
          <div className="w-10 h-10" />
        </div>
      </div>

      <div className="px-4 pt-6 pb-10">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <h1 className="text-display-small font-roboto-flex text-on-surface mb-2">{displayName}</h1>
            <p className="text-body-large font-roboto-flex text-on-surface-variant">{user?.email}</p>
          </div>

          {/* Stats List */}
          <div className="bg-surface rounded-xl shadow-level1 mb-8">
            <div className="divide-y divide-outline-variant">
              {/* Private Moments */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                    <span 
                      className="material-symbols-outlined text-on-primary-container"
                      style={{ 
                        fontSize: '24px',
                        fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24"
                      }}
                    >
                      lock
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-title-medium font-roboto-flex text-on-surface">Private moments</p>
                      <p className="text-title-large font-roboto-flex text-on-surface">{stats.privateCount}</p>
                    </div>
                    <p className="text-body-medium font-roboto-flex text-on-surface-variant">Moments you created that no one else joined</p>
                  </div>
                </div>
              </div>

              {/* Shared Moments */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                    <span 
                      className="material-symbols-outlined text-on-primary-container"
                      style={{ 
                        fontSize: '24px',
                        fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24"
                      }}
                    >
                      group
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-title-medium font-roboto-flex text-on-surface">Shared moments</p>
                      <p className="text-title-large font-roboto-flex text-on-surface">{stats.sharedCount}</p>
                    </div>
                    <p className="text-body-medium font-roboto-flex text-on-surface-variant">Moments you created that others joined</p>
                  </div>
                </div>
              </div>

              {/* Joined Moments */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                    <span 
                      className="material-symbols-outlined text-on-primary-container"
                      style={{ 
                        fontSize: '24px',
                        fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24"
                      }}
                    >
                      person_add
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-title-medium font-roboto-flex text-on-surface">Joined moments</p>
                      <p className="text-title-large font-roboto-flex text-on-surface">{stats.joinedCount}</p>
                    </div>
                    <p className="text-body-medium font-roboto-flex text-on-surface-variant">Moments created by others that you joined</p>
                  </div>
                </div>
              </div>

              {/* Cards Added */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                    <span 
                      className="material-symbols-outlined text-on-primary-container"
                      style={{ 
                        fontSize: '24px',
                        fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24"
                      }}
                    >
                      photo_library
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-title-medium font-roboto-flex text-on-surface">Cards added</p>
                      <p className="text-title-large font-roboto-flex text-on-surface">{stats.cardsAdded}</p>
                    </div>
                    <p className="text-body-medium font-roboto-flex text-on-surface-variant">Photo or text cards you contributed to your own or others moments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;