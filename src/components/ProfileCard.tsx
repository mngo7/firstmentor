'use client';

import { useState, useEffect } from 'react';
import { MapPinIcon, AcademicCapIcon, BriefcaseIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';
import Badge from './Badge';
import ConnectModal from './ConnectModal';
import { TeamInfo } from './TeamInfo';
import { ProfileLinks } from './ProfileLinks';
import { SkillsSection } from './SkillsSection';

export interface Profile {
  id: string;
  name: string;
  lastName?: string;    // Column R - Last Name
  role?: string;        // Column Q - Mentor Type (Your Role)
  program: string;
  teamNumber: string;
  teamName: string;
  teamOrCompany: string;
  country: string;
  state: string;
  isMentor: boolean;
  isMentee: boolean;
  isListedTeam: boolean;  // Imported team listing that hasn't signed up yet
  
  // Role-specific fields
  major?: string;              // Column AB - for university students
  universityName?: string;     // Column Y - for university students
  jobCategory?: string;        // Column AC - for professionals
  companyName?: string;        // Column Z - for professionals
  otherSpecialties?: string;   // Column AD - for others
  affiliation?: string;        // Column AA - for others
  
  mentorSpecialties?: string[];
  mentorPrograms?: string[];
  mentorExperience?: 'Extensive' | 'Moderate' | 'Limited' | 'None' | 'Other';
  menteeNeeds?: string[];
  defaultNeeds?: string[];
  requiredExperience?: 'Extensive' | 'Moderate' | 'Limited' | 'None' | 'Other';
  
  areas?: string[];
  skills?: string[];
  availability: string[]; // Column J
  menteePreferredMeeting?: string[]; // Column J for mentee meetings
  menteeRequiredExperience?: 'Extensive' | 'Moderate' | 'Limited' | 'None' | 'Other'; // Column I for mentee preferred experience
  introduction?: string;
  teamWebsite?: string;
  website?: string;
  linkedin?: string;
  detailedDescription: string;
  canConnect: boolean;  // Whether this profile has an email that can receive connection requests
}

interface ProfileCardProps {
  profile: Profile;
  autoExpand?: boolean;
}

export default function ProfileCard({ profile, autoExpand = false }: ProfileCardProps): JSX.Element {
  const [showDetails, setShowDetails] = useState(autoExpand);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user info
    async function getCurrentUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Failed to get user info:', error);
        setIsLoggedIn(false);
      }
    }
    getCurrentUser();
  }, []);

  const handleConnect = () => {
    setShowConnectModal(true);
  };

  const handleConnectSubmit = async (type: 'mentor' | 'mentee', message: string) => {
    try {
      if (!user) {
        alert('Please sign in to send connection requests');
        return;
      }

      if (!profile.canConnect) {
        alert('Sorry, this user has not provided a valid email address yet. They cannot receive connection requests at this time.');
        setShowConnectModal(false);
        return;
      }

      // Send connection request via API (sender details come from the signed-in session)
      const response = await fetch('/api/connections/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: profile.id,
          message: message,
          requestType: type,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Message sent! They will get it by email, and you can follow the conversation in your Inbox.');
        setShowConnectModal(false);
      } else {
        throw new Error(result.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Failed to submit connection request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send connection request. Please try again.';
      alert(errorMessage);
    }
  };

  const handleLearnMore = () => {
    // 检查用户是否已登录
    if (!isLoggedIn) {
      // 如果未登录，显示连接模态框（会显示登录提示）
      setShowConnectModal(true);
    } else {
      // 如果已登录，显示详情
      setShowDetails(true);
    }
  };

  // Check if this profile can receive connection requests
  const hasValidEmail = profile.canConnect;

  // Prepare display content
  const location = profile.state !== profile.country ? `${profile.country} - ${profile.state}` : profile.country;
  const introduction = profile.detailedDescription?.slice(0, 150) + '...';
  
  // Derived display values
  const specialties = profile.isMentor ? profile.mentorSpecialties || [] : [];
  const needs = profile.isMentee ? profile.menteeNeeds || [] : [];
  const defaultSkills = profile.defaultNeeds || [];

  // Role-specific information display (small text under badges)
  const getRoleSpecificInfo = () => {
    if (!profile.role) return null;
    
    const roleLower = profile.role.toLowerCase();
    
    if (roleLower === 'university' || roleLower === 'university student') {
      return (
        <div className="text-sm text-gray-600 mt-1">
          {profile.major && <div><span className="font-medium">Major:</span> {profile.major}</div>}
          {profile.universityName && <div><span className="font-medium">University:</span> {profile.universityName}</div>}
        </div>
      );
    } else if (roleLower === 'professional') {
      return (
        <div className="text-sm text-gray-600 mt-1">
          {profile.jobCategory && <div><span className="font-medium">Job Title:</span> {profile.jobCategory}</div>}
          {profile.companyName && <div><span className="font-medium">Company:</span> {profile.companyName}</div>}
        </div>
      );
    } else if (roleLower === 'others' || roleLower === 'other') {
      return (
        <div className="text-sm text-gray-600 mt-1">
          {profile.otherSpecialties && <div><span className="font-medium">Specialties:</span> {profile.otherSpecialties}</div>}
          {profile.affiliation && <div><span className="font-medium">Affiliation:</span> {profile.affiliation}</div>}
        </div>
      );
    }
    return null;
  };

  // Main info display (replaces team info for certain roles)
  const renderMainInfo = () => {
    if (!profile.role) {
      return (
        <TeamInfo
          teamNumber={profile.teamNumber}
          teamName={profile.teamName}
          program={profile.program}
          location={location}
          className="text-sm"
        />
      );
    }
    
    const roleLower = profile.role.toLowerCase();
    
    // For university students, show major and university
    if (roleLower === 'university' || roleLower === 'university student') {
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm min-w-0">
          {profile.major && (
            <div className="flex items-center gap-2 text-gray-600 min-w-0">
              <AcademicCapIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{profile.major}</span>
            </div>
          )}
          {profile.universityName && (
            <div className="flex items-center gap-2 text-gray-600 min-w-0">
              <BuildingOfficeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{profile.universityName}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-gray-600 min-w-0">
              <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      );
    } 
    // For professionals, show job title and company
    else if (roleLower === 'professional') {
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm min-w-0">
          {profile.jobCategory && (
            <div className="flex items-center gap-2 text-gray-600 min-w-0">
              <BriefcaseIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{profile.jobCategory}</span>
            </div>
          )}
          {profile.companyName && (
            <div className="flex items-center gap-2 text-gray-600 min-w-0">
              <BuildingOfficeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{profile.companyName}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-gray-600 min-w-0">
              <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      );
    } 
    // For others, show specialties and affiliation
    else if (roleLower === 'others' || roleLower === 'other') {
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm min-w-0">
          {profile.otherSpecialties && (
            <div className="flex items-center gap-2 text-gray-600 min-w-0">
              <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{profile.otherSpecialties}</span>
            </div>
          )}
          {profile.affiliation && (
            <div className="flex items-center gap-2 text-gray-600 min-w-0">
              <BuildingOfficeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{profile.affiliation}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-gray-600 min-w-0">
              <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      );
    }
    // Default: show team info for high-school students and coaches
    else {
      return (
        <TeamInfo
          teamNumber={profile.teamNumber}
          teamName={profile.teamName}
          program={profile.program}
          location={location}
          className="text-sm"
        />
      );
    }
  };

  const renderConnectButton = (className?: string) => (
    <button
      onClick={handleConnect}
      disabled={!hasValidEmail}
      className={`px-6 py-2 rounded-md transition-colors shadow-sm ${className} ${
        hasValidEmail 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      title={!hasValidEmail ? 'Contact information not available' : 'Send connection request'}
    >
      Connect
    </button>
  );

  const renderRoleBadges = (size: 'sm' | 'md' = 'sm', className?: string) => (
    <div className={`flex gap-2 ${className}`}>
      {profile.isMentor && <Badge text="Mentor" variant="blue" size={size} />}
      {profile.isMentee && <Badge text="Mentee" variant="green" size={size} />}
    </div>
  );

  const renderDetailsModal = () => {
    if (!showDetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl my-4 max-h-[95vh] overflow-y-auto relative">
          {/* Sticky Close Button */}
          <div className="sticky top-0 right-0 z-10 flex justify-end -mt-2 -mr-2 mb-2">
            <button
              onClick={() => setShowDetails(false)}
              className="bg-white rounded-full p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 shadow-md border border-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex justify-between items-start mb-4 gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 break-words">
                {profile.name}{profile.lastName && profile.lastName.trim() !== '' ? ` ${profile.lastName.charAt(0).toUpperCase()}.` : ''}
              </h2>
              {renderRoleBadges('md', 'mt-2')}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <TeamInfo
              teamNumber={profile.teamNumber}
              teamName={profile.teamName}
              program={profile.program}
              location={location}
              className="mb-4"
            />

            <ProfileLinks 
              website={profile.website} 
              linkedin={profile.linkedin} 
              iconSize="md"
              className="mb-4"
            />

            {profile.detailedDescription && (
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">About</h3>
                <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line break-words">
                  {profile.detailedDescription}
                </p>
              </div>
            )}

            {profile.isMentor && (
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-3 sm:mb-4">As a Mentor</h2>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Programs (Mentoring preference)</h3>
                  {profile.mentorPrograms && profile.mentorPrograms.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.mentorPrograms.map(program => (
                        <span key={program} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {program}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No specific program preference specified</p>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Areas I Can Help With</h3>
                  {profile.mentorSpecialties && profile.mentorSpecialties.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.mentorSpecialties.map(specialty => (
                        <span key={specialty} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Common Areas of Support:</p>
                      <ul className="list-none space-y-1 text-xs mb-2">
                        <li>Design and CAD</li>
                        <li>Robot Programming / Software Engineering</li>
                        <li>Mechanical Engineering</li>
                        <li>Electrical Engineering</li>
                        <li>Project Management</li>
                        <li>Finance / Fundraising / Grants</li>
                        <li>Marketing / Digital Marketing</li>
                        <li>Communication / Public Speaking</li>
                        <li>Event Planning / Logistics</li>
                        <li>Scholarship / Awards / Career</li>
                      </ul>
                      <p className="text-xs italic">Please reach out to the participant directly to learn more about their specific needs.</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Availability</h3>
                  {profile.availability && profile.availability.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.availability.map(time => (
                        <span key={time} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {time}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Availability Options:</p>
                      <ul className="list-none space-y-1 text-xs mb-2">
                        <li>Weekends</li>
                        <li>Weekdays</li>
                        <li>Mornings</li>
                        <li>Evenings</li>
                        <li>Occasional</li>
                        <li>Recurring</li>
                        <li>Virtual</li>
                        <li>In-Person</li>
                      </ul>
                      <p className="text-xs italic">Please contact the participant to confirm your mutually preferred mentoring schedule and format.</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Experience Level</h3>
                  {profile.mentorExperience ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {profile.mentorExperience}
                    </span>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Common Ways to Describe Mentoring Experience:</p>
                      <ul className="list-none space-y-2 text-xs mb-3">
                        <li><span className="font-medium">Extensive</span> – I have mentored multiple teams or seasons</li>
                        <li><span className="font-medium">Moderate</span> – I have mentored at least once</li>
                        <li><span className="font-medium">Limited</span> – I have helped a team briefly</li>
                        <li><span className="font-medium">None</span> – I am new to mentoring</li>
                        <li><span className="font-medium">Other Relevant Experience</span> – I have related skills or experience outside FLL</li>
                      </ul>
                      <p className="text-xs italic">We encourage an inclusive and supportive community where growing mentors are given opportunities, understanding, and guidance as they continue to learn and contribute.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {profile.isMentee && (
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <h2 className="text-lg sm:text-xl font-semibold text-green-900 mb-3 sm:mb-4">As a Mentee</h2>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Areas I Need Help With</h3>
                  {profile.menteeNeeds && profile.menteeNeeds.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.menteeNeeds.map(need => (
                        <span key={need} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {need}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Common Areas of Support:</p>
                      <ul className="list-none space-y-1 text-xs mb-2">
                        <li>Design and CAD</li>
                        <li>Robot Programming / Software Engineering</li>
                        <li>Mechanical Engineering</li>
                        <li>Electrical Engineering</li>
                        <li>Project Management</li>
                        <li>Finance / Fundraising / Grants</li>
                        <li>Marketing / Digital Marketing</li>
                        <li>Communication / Public Speaking</li>
                        <li>Event Planning / Logistics</li>
                        <li>Scholarship / Awards / Career</li>
                      </ul>
                      <p className="text-xs italic">Please reach out to the participant directly to learn more about their specific needs.</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Availability</h3>
                  {profile.menteePreferredMeeting && profile.menteePreferredMeeting.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.menteePreferredMeeting.map(time => (
                        <span key={time} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {time}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Availability Options:</p>
                      <ul className="list-none space-y-1 text-xs mb-2">
                        <li>Weekends</li>
                        <li>Weekdays</li>
                        <li>Mornings</li>
                        <li>Evenings</li>
                        <li>Occasional</li>
                        <li>Recurring</li>
                        <li>Virtual</li>
                        <li>In-Person</li>
                      </ul>
                      <p className="text-xs italic">Please contact the participant to confirm your mutually preferred mentoring schedule and format.</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-green-800 mb-2">Preferred Mentor Experience</h3>
                  {profile.menteeRequiredExperience ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {profile.menteeRequiredExperience}
                    </span>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Common Ways to Describe Mentoring Experience:</p>
                      <ul className="list-none space-y-2 text-xs mb-3">
                        <li><span className="font-medium">Extensive</span> – I have mentored multiple teams or seasons</li>
                        <li><span className="font-medium">Moderate</span> – I have mentored at least once</li>
                        <li><span className="font-medium">Limited</span> – I have helped a team briefly</li>
                        <li><span className="font-medium">None</span> – I am new to mentoring</li>
                        <li><span className="font-medium">Other Relevant Experience</span> – I have related skills or experience outside FLL</li>
                      </ul>
                      <p className="text-xs italic">We encourage an inclusive and supportive community where growing mentors are given opportunities, understanding, and guidance as they continue to learn and contribute.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              {renderConnectButton('w-full sm:w-auto')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative">
      <div className="p-5">
        {/* Header Section with Team Info */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="flex-1 min-w-0">
              {/* Name and Role Tags */}
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-gray-900 break-words">
                  {profile.name}{profile.lastName && profile.lastName.trim() !== '' ? ` ${profile.lastName.charAt(0).toUpperCase()}.` : ''}
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.role && profile.role.trim() !== '' && (
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {profile.role === 'high-school' ? 'High School Student' :
                       profile.role === 'university' ? 'University Student' :
                       profile.role === 'coach' ? 'Coach' :
                       profile.role === 'professional' ? 'Professional' :
                       profile.role === 'others' ? 'Others' : profile.role}
                    </span>
                  )}
                  {profile.isMentor && (
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      Mentor
                    </span>
                  )}
                  {profile.isMentee && (
                    <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      Mentee
                    </span>
                  )}
                </div>
              </div>

              {/* Team Info or Role-specific Info */}
              <div className="mt-2">
                {renderMainInfo()}
              </div>
            </div>
          </div>
        </div>

        {/* Mentor and Mentee Sections Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Mentor Section */}
          {profile.isMentor && (
            <div className="bg-blue-50 p-3 rounded-lg h-full">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">As a Mentor</h3>
              
              {/* Areas I Can Help With */}
              <div>
                <h4 className="text-xs font-medium text-blue-800 mb-1">Areas I Can Help With</h4>
                <div className="text-xs text-gray-600">
                  <p>Click "Learn more" to see how I can help</p>
                </div>
              </div>
            </div>
          )}

          {/* Mentee Section */}
          {profile.isMentee && (
            <div className="bg-green-50 p-3 rounded-lg h-full">
              <h3 className="text-sm font-semibold text-green-900 mb-3">As a Mentee</h3>
              
              {/* Areas I Need Help With */}
              <div>
                <h4 className="text-xs font-medium text-green-800 mb-1">Areas I Need Help With</h4>
                <div className="text-xs text-gray-600">
                  <p>Click "Learn more" to see areas where I need support</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="mb-4">
          <ProfileLinks website={profile.website} linkedin={profile.linkedin} />
        </div>

        {/* Bottom Actions - Learn More (Left) and Connect (Right) */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleLearnMore}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Learn more
          </button>
          
          <button
            onClick={handleConnect}
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            Connect
          </button>
        </div>

        {/* Modals */}
        {showConnectModal && (
          <ConnectModal
            isOpen={showConnectModal}
            onClose={() => setShowConnectModal(false)}
            isLoggedIn={isLoggedIn}
            onSubmit={handleConnectSubmit}
            targetName={profile.name.split(' ')[0]}
          />
        )}



        {renderDetailsModal()}
      </div>
    </div>
  );


}