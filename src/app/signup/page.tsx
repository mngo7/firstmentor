'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import Link from 'next/link';

interface FormData {
  firstName: string;
  lastName: string;
  role: 'high-school' | 'university' | 'coach' | 'professional' | 'others';
  program: string[];
  affiliation: string;
  major: string;
  jobCategory: string;
  otherSpecialties: string;
  volunteerHoursCreditedTo: string;
  country: string;
  state: string;
  zipCode: string;
  teamNumber: string;
  teamName: string;
  userType: string[];
  mentorPrograms: string[];
  mentorSpecialties: string[];
  mentorAvailability: string[];
  mentorExperience: string;
  menteeNeeds: string[];
  menteeAvailability: string[];
  menteeRequiredExperience: string;
  additionalInfo: string;
  website: string;
  linkedin: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const roleOptions = [
  { id: 'high-school', name: 'High School Student' },
  { id: 'university', name: 'University Student' },
  { id: 'coach', name: 'Coach' },
  { id: 'professional', name: 'Professional' },
  { id: 'others', name: 'Others' },
];

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
  { id: 'none', name: 'None - I am new to mentoring' },
  { id: 'other', name: 'I have other relevant experience' },
];

const programOptions = [
  { id: 'FLL Explore', name: 'FLL Explore' },
  { id: 'FLL Challenge', name: 'FLL Challenge' },
  { id: 'FTC', name: 'FIRST Tech Challenge' },
  { id: 'FRC', name: 'FIRST Robotics Competition' },
  { id: 'Others', name: 'Others' },
];

