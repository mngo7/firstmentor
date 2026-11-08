'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  console.log('Navbar render - isMobileMenuOpen:', isMobileMenuOpen);

  useEffect(() => {
    // 检查用户登录状态
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [pathname]); // pathname 变化时重新检查

  // Debug: Monitor mobile menu state
  useEffect(() => {
    console.log('Mobile menu state changed:', isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setShowAuthModal(false);
      }
    }

    if (showAuthModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAuthModal]);

  const isActive = (path: string) => {
    return pathname === path 
      ? 'text-blue-600 bg-blue-50' 
      : 'text-gray-600 hover:text-gray-900';
  };

  return (
    <nav className="bg-white border-b border-gray-200 relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Site Name */}
          <Link href="/" className="flex items-center space-x-3 group z-10">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden">
              <Image 
                src="/FIRST Mentor.png" 
                alt="First Mentor Logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              First Mentor
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={`${isActive('/')} px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-gray-50`}
            >
              Home
            </Link>
            <Link
              href="/mentor-match"
              className={`${isActive('/mentor-match')} px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-gray-50`}
            >
              Mentor Search
            </Link>
            <Link
              href="/messages"
              className={`${isActive('/messages')} px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-gray-50`}
            >
              Message Teams
            </Link>
            <Link
              href="/how-to-guide"
              className={`${isActive('/how-to-guide')} px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-gray-50`}
            >
              How-To Guide
            </Link>
            <Link
              href="/about"
              className={`${isActive('/about')} px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-gray-50`}
            >
              About
            </Link>
          </div>

          {/* Sign In / Sign Up Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoading ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : user ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium text-sm">
                    {user.firstName}
                  </span>
                </div>
                <Link
                  href="/my-account"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium text-sm rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  My Account
                </Link>
              </>
            ) : (
              <div className="relative" ref={authDropdownRef}>
                <button
                  onClick={() => setShowAuthModal(!showAuthModal)}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Get Started
                </button>
                {showAuthModal && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/signin"
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
                      onClick={() => setShowAuthModal(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
                      onClick={() => setShowAuthModal(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden z-50">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const newState = !isMobileMenuOpen;
                console.log('Menu button clicked, toggling from', isMobileMenuOpen, 'to', newState);
                setIsMobileMenuOpen(newState);
              }}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 active:bg-gray-200 transition-colors touch-manipulation"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <svg
                className="h-6 w-6 pointer-events-none"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12"></path>
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}
              >
                Home
              </Link>
              <Link
                href="/mentor-match"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/mentor-match')}`}
              >
                Mentor Search
              </Link>
              <Link
                href="/messages"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/messages')}`}
              >
                Message Teams
              </Link>
              <Link
                href="/how-to-guide"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/how-to-guide')}`}
              >
                How-To Guide
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/about')}`}
              >
                About
              </Link>
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200 mt-4">
                {isLoading ? (
                  <div className="px-3 py-2 text-gray-400 text-sm">Loading...</div>
                ) : user ? (
                  <>
                    <div className="px-3 py-2 flex items-center space-x-3 bg-gray-50 rounded-md mb-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-blue-600 font-semibold text-sm">
                          {user.firstName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium text-sm">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                    <Link
                      href="/my-account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      My Account
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 mt-2"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}