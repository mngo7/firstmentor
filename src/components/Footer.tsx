'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* About Section */}
          <div className="md:pr-4">
            <h3 className="text-white font-semibold text-lg mb-4">First Mentor</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting mentors and mentees in the FIRST® and STEM community to foster growth, learning, and collaboration.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/mentor-match" className="text-sm hover:text-white transition-colors">
                  Mentor Search
                </Link>
              </li>
              <li>
                <Link href="/how-to-guide" className="text-sm hover:text-white transition-colors">
                  How-To Guide
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://www.firstinspires.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  FIRST Inspires
                </a>
              </li>
              <li>
                <a 
                  href="https://www.firstinspires.org/robotics/frc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  FIRST Robotics Competition
                </a>
              </li>
              <li>
                <a 
                  href="https://www.firstinspires.org/robotics/ftc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  FIRST Tech Challenge
                </a>
              </li>
              <li>
                <a 
                  href="https://www.firstinspires.org/robotics/fll" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  FIRST LEGO League
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="text-sm text-gray-400">
                Email: support@firstmentor.org
              </li>
              <li className="text-sm text-gray-400">
                Community Support
              </li>
            </ul>
            <div className="mt-6 flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/firstmentor" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p className="mb-3 text-xs text-gray-500">
            First Mentor is an independent mentorship platform for the FIRST® and STEM community. This site is not affiliated with or endorsed by FIRST®.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
            <p>&copy; {currentYear} First Mentor. All rights reserved.</p>
            <span className="hidden md:inline text-gray-600">·</span>
            <p>
              <a 
                href="https://docs.google.com/document/d/1ndyndh8Y7IDmYqMF_gxUqOdAzqTC25tCP7DMvw4FLyQ/edit?tab=t.0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              {' · '}
              <a 
                href="https://docs.google.com/document/d/1XrwOlI9Jh8YdWlwU6qdOhIdz1NC87aDoQbKlM7DLqk0/edit?tab=t.0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
