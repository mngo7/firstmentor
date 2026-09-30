'use client';

import React, { useState, useEffect } from 'react';
import MultiSelectDropdown from './MultiSelectDropdown';

type FilterOption = {
  id: string;
  name: string;
};

const roleOptions = [
  { id: 'mentor', name: 'Mentors' },
  { id: 'mentee', name: 'Mentees' },
];

const programOptions = [
  { id: 'all', name: 'All' },
  { id: 'FTC', name: 'FTC' },  // Exactly match the value in Column C
  { id: 'FRC', name: 'FRC' },
  { id: 'FLL Challenge', name: 'FLL Challenge' },
  { id: 'FLL Explore', name: 'FLL Explore' },
  { id: 'Others', name: 'Others' },
];

const specialtyOptions = [
  { id: 'all', name: 'All' },
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
  { id: 'others', name: 'Others' },
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
  { id: 'DC', name: 'District of Columbia' },
];

const experienceOptions = [
  { id: 'all', name: 'All' },
  { id: 'extensive', name: 'Extensive' },
  { id: 'moderate', name: 'Moderate' },
  { id: 'limited', name: 'Limited' },
  { id: 'none', name: 'None' },
  { id: 'other', name: 'Other experience' },
];

const mentorTypeOptions = [
  { id: 'all', name: 'All' },
  { id: 'high-school', name: 'High School Student' },
  { id: 'university', name: 'University Student' },
  { id: 'coach', name: 'Coach' },
  { id: 'professional', name: 'Professional' },
  { id: 'others', name: 'Others' },
];

const countryOptions = [
  { id: 'Argentina', name: 'Argentina' },
  { id: 'Australia', name: 'Australia' },
  { id: 'Austria', name: 'Austria' },
  { id: 'Belgium', name: 'Belgium' },
  { id: 'Brazil', name: 'Brazil' },
  { id: 'Canada', name: 'Canada' },
  { id: 'Chile', name: 'Chile' },
  { id: 'China', name: 'China' },
  { id: 'Colombia', name: 'Colombia' },
  { id: 'Costa Rica', name: 'Costa Rica' },
  { id: 'Czech Republic', name: 'Czech Republic' },
  { id: 'Denmark', name: 'Denmark' },
  { id: 'Ecuador', name: 'Ecuador' },
  { id: 'Estonia', name: 'Estonia' },
  { id: 'Finland', name: 'Finland' },
  { id: 'France', name: 'France' },
  { id: 'Germany', name: 'Germany' },
  { id: 'Greece', name: 'Greece' },
  { id: 'Hong Kong', name: 'Hong Kong' },
  { id: 'Hungary', name: 'Hungary' },
  { id: 'India', name: 'India' },
  { id: 'Indonesia', name: 'Indonesia' },
  { id: 'Ireland', name: 'Ireland' },
  { id: 'Israel', name: 'Israel' },
  { id: 'Italy', name: 'Italy' },
  { id: 'Japan', name: 'Japan' },
  { id: 'Kazakhstan', name: 'Kazakhstan' },
  { id: 'Kuwait', name: 'Kuwait' },
  { id: 'Latvia', name: 'Latvia' },
  { id: 'Lithuania', name: 'Lithuania' },
  { id: 'Luxembourg', name: 'Luxembourg' },
  { id: 'Malaysia', name: 'Malaysia' },
  { id: 'Mexico', name: 'Mexico' },
  { id: 'Netherlands', name: 'Netherlands' },
  { id: 'New Zealand', name: 'New Zealand' },
  { id: 'Norway', name: 'Norway' },
  { id: 'Panama', name: 'Panama' },
  { id: 'Paraguay', name: 'Paraguay' },
  { id: 'Peru', name: 'Peru' },
  { id: 'Philippines', name: 'Philippines' },
  { id: 'Poland', name: 'Poland' },
  { id: 'Portugal', name: 'Portugal' },
  { id: 'Qatar', name: 'Qatar' },
  { id: 'Romania', name: 'Romania' },
  { id: 'Russia', name: 'Russia' },
  { id: 'Saudi Arabia', name: 'Saudi Arabia' },
  { id: 'Singapore', name: 'Singapore' },
  { id: 'Slovakia', name: 'Slovakia' },
  { id: 'Slovenia', name: 'Slovenia' },
  { id: 'South Africa', name: 'South Africa' },
  { id: 'South Korea', name: 'South Korea' },
  { id: 'Spain', name: 'Spain' },
  { id: 'Sweden', name: 'Sweden' },
  { id: 'Switzerland', name: 'Switzerland' },
  { id: 'Taiwan', name: 'Taiwan' },
  { id: 'Thailand', name: 'Thailand' },
  { id: 'Türkiye', name: 'Türkiye' },
  { id: 'Ukraine', name: 'Ukraine' },
  { id: 'United Arab Emirates', name: 'United Arab Emirates' },
  { id: 'United Kingdom', name: 'United Kingdom' },
  { id: 'United States', name: 'United States' },
  { id: 'Uruguay', name: 'Uruguay' },
  { id: 'Venezuela', name: 'Venezuela' },
  { id: 'Vietnam', name: 'Vietnam' },
  { id: 'Other', name: 'Other' },
];

