'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onSubmit: (type: 'mentor' | 'mentee', message: string) => void;
  targetName: string;
}

function MessageDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  targetName, 
  role 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (message: string) => void; 
  targetName: string;
  role: 'mentor' | 'mentee';
}) {
  const [message, setMessage] = useState('');
  const maxChars = 600;

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(message);
    setMessage('');
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] overflow-y-auto py-8"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-4 sm:p-8 max-w-lg w-full mx-4 relative my-auto max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close button */}
        <div className="sticky top-0 right-0 z-10 flex justify-end -mt-2 -mr-2 mb-2">
          <button
            onClick={onClose}
            className="bg-white rounded-full p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 shadow-md border border-gray-200 transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h3 className="text-xl font-semibold text-center mb-4">
          {role === 'mentor' ? 'Offer Mentorship' : 'Request Mentorship'}
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            {role === 'mentor' ? (
              <>Send a brief message to <strong>{targetName}</strong> about your mentoring expertise and availability.</>
            ) : (
              <>Tell <strong>{targetName}</strong> what you're hoping to learn or work on together.</>
            )}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
              placeholder={role === 'mentor' 
                ? "e.g., I have 5 years of experience in FRC programming and would love to help your team..."
                : "e.g., Our team is looking for guidance on autonomous programming for the upcoming season..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {message.length}/{maxChars} characters
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-700">
              <strong>📌 Privacy Note:</strong> First Mentor does not share personal emails by default. 
              All communication is forwarded through the platform unless both sides choose to exchange contact information.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center font-medium"
            >
              Send Request
            </button>
            <button
              onClick={onClose}
              className="w-full p-3 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Please communicate politely and responsibly. Mentors volunteer their time and may not respond immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConnectModal({
  isOpen,
  onClose,
  isLoggedIn,
  onSubmit,
  targetName
}: ConnectModalProps) {
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'mentor' | 'mentee' | null>(null);

  if (!isOpen) return null;

  const handleRoleSelect = (role: 'mentor' | 'mentee') => {
    setSelectedRole(role);
    setShowMessageDialog(true);
  };

  const handleConfirm = (message: string) => {
    if (selectedRole) {
      onSubmit(selectedRole, message);
      setShowMessageDialog(false);
      onClose();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] overflow-y-auto py-8">
        <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 my-auto max-h-[95vh] overflow-y-auto relative">
          {/* Sticky Close button */}
          <div className="sticky top-0 right-0 z-10 flex justify-end -mt-2 -mr-2 mb-2">
            <button
              onClick={onClose}
              className="bg-white rounded-full p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 shadow-md border border-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Join First Mentor</h2>
          <p className="text-gray-600 mb-6">
            To connect with mentors and mentees, please sign in or create an account.
          </p>
          <div className="space-y-4">
            <Link
              href="/signin"
              className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="block w-full text-center py-2 px-4 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] overflow-y-auto py-8"
        onClick={() => onClose()} // Close when clicking background
      >
        <div 
          className="bg-white rounded-lg p-4 sm:p-8 max-w-md w-full mx-4 relative my-auto max-h-[95vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content area
        >
          {/* Sticky Close button */}
          <div className="sticky top-0 right-0 z-10 flex justify-end -mt-2 -mr-2 mb-4">
            <button
              onClick={onClose}
              className="bg-white rounded-full p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 shadow-md border border-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('mentor')}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
            >
              I want to be a mentor
            </button>

            <button
              onClick={() => handleRoleSelect('mentee')}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
            >
              I need mentoring
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Together, we&apos;re building a strong mentoring ecosystem for the FIRST® and STEM community.
          </div>
        </div>
      </div>

      <MessageDialog
        isOpen={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
        onConfirm={handleConfirm}
        targetName={targetName}
        role={selectedRole || 'mentor'}
      />
    </>
  );
}