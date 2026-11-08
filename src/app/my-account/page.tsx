'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';

const specialtyOptions = [
  { id: 'design-cad', name: 'Design and CAD' },
  { id: 'robot-programming', name: 'Robot Programming / Software Engineering' },
  { id: 'mechanical-engineering', name: 'Mechanical Engineering' },
  { id: 'electrical-engineering', name: 'Electrical Engineering' },
  { id: 'project-management', name: 'Project Management' },
  { id: 'finance-fundraising', name: 'Finance / Fundraising / Grants' },
  { id: 'marketing', name: 'Marketing / Digital Marketing' },
  { id: 'communication', name: 'Communication / Public Speaking' },
  { id: 'event-planning', name: 'Event Planning / Logistics' },
  { id: 'scholarship-career', name: 'Scholarship / Awards / Career' },
];

const availabilityOptions = [
  { id: 'weekends', name: 'Weekends' },
  { id: 'weekdays', name: 'Weekdays' },
  { id: 'mornings', name: 'Mornings' },
  { id: 'evenings', name: 'Evenings' },
  { id: 'occasional', name: 'Occasional' },
  { id: 'recurring', name: 'Recurring' },
  { id: 'virtual', name: 'Virtual' },
  { id: 'in-person', name: 'In-Person' },
];

const experienceOptions = [
  { id: 'extensive', name: 'Extensive - I have mentored multiple teams or seasons' },
  { id: 'moderate', name: 'Moderate - I have mentored at least once' },
  { id: 'limited', name: 'Limited - I have helped a team briefly' },
  { id: 'none', name: 'None - I am new to FLL mentoring' },
  { id: 'other', name: 'I have other relevant experience' },
];

const programOptions = [
  { id: 'FLL Explore', name: 'FLL Explore' },
  { id: 'FLL Challenge', name: 'FLL Challenge' },
  { id: 'FTC', name: 'FIRST Tech Challenge' },
  { id: 'FRC', name: 'FIRST Robotics Competition' },
  { id: 'Others', name: 'Others' },
];

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  program?: string;
  teamNumber?: string;
  teamName?: string;
  universityName?: string;
  companyName?: string;
  affiliation?: string;
  major?: string;
  jobCategory?: string;
  otherSpecialties?: string;
  country?: string;
  state?: string;
  postCode?: string;
  isMentor?: string;
  isMentee?: string;
  mentorSpecialties?: string;
  availability?: string;
  mentorExperience?: string;
  menteeNeeds?: string;
  menteePreferredMeeting?: string;
  menteeRequiredExperience?: string;
  additionalInfo?: string;
  website?: string;
  linkedin?: string;
  volunteerHoursCreditedTo?: string;
  mentorPrograms?: string;
}

