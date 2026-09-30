'use client';

import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    router.push('/signup?type=pro&upgrade=true');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upgrade to Pro Member
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-6">
              The Connect feature is only available for Pro Members. Upgrade your account to:
            </p>

            {/* Benefits */}
            <div className="text-left mb-6 space-y-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Send connection requests to mentors and mentees</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Your profile visible in search results</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Receive connection requests from others</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Build your mentoring network</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-2xl font-bold text-blue-600">Free Forever</p>
              <p className="text-xs text-gray-600 mt-1">Complete your profile to unlock all features</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleUpgrade}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
