'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProfileCard from '@/components/ProfileCard';
import { Profile } from '@/components/ProfileCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profiles');
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        
        const profiles: Profile[] = await response.json();
        
        // Find profile by email (since profileId might be email)
        const foundProfile = profiles.find(
          p => p.email === decodeURIComponent(profileId) || p.id === profileId
        );
        
        if (foundProfile) {
          setProfile(foundProfile);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The profile you are looking for does not exist.'}</p>
            <a
              href="/mentor-match"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Mentor Search
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-6">
            <a
              href="/mentor-match"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Mentor Search
            </a>
          </div>
          
          {/* Force the profile card to show details by passing a prop */}
          <div className="profile-detail-view">
            <ProfileCard profile={profile} autoExpand={true} />
          </div>
        </div>
      </main>
    </div>
  );
}