export default function MyAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setEditedUser(userData);
      } else {
        router.push('/signin');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      router.push('/signin');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!editedUser) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      });

      if (response.ok) {
        setUser(editedUser);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/signin');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  function handleCancel() {
    setEditedUser(user);
    setIsEditing(false);
    setMessage(null);
  }

  function handleChange(field: keyof UserProfile, value: string) {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: value });
    }
  }

  // 将存储的字符串转换为数组（用于多选下拉框）
  function parseToArray(value: string | undefined): string[] {
    if (!value) return [];
    // 分割字符串，支持逗号、分号、换行符等分隔符
    return value.split(/[,;\n]/).map(item => item.trim()).filter(item => item.length > 0);
  }

  // 根据选项找到对应的 ID
  function findOptionIds(values: string[], options: Array<{ id: string; name: string }>): string[] {
    const result: string[] = [];
    values.forEach(value => {
      // 尝试精确匹配 name
      const exactMatch = options.find(opt => opt.name === value);
      if (exactMatch) {
        result.push(exactMatch.id);
        return;
      }
      // 尝试精确匹配 id
      const idMatch = options.find(opt => opt.id === value);
      if (idMatch) {
        result.push(idMatch.id);
        return;
      }
      // 尝试部分匹配
      const partialMatch = options.find(opt => 
        opt.name.toLowerCase().includes(value.toLowerCase()) || 
        value.toLowerCase().includes(opt.name.toLowerCase())
      );
      if (partialMatch) {
        result.push(partialMatch.id);
      }
    });
    return result;
  }

  // 将选中的 IDs 转换回显示名称字符串
  function idsToDisplayString(ids: string[], options: Array<{ id: string; name: string }>): string {
    return ids
      .map(id => options.find(opt => opt.id === id)?.name || id)
      .join(', ');
  }

  // 处理多选下拉框的变化
  function handleMultiSelectChange(field: keyof UserProfile, selectedIds: string[], options: Array<{ id: string; name: string }>) {
    if (editedUser) {
      const displayString = idsToDisplayString(selectedIds, options);
      setEditedUser({ ...editedUser, [field]: displayString });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Log Out
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Edit/Save/Cancel Buttons */}
          <div className="mb-6 flex gap-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* Profile Fields */}
          <div className="space-y-6">
            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser?.firstName || ''}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser?.lastName || ''}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  {isEditing ? (
                    <select
                      value={editedUser?.role || ''}
                      onChange={(e) => handleChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="high-school">High School Student</option>
                      <option value="university">University Student</option>
                      <option value="coach">Coach</option>
                      <option value="professional">Professional</option>
                      <option value="others">Others</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.role}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Role-Specific Information */}
            {((isEditing ? editedUser?.role : user.role) === 'High School Student' || (isEditing ? editedUser?.role : user.role) === 'high-school') && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    {isEditing ? (
                      <div className="[&_button]:py-2">
                        <MultiSelectDropdown
                          options={programOptions}
                          selectedValues={findOptionIds(parseToArray(editedUser?.program), programOptions)}
                          onChange={(selected) => handleMultiSelectChange('program', selected, programOptions)}
                        />
                      </div>
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.program || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.teamNumber || ''}
                        onChange={(e) => handleChange('teamNumber', e.target.value)}
                        placeholder="e.g., FRC 1234, FTC 5678, FLL 4321"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.teamNumber || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.teamName || ''}
                        onChange={(e) => handleChange('teamName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.teamName || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {((isEditing ? editedUser?.role : user.role) === 'University Student' || (isEditing ? editedUser?.role : user.role) === 'university') && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">University Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.major || ''}
                        onChange={(e) => handleChange('major', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.major || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.universityName || ''}
                        onChange={(e) => handleChange('universityName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.universityName || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {((isEditing ? editedUser?.role : user.role) === 'Coach' || (isEditing ? editedUser?.role : user.role) === 'coach') && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    {isEditing ? (
                      <div className="[&_button]:py-2">
                        <MultiSelectDropdown
                          options={programOptions}
                          selectedValues={findOptionIds(parseToArray(editedUser?.program), programOptions)}
                          onChange={(selected) => handleMultiSelectChange('program', selected, programOptions)}
                        />
                      </div>
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.program || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.teamNumber || ''}
                        onChange={(e) => handleChange('teamNumber', e.target.value)}
                        placeholder="e.g., FRC 1234, FTC 5678, FLL 4321"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.teamNumber || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.teamName || ''}
                        onChange={(e) => handleChange('teamName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.teamName || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {((isEditing ? editedUser?.role : user.role) === 'Professional' || (isEditing ? editedUser?.role : user.role) === 'professional') && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.jobCategory || ''}
                        onChange={(e) => handleChange('jobCategory', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.jobCategory || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.companyName || ''}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.companyName || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {((isEditing ? editedUser?.role : user.role) === 'Others' || (isEditing ? editedUser?.role : user.role) === 'others') && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.otherSpecialties || ''}
                        onChange={(e) => handleChange('otherSpecialties', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.otherSpecialties || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.affiliation || ''}
                        onChange={(e) => handleChange('affiliation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.affiliation || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Location */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser?.country || ''}
                      onChange={(e) => handleChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.country || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser?.state || ''}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.state || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Post Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser?.postCode || ''}
                      onChange={(e) => handleChange('postCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.postCode || 'N/A'}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Volunteer Hours */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Volunteer Hours</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volunteer hours credited to which team/person</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser?.volunteerHoursCreditedTo || ''}
                    onChange={(e) => handleChange('volunteerHoursCreditedTo', e.target.value)}
                    placeholder="Enter team number or person name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.volunteerHoursCreditedTo || 'N/A'}</p>
                )}
              </div>
            </section>

            {/* Mentor/Mentee Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mentor/Mentee Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">I want to be a Mentor</label>
                  {isEditing ? (
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editedUser?.isMentor === 'Yes' || editedUser?.isMentor === 'yes'}
                        onChange={(e) => handleChange('isMentor', e.target.checked ? 'Yes' : '')}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes, I want to be a mentor</span>
                    </label>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.isMentor || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">I want to be a Mentee</label>
                  {isEditing ? (
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editedUser?.isMentee === 'Yes' || editedUser?.isMentee === 'yes'}
                        onChange={(e) => handleChange('isMentee', e.target.checked ? 'Yes' : '')}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes, I want to be a mentee</span>
                    </label>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.isMentee || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {(user.isMentor || (editedUser?.isMentor === 'Yes' || editedUser?.isMentor === 'yes')) && (
                  <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                    <h3 className="text-lg font-semibold text-blue-900">As a Mentor</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Programs you can mentor</label>
                      {isEditing ? (
                        <MultiSelectDropdown
                          options={programOptions}
                          selectedValues={findOptionIds(parseToArray(editedUser?.mentorPrograms), programOptions)}
                          onChange={(selected) => handleMultiSelectChange('mentorPrograms', selected, programOptions)}
                        />
                      ) : (
                        <p className="px-3 py-2 bg-white rounded-lg">{user.mentorPrograms || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Areas I can help with</label>
                      {isEditing ? (
                        <MultiSelectDropdown
                          options={specialtyOptions}
                          selectedValues={findOptionIds(parseToArray(editedUser?.mentorSpecialties), specialtyOptions)}
                          onChange={(selected) => handleMultiSelectChange('mentorSpecialties', selected, specialtyOptions)}
                        />
                      ) : (
                        <p className="px-3 py-2 bg-white rounded-lg">{user.mentorSpecialties || 'N/A'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                        {isEditing ? (
                          <MultiSelectDropdown
                            options={availabilityOptions}
                            selectedValues={findOptionIds(parseToArray(editedUser?.availability), availabilityOptions)}
                            onChange={(selected) => handleMultiSelectChange('availability', selected, availabilityOptions)}
                          />
                        ) : (
                          <p className="px-3 py-2 bg-white rounded-lg">{user.availability || 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mentoring Experience</label>
                        {isEditing ? (
                          <MultiSelectDropdown
                            options={experienceOptions}
                            selectedValues={findOptionIds(parseToArray(editedUser?.mentorExperience), experienceOptions)}
                            onChange={(selected) => handleMultiSelectChange('mentorExperience', selected, experienceOptions)}
                          />
                        ) : (
                          <p className="px-3 py-2 bg-white rounded-lg">{user.mentorExperience || 'N/A'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(user.isMentee || (editedUser?.isMentee === 'Yes' || editedUser?.isMentee === 'yes')) && (
                  <div className="bg-green-50 p-6 rounded-lg space-y-4">
                    <h3 className="text-lg font-semibold text-green-900">As a Mentee</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Areas I need help with</label>
                      {isEditing ? (
                        <MultiSelectDropdown
                          options={specialtyOptions}
                          selectedValues={findOptionIds(parseToArray(editedUser?.menteeNeeds), specialtyOptions)}
                          onChange={(selected) => handleMultiSelectChange('menteeNeeds', selected, specialtyOptions)}
                        />
                      ) : (
                        <p className="px-3 py-2 bg-white rounded-lg">{user.menteeNeeds || 'N/A'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Meeting Time</label>
                        {isEditing ? (
                          <MultiSelectDropdown
                            options={availabilityOptions}
                            selectedValues={findOptionIds(parseToArray(editedUser?.menteePreferredMeeting), availabilityOptions)}
                            onChange={(selected) => handleMultiSelectChange('menteePreferredMeeting', selected, availabilityOptions)}
                          />
                        ) : (
                          <p className="px-3 py-2 bg-white rounded-lg">{user.menteePreferredMeeting || 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Mentor Experience</label>
                        {isEditing ? (
                          <MultiSelectDropdown
                            options={experienceOptions}
                            selectedValues={findOptionIds(parseToArray(editedUser?.menteeRequiredExperience), experienceOptions)}
                            onChange={(selected) => handleMultiSelectChange('menteeRequiredExperience', selected, experienceOptions)}
                          />
                        ) : (
                          <p className="px-3 py-2 bg-white rounded-lg">{user.menteeRequiredExperience || 'N/A'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Contact & Links */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact & Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editedUser?.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg break-all">{user.website || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editedUser?.linkedin || ''}
                      onChange={(e) => handleChange('linkedin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-lg break-all">{user.linkedin || 'N/A'}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 italic mt-2">Share your LinkedIn or website for more opportunities.</p>
            </section>

            {/* Additional Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
              {isEditing ? (
                <textarea
                  value={editedUser?.additionalInfo || ''}
                  onChange={(e) => handleChange('additionalInfo', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">{user.additionalInfo || 'N/A'}</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