const stateOptions = [
  { id: 'AL', name: 'Alabama' },
  { id: 'AK', name: 'Alaska' },
  { id: 'AZ', name: 'Arizona' },
  { id: 'AR', name: 'Arkansas' },
  { id: 'CA', name: 'California' },
  { id: 'CO', name: 'Colorado' },
  { id: 'CT', name: 'Connecticut' },
  { id: 'DE', name: 'Delaware' },
  { id: 'DC', name: 'District of Columbia' },
  { id: 'FL', name: 'Florida' },
  { id: 'GA', name: 'Georgia' },
  { id: 'HI', name: 'Hawaii' },
  { id: 'ID', name: 'Idaho' },
  { id: 'IL', name: 'Illinois' },
  { id: 'IN', name: 'Indiana' },
  { id: 'IA', name: 'Iowa' },
  { id: 'KS', name: 'Kansas' },
  { id: 'KY', name: 'Kentucky' },
  { id: 'LA', name: 'Louisiana' },
  { id: 'ME', name: 'Maine' },
  { id: 'MD', name: 'Maryland' },
  { id: 'MA', name: 'Massachusetts' },
  { id: 'MI', name: 'Michigan' },
  { id: 'MN', name: 'Minnesota' },
  { id: 'MS', name: 'Mississippi' },
  { id: 'MO', name: 'Missouri' },
  { id: 'MT', name: 'Montana' },
  { id: 'NE', name: 'Nebraska' },
  { id: 'NV', name: 'Nevada' },
  { id: 'NH', name: 'New Hampshire' },
  { id: 'NJ', name: 'New Jersey' },
  { id: 'NM', name: 'New Mexico' },
  { id: 'NY', name: 'New York' },
  { id: 'NC', name: 'North Carolina' },
  { id: 'ND', name: 'North Dakota' },
  { id: 'OH', name: 'Ohio' },
  { id: 'OK', name: 'Oklahoma' },
  { id: 'OR', name: 'Oregon' },
  { id: 'PA', name: 'Pennsylvania' },
  { id: 'RI', name: 'Rhode Island' },
  { id: 'SC', name: 'South Carolina' },
  { id: 'SD', name: 'South Dakota' },
  { id: 'TN', name: 'Tennessee' },
  { id: 'TX', name: 'Texas' },
  { id: 'UT', name: 'Utah' },
  { id: 'VT', name: 'Vermont' },
  { id: 'VA', name: 'Virginia' },
  { id: 'WA', name: 'Washington' },
  { id: 'WV', name: 'West Virginia' },
  { id: 'WI', name: 'Wisconsin' },
  { id: 'WY', name: 'Wyoming' },
];

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    role: 'high-school',
    program: [],
    affiliation: '',
    major: '',
    jobCategory: '',
    otherSpecialties: '',
    volunteerHoursCreditedTo: '',
    country: '',
    state: '',
    zipCode: '',
    teamNumber: '',
    teamName: '',
    userType: [],
    mentorPrograms: [],
    mentorSpecialties: [],
    mentorAvailability: [],
    mentorExperience: '',
    menteeNeeds: [],
    menteeAvailability: [],
    menteeRequiredExperience: '',
    additionalInfo: '',
    website: '',
    linkedin: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [joiningTeam, setJoiningTeam] = useState<string | null>(null);

  // Invite links from listed-team emails look like /signup?team=<profile id>; prefill that team's details
  useEffect(() => {
    const teamId = new URLSearchParams(window.location.search).get('team');
    if (!teamId) return;
    fetch('/api/profiles')
      .then(res => (res.ok ? res.json() : []))
      .then((profiles: any[]) => {
        const team = profiles.find(p => p.id === teamId && p.isListedTeam);
        if (!team) return;
        const isUS = (team.country || '').toLowerCase() === 'united states';
        const stateId = isUS ? stateOptions.find(st => st.name.toLowerCase() === (team.state || '').toLowerCase())?.id || '' : '';
        setFormData(prev => ({
          ...prev,
          role: 'coach',
          program: programOptions.some(o => o.id === team.program) ? [team.program] : prev.program,
          teamNumber: team.teamNumber || '',
          teamName: team.teamName || '',
          country: team.country || '',
          state: isUS ? stateId : '',
        }));
        setJoiningTeam([team.program, team.teamNumber ? `#${team.teamNumber}` : '', team.teamName].filter(Boolean).join(' '));
      })
      .catch(() => {});
  }, []);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: keyof Pick<FormData, 'userType' | 'mentorPrograms' | 'mentorSpecialties' | 'mentorAvailability' | 'menteeNeeds' | 'menteeAvailability'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter((item: string) => item !== value)
        : [...prev[name], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (formData.userType.length === 0) {
        throw new Error('Please choose whether you want to be a mentor, a mentee, or both');
      }

      // 将表单数据映射到Google Sheet列
      const sheetData = {
        firstName: formData.firstName,             // Column D
        lastName: formData.lastName,               // Column R
        role: formData.role,                      // Column Q
        program: formData.program,                // Column C
        teamNumber: formData.teamNumber,          // Column E (high-school/coach)
        teamName: formData.teamName,              // Column F (high-school/coach)
        affiliation: formData.affiliation,        // Y/Z/AA based on role
        mentorPrograms: formData.mentorPrograms.join(', '),                              // Column AJ
        volunteerHoursCreditedTo: formData.volunteerHoursCreditedTo,                     // Column S
        country: formData.country,                // Column A
        state: formData.state,                    // Column B
        postCode: formData.zipCode,               // Column T
        isMentor: formData.userType.includes('mentor'),  // Column K
        isMentee: formData.userType.includes('mentee'),  // Column L
        mentorSpecialties: formData.mentorSpecialties,   // Column H
        availability: formData.mentorAvailability,       // Column J
        mentorExperience: formData.mentorExperience,     // Column I
        menteeNeeds: formData.menteeNeeds,              // Column U
        menteePreferredMeeting: formData.menteeAvailability,  // Column V
        menteeRequiredExperience: formData.menteeRequiredExperience,  // Column W
        additionalInfo: formData.additionalInfo,  // Column P
        website: formData.website,                // Column N
        linkedin: formData.linkedin,              // Column O
        email: formData.email,                    // Column G
        password: formData.password,              // Column X
      };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/signin?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getAffiliationLabel = () => {
    switch (formData.role) {
      case 'high-school':
        return 'Team Information';
      case 'coach':
        return 'Team Information';
      case 'university':
        return 'University Name';
      case 'professional':
        return 'Company Name';
      default:
        return 'Affiliation';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Create Your Account
          </h2>

          {joiningTeam && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-700">
              You&apos;re joining as <strong>{joiningTeam}</strong>. We&apos;ve filled in your team details. Check them and add your name and email.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email and Password - Always visible */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>

                {/* Basic Information */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Role
              </label>
              <div className="flex flex-row space-x-6 flex-wrap">
                {roleOptions.map(option => (
                  <label key={option.id} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value={option.id}
                      checked={formData.role === option.id}
                      onChange={handleInputChange}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Team/Affiliation Information */}
            <div>
              {(formData.role === 'high-school' || formData.role === 'coach') ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <MultiSelectDropdown
                        label="Program"
                        options={programOptions}
                        selectedValues={formData.program}
                        onChange={(values) => setFormData(prev => ({ ...prev, program: values }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="teamNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Team Number
                      </label>
                      <input
                        type="text"
                        id="teamNumber"
                        name="teamNumber"
                        required
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.teamNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                        Team Name
                      </label>
                      <input
                        type="text"
                        id="teamName"
                        name="teamName"
                        required
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.teamName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              ) : formData.role === 'university' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                      Your Major
                    </label>
                    <input
                      type="text"
                      id="major"
                      name="major"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.major}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700">
                      University Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="affiliation"
                      name="affiliation"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.affiliation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : formData.role === 'professional' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="jobCategory" className="block text-sm font-medium text-gray-700">
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="jobCategory"
                      name="jobCategory"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.jobCategory}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700">
                      Company Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="affiliation"
                      name="affiliation"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.affiliation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : formData.role === 'others' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="otherSpecialties" className="block text-sm font-medium text-gray-700">
                      Your Specialties
                    </label>
                    <input
                      type="text"
                      id="otherSpecialties"
                      name="otherSpecialties"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.otherSpecialties}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700">
                      Affiliation (Optional)
                    </label>
                    <input
                      type="text"
                      id="affiliation"
                      name="affiliation"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.affiliation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700">
                    Affiliation
                  </label>
                  <input
                    type="text"
                    id="affiliation"
                    name="affiliation"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.affiliation}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State{formData.country.toLowerCase() === 'united states' ? ' (Required for US)' : ' / Province / Region'}
                </label>
                {formData.country.toLowerCase() === 'united states' ? (
                  <select
                    id="state"
                    name="state"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.state}
                    onChange={handleInputChange}
                  >
                    <option value="">Select US State</option>
                    {stateOptions.map(state => (
                      <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="state"
                    name="state"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Optional"
                  />
                )}
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  {formData.country.toLowerCase() === 'united states' ? 'ZIP Code (Required for US)' : 'Postal Code'}
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  required={formData.country.toLowerCase() === 'united states'}
                  pattern={formData.country.toLowerCase() === 'united states' ? '[0-9]{5}' : undefined}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder={formData.country.toLowerCase() === 'united states' ? '5-digit ZIP code' : 'Optional'}
                />
              </div>
            </div>
            {/* User Type */}
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  I want to be a *
                </label>
                <span className="text-xs text-gray-500 italic">
                  (Choose one or both. For example, an FRC team member can be a mentee and also mentor FTC or FLL teams.)
                </span>
              </div>
              <div className="mt-2 space-y-2">
                <label className="inline-flex items-center mr-6">
                  <input
                    type="checkbox"
                    name="userType"
                    value="mentor"
                    checked={formData.userType.includes('mentor')}
                    onChange={(e) => handleCheckboxChange('userType', e.target.value)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mentor</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="userType"
                    value="mentee"
                    checked={formData.userType.includes('mentee')}
                    onChange={(e) => handleCheckboxChange('userType', e.target.value)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mentee</span>
                </label>
              </div>
            </div>

            {/* Mentor Section */}
            {formData.userType.includes('mentor') && (
              <div className="space-y-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Mentor Information</h3>

                {/* Programs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Programs you can mentor (any program, not just your own)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {programOptions.map(option => (
                      <label key={option.id} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="mentorPrograms"
                          value={option.id}
                          checked={formData.mentorPrograms.includes(option.id)}
                          onChange={(e) => handleCheckboxChange('mentorPrograms', e.target.value)}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Areas you can help with
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {specialtyOptions.map(option => (
                      <label key={option.id} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="mentorSpecialties"
                          value={option.id}
                          checked={formData.mentorSpecialties.includes(option.id)}
                          onChange={(e) => handleCheckboxChange('mentorSpecialties', e.target.value)}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When are you available?
                  </label>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {availabilityOptions.map(option => (
                      <label key={option.id} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="mentorAvailability"
                          value={option.id}
                          checked={formData.mentorAvailability.includes(option.id)}
                          onChange={(e) => handleCheckboxChange('mentorAvailability', e.target.value)}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mentoring Experience
                  </label>
                  <div className="flex flex-col space-y-3">
                    {experienceOptions.map(option => (
                      <label key={option.id} className="flex items-start">
                        <input
                          type="radio"
                          name="mentorExperience"
                          value={option.id}
                          checked={formData.mentorExperience === option.id}
                          onChange={handleInputChange}
                          className="form-radio h-4 w-4 text-blue-600 mt-1"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Volunteer hours */}
                <div>
                  <label htmlFor="volunteerHoursCreditedTo" className="block text-sm font-medium text-gray-700 mb-2">
                    Volunteer hours credited to which team/person (Optional)
                  </label>
                  <input
                    type="text"
                    id="volunteerHoursCreditedTo"
                    name="volunteerHoursCreditedTo"
                    placeholder="Enter team number or person name"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.volunteerHoursCreditedTo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Mentee Section */}
            {formData.userType.includes('mentee') && (
              <div className="space-y-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Mentee Information</h3>

                {/* Needs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Areas you need help with
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {specialtyOptions.map(option => (
                      <label key={option.id} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="menteeNeeds"
                          value={option.id}
                          checked={formData.menteeNeeds.includes(option.id)}
                          onChange={(e) => handleCheckboxChange('menteeNeeds', e.target.value)}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When would you like to meet?
                  </label>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {availabilityOptions.map(option => (
                      <label key={option.id} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="menteeAvailability"
                          value={option.id}
                          checked={formData.menteeAvailability.includes(option.id)}
                          onChange={(e) => handleCheckboxChange('menteeAvailability', e.target.value)}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Required Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Mentor Experience
                  </label>
                  <div className="flex flex-col space-y-3">
                    {experienceOptions.map(option => (
                      <label key={option.id} className="flex items-start">
                        <input
                          type="radio"
                          name="menteeRequiredExperience"
                          value={option.id}
                          checked={formData.menteeRequiredExperience === option.id}
                          onChange={handleInputChange}
                          className="form-radio h-4 w-4 text-blue-600 mt-1"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                Additional Information
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Share any additional information about yourself..."
                value={formData.additionalInfo}
                onChange={handleInputChange}
              />
            </div>

            {/* Website and LinkedIn */}
            <div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Team/Personal Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    placeholder="https://"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/..."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 italic mt-2">Share your LinkedIn or website for more opportunities.</p>
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}