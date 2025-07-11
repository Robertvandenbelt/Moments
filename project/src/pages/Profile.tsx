import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, getProfileStats } from '../services/supabase';
import LogoutButton from '../components/Auth/LogoutButton';
import { Profile as ProfileType } from '../lib/types';
import 'material-symbols/outlined.css';
import SidebarNav from '../components/SidebarNav';
import BottomNavBar from '../components/BottomNavBar';
import FloatingActionButton from '../components/FloatingActionButton';

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
          <div className="absolute inset-0 rounded-full border-4 border-surface-container-high" />
          {/* Progress */}
          <div className="absolute inset-0 rounded-full border-4 border-primary-500 animate-spin" 
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
    <div className="min-h-screen bg-white bg-opacity-80 relative max-w-full overflow-x-hidden">
      {/* Sidebar Navigation for md+ screens */}
      <SidebarNav />
      <div className="px-4 pt-6 pb-10 md:pl-28 lg:pl-60">
        <div className="max-w-2xl mx-auto">
          {/* User Info (centered, M3 headline and supporting text) */}
          <div className="flex flex-col items-center mb-8">
            <span className="text-2xl sm:text-3xl font-roboto-flex font-medium text-on-surface mb-1">{displayName}</span>
            <span className="text-base sm:text-lg font-roboto-flex text-on-surface-variant">{user?.email}</span>
          </div>
          {/* Stats List */}
          <ul className="bg-surface rounded-xl mb-8">
            {/* Private Moments */}
            <li className="flex items-center px-4 py-3">
              <span className="material-symbols-outlined text-on-primary-container bg-primary-container rounded-lg w-10 h-10 flex items-center justify-center mr-4"
                style={{ fontSize: '28px', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}>
                lock
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-title-medium font-roboto-flex text-on-surface">Private moments</p>
                <p className="text-body-medium font-roboto-flex text-on-surface-variant truncate">Moments you created that no one else joined</p>
              </div>
              <span className="text-title-large font-roboto-flex text-on-surface ml-4">{stats.privateCount}</span>
            </li>
            {/* Shared Moments */}
            <li className="flex items-center px-4 py-3">
              <span className="material-symbols-outlined text-on-primary-container bg-primary-container rounded-lg w-10 h-10 flex items-center justify-center mr-4"
                style={{ fontSize: '28px', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}>
                group
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-title-medium font-roboto-flex text-on-surface">Shared moments</p>
                <p className="text-body-medium font-roboto-flex text-on-surface-variant truncate">Moments you created that others joined</p>
              </div>
              <span className="text-title-large font-roboto-flex text-on-surface ml-4">{stats.sharedCount}</span>
            </li>
            {/* Joined Moments */}
            <li className="flex items-center px-4 py-3">
              <span className="material-symbols-outlined text-on-primary-container bg-primary-container rounded-lg w-10 h-10 flex items-center justify-center mr-4"
                style={{ fontSize: '28px', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}>
                person_add
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-title-medium font-roboto-flex text-on-surface">Joined moments</p>
                <p className="text-body-medium font-roboto-flex text-on-surface-variant truncate">Moments created by others that you joined</p>
              </div>
              <span className="text-title-large font-roboto-flex text-on-surface ml-4">{stats.joinedCount}</span>
            </li>
            {/* Cards Added */}
            <li className="flex items-center px-4 py-3">
              <span className="material-symbols-outlined text-on-primary-container bg-primary-container rounded-lg w-10 h-10 flex items-center justify-center mr-4"
                style={{ fontSize: '28px', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}>
                photo_library
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-title-medium font-roboto-flex text-on-surface">Cards added</p>
                <p className="text-body-medium font-roboto-flex text-on-surface-variant truncate">Photo or text cards you contributed to your own or others moments</p>
              </div>
              <span className="text-title-large font-roboto-flex text-on-surface ml-4">{stats.cardsAdded}</span>
            </li>
          </ul>

          <div className="flex justify-center">
            <LogoutButton />
          </div>
        </div>
      </div>
      {/* Bottom Navigation Bar for mobile */}
      <BottomNavBar />

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default Profile;