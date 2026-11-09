'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export interface SelectOption {
  id: string;
  name: string;
}

type Props = {
  label?: string;
  options: (SelectOption | string)[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
} & (
  | { multiple: true; value: string[]; onChange: (value: string[]) => void }
  | { multiple?: false; value: string; onChange: (value: string) => void }
);

// A dropdown you pick from (no free typing); typing in its search box only narrows the list.
export default function SearchableSelect(props: Props) {
  const { label, placeholder = 'Select...', emptyText = 'No matches', disabled, id } = props;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const options = useMemo(
    () => props.options.map(o => (typeof o === 'string' ? { id: o, name: o } : o)),
    [props.options]
  );
  const selected = props.multiple ? props.value : props.value ? [props.value] : [];
  const nameFor = (optionId: string) => options.find(o => o.id === optionId)?.name || optionId;
  const shown = options.filter(o => o.name.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  function choose(optionId: string) {
    if (props.multiple) {
      props.onChange(selected.includes(optionId) ? selected.filter(v => v !== optionId) : [...selected, optionId]);
    } else {
      props.onChange(optionId);
      setOpen(false);
    }
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    if (props.multiple) props.onChange([]);
    else props.onChange('');
  }

  return (
    <div className="relative" ref={rootRef}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => e.key === 'Escape' && setOpen(false)}
        className="w-full min-h-[38px] flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <span className="flex flex-wrap gap-1 min-w-0">
          {selected.length === 0 && <span className="text-gray-400">{placeholder}</span>}
          {props.multiple
            ? selected.map(v => (
                <span key={v} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{nameFor(v)}</span>
              ))
            : selected[0] && <span className="text-gray-900 truncate">{nameFor(selected[0])}</span>}
        </span>
        <span className="flex items-center gap-1 text-gray-400 flex-shrink-0">
          {selected.length > 0 && !disabled && (
            <span role="button" aria-label="Clear" onClick={clear} className="px-1 hover:text-gray-600">✕</span>
          )}
          <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') setOpen(false);
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (shown.length === 1) choose(shown[0].id);
                }
              }}
              placeholder="Type to narrow down..."
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {shown.map(o => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => choose(o.id)}
                  className={`w-full flex items-center px-3 py-1.5 text-sm text-left hover:bg-blue-50 ${selected.includes(o.id) ? 'text-blue-700 font-medium' : 'text-gray-700'}`}
                >
                  {props.multiple && (
                    <input type="checkbox" readOnly tabIndex={-1} checked={selected.includes(o.id)} className="h-4 w-4 mr-2 text-blue-600 rounded pointer-events-none" />
                  )}
                  {o.name}
                </button>
              </li>
            ))}
            {shown.length === 0 && <li className="px-3 py-2 text-sm text-gray-400">{emptyText}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
