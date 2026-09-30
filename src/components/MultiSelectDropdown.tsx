'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  id: string;
  name: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  label?: string;
}

export default function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  label = '',
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionId: string) => {
    let newValues: string[];
    
    if (optionId === 'all') {
      // If "All" is clicked, either select only "All" or clear it
      newValues = selectedValues.includes('all') ? [] : ['all'];
    } else {
      // If any other option is clicked
      if (selectedValues.includes(optionId)) {
        // Remove the option if it's already selected
        newValues = selectedValues.filter(id => id !== optionId);
      } else {
        // Add the option and remove "All" if it was selected
        newValues = [...selectedValues.filter(id => id !== 'all'), optionId];
      }
    }
    
    onChange(newValues);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {selectedValues.length > 0 && (
            <span className="text-xs text-gray-500">
              {selectedValues.length} selected
            </span>
          )}
        </div>
      )}
      {!label && selectedValues.length > 0 && (
        <div className="flex justify-end mb-2">
          <span className="text-xs text-gray-500">
            {selectedValues.length} selected
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-left flex justify-between items-center hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
      >
        <span className="text-gray-700 truncate">
          {selectedValues.length === 0
            ? label ? `Select ${label.toLowerCase()}...` : 'Select options...'
            : `${selectedValues.length} selected`}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.id)}
                onChange={() => toggleOption(option.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2 h-4 w-4"
              />
              <span className="text-gray-700 truncate">{option.name}</span>
            </label>
          ))}
        </div>
      )}

      {mounted && selectedValues.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {selectedValues.map((value) => {
            const option = options.find((opt) => opt.id === value);
            return (
              <span
                key={value}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                {option?.name}
                <button
                  type="button"
                  onClick={() => toggleOption(value)}
                  className="ml-1 inline-flex items-center justify-center h-3.5 w-3.5 hover:bg-blue-100 rounded-sm"
                >
                  <span className="sr-only">Remove</span>
                  <svg
                    className="h-2.5 w-2.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}