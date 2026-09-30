'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChooseMembership() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Membership
          </h1>
          <p className="text-gray-600">
            Select the membership type that best fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* General Member Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200 hover:border-blue-500 transition-colors">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                General Member
              </h2>
              <p className="text-3xl font-bold text-blue-600 mb-4">Free</p>
              <p className="text-gray-600">
                Quick access to browse mentors and mentees
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Browse mentor/mentee profiles</span>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">View detailed information with "Learn More"</span>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Quick signup with email only</span>
              </div>
              <div className="flex items-start opacity-50">
                <svg className="w-6 h-6 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-gray-500">Cannot send connection requests</span>
              </div>
              <div className="flex items-start opacity-50">
                <svg className="w-6 h-6 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-gray-500">Profile not visible in search results</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/signup?type=general')}
              className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Sign Up as General Member
            </button>
          </div>

          {/* Pro Member Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
              RECOMMENDED
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Pro Member
              </h2>
              <p className="text-3xl font-bold text-blue-600 mb-4">Free</p>
              <p className="text-gray-600">
                Full access to connect and network
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">All General Member benefits</span>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 font-semibold">Send connection requests to mentors/mentees</span>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 font-semibold">Your profile visible in search results</span>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Receive connection requests from others</span>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Build your mentoring network</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/signup?type=pro')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
            >
              Sign Up as Pro Member
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
