import React from 'react';

interface ProgramSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

const PROGRAM_OPTIONS = [
  { value: 'frc', label: 'FRC' },
  { value: 'ftc', label: 'FTC' },
  { value: 'fll-challenge', label: 'FLL Challenge' },
  { value: 'fll-explore', label: 'FLL Explore' },
];

export default function ProgramSelect({ value, onChange, className = '' }: ProgramSelectProps) {
  const handleChange = (program: string) => {
    if (value.includes(program)) {
      onChange(value.filter(p => p !== program));
    } else {
      onChange([...value, program]);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {PROGRAM_OPTIONS.map((program) => (
        <button
          key={program.value}
          type="button"
          onClick={() => handleChange(program.value)}
          className={`px-3 py-1 rounded-full text-sm ${
            value.includes(program.value)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {program.label}
        </button>
      ))}
    </div>
  );
}