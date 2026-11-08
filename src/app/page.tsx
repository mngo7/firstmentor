'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const [membersCount, setMembersCount] = useState(0);
  const [teamsCount, setTeamsCount] = useState(0);
  const [countriesCount, setCountriesCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetMembers, setTargetMembers] = useState(0);
  const [targetTeams, setTargetTeams] = useState(0);
  const [targetCountries, setTargetCountries] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  // 获取实时统计数据
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setTargetMembers(data.members);
          setTargetTeams(data.listedTeams);
          setTargetCountries(data.countriesServed);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }

    fetchStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || (targetMembers === 0 && targetTeams === 0)) return;

    // 动画持续时间（毫秒）
    const duration = 2000;
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);

    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      // 使用缓动函数让动画更流畅
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setMembersCount(Math.round(targetMembers * easeOutQuart));
      setTeamsCount(Math.round(targetTeams * easeOutQuart));
      setCountriesCount(Math.round(targetCountries * easeOutQuart));

      if (frame === totalFrames) {
        clearInterval(counter);
        // 确保最终值准确
        setMembersCount(targetMembers);
        setTeamsCount(targetTeams);
        setCountriesCount(targetCountries);
      }
    }, frameDuration);

    return () => clearInterval(counter);
  }, [isVisible, targetMembers, targetTeams, targetCountries]);

  const workProcess = [
    {
      step: 1,
      title: 'Create Profile',
      description: 'Fill in your details and preferences to join our community'
    },
    {
      step: 2,
      title: 'Match Making',
      description: 'Our algorithm connects you with the perfect mentor or mentee'
    },
    {
      step: 3,
      title: 'Connect',
      description: 'Schedule meetings and begin your mentorship journey together'
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center max-w-5xl">
        <h1 className="mb-6 text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Connect, Mentor, and Grow
        </h1>
        <h2 className="mb-8 text-2xl md:text-3xl font-semibold text-blue-600">
          in the FIRST® and STEM Community
        </h2>
        <p className="mb-12 text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Join a global network where students, educators, volunteers,<br />
          and professionals learn, collaborate, and shape the future of STEM together.
        </p>
        
        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 max-w-md sm:max-w-none mx-auto">
          <Link
            href="/mentor-match"
            className="rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Find Your Mentor
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border-2 border-blue-600 px-6 py-3 text-base font-semibold text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            Become a Mentor
          </Link>
        </div>
      </section>

      {/* Community Stats Section */}
      <section ref={statsRef} className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="mb-12 text-center text-2xl md:text-3xl font-bold text-white">
            Our Growing Global Impact
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mb-2 text-3xl md:text-4xl font-bold text-white">
                {teamsCount.toLocaleString()}
              </div>
              <div className="text-base text-blue-100">
                Listed Teams
              </div>
            </div>
            
            <div className="text-center">
              <div className="mb-2 text-3xl md:text-4xl font-bold text-white">
                {membersCount.toLocaleString()}
              </div>
              <div className="text-base text-blue-100">
                Members
              </div>
            </div>
            
            <div className="text-center">
              <div className="mb-2 text-3xl md:text-4xl font-bold text-white">
                {countriesCount}
              </div>
              <div className="text-base text-blue-100">
                Countries Served
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Process Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="mb-4 text-center text-2xl md:text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mb-16 text-center text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Get started with First Mentor in three simple steps
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {workProcess.map((process, index) => (
              <div
                key={process.step}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold shadow-lg">
                    {process.step}
                  </div>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900 px-4">
                    {process.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto px-2">
                    {process.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-300 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}