interface SearchFiltersProps {
  onFilterChange: (section: string, values: string[]) => void;
}

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [teamNumber, setTeamNumber] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [selectedMentorTypes, setSelectedMentorTypes] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoleChange = (values: string[]) => {
    setSelectedRole(values);
    onFilterChange('role', values);
  };

  const handleProgramChange = (values: string[]) => {
    // If user selects any option other than 'all', remove 'all' from the selection
    // If user selects 'all', clear all other selections
    const newValues = values.includes('all') 
      ? ['all']
      : values.filter(v => v !== 'all');
    
    setSelectedPrograms(newValues);
    onFilterChange('programs', newValues);
  };

  const handleSpecialtyChange = (values: string[]) => {
    setSelectedSpecialties(values);
    onFilterChange('specialties', values);
  };

  const handleExperienceChange = (values: string[]) => {
    const newValues = values.includes('all') 
      ? ['all']
      : values.filter(v => v !== 'all');
    
    setSelectedExperience(newValues);
    onFilterChange('experience', newValues);
  };

  const handleCountryChange = (values: string[]) => {
    setSelectedCountries(values);
    // If the selected country is not United States, clear state selection
    if (!values.includes('United States')) {
      setSelectedStates([]);
      onFilterChange('states', []);
    }
    onFilterChange('countries', values);
  };

  const handleStateChange = (values: string[]) => {
    // Only allow state selection when United States is selected
    if (selectedCountries.includes('United States')) {
      setSelectedStates(values);
      onFilterChange('states', values);
    } else {
      setSelectedStates([]);
    }
  };

  const handleTeamNumberChange = (value: string) => {
    setTeamNumber(value);
    onFilterChange('teamNumber', value ? [value] : []);
  };

  const handleTeamNameChange = (value: string) => {
    setTeamName(value);
    onFilterChange('teamName', value ? [value] : []);
  };

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    onFilterChange('firstName', value ? [value] : []);
  };

  const handleMentorTypeChange = (values: string[]) => {
    const newValues = values.includes('all') 
      ? ['all']
      : values.filter(v => v !== 'all');
    
    setSelectedMentorTypes(newValues);
    onFilterChange('mentorTypes', newValues);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          I'm looking for
        </h3>
        <div className="space-y-1.5">
          {roleOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="role"
                className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                checked={selectedRole.includes(option.id)}
                onChange={() => handleRoleChange([option.id])}
              />
              <span className="text-sm text-gray-700">{option.name}</span>
            </label>
          ))}
        </div>
      </div>

      <MultiSelectDropdown
        label="Programs"
        options={programOptions}
        selectedValues={selectedPrograms}
        onChange={handleProgramChange}
      />

      <MultiSelectDropdown
        label="Specialties"
        options={specialtyOptions}
        selectedValues={selectedSpecialties}
        onChange={handleSpecialtyChange}
      />

      <MultiSelectDropdown
        label="Experience"
        options={experienceOptions}
        selectedValues={selectedExperience}
        onChange={handleExperienceChange}
      />

      <MultiSelectDropdown
        label="Mentor Type"
        options={mentorTypeOptions}
        selectedValues={selectedMentorTypes}
        onChange={handleMentorTypeChange}
      />

      <MultiSelectDropdown
        label="Country"
        options={countryOptions}
        selectedValues={selectedCountries}
        onChange={handleCountryChange}
      />

      <div className={!selectedCountries.includes('United States') ? 'opacity-50 pointer-events-none' : ''}>
        <MultiSelectDropdown
          label="State"
          options={stateOptions}
          selectedValues={selectedStates}
          onChange={handleStateChange}
        />
      </div>

      <div>
        <label htmlFor="teamNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Search by Team Number
        </label>
        <input
          type="text"
          id="teamNumber"
          placeholder="Enter team number"
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={teamNumber}
          onChange={(e) => handleTeamNumberChange(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
          Search by Team Name
        </label>
        <input
          type="text"
          id="teamName"
          placeholder="Enter team name"
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={teamName}
          onChange={(e) => handleTeamNameChange(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
          Search by First Name
        </label>
        <input
          type="text"
          id="firstName"
          placeholder="Enter first name..."
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={firstName}
          onChange={(e) => handleFirstNameChange(e.target.value)}
        />
      </div>
    </div>
  );
}