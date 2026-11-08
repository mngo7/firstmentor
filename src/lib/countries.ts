// Fixes for misspelled / inconsistent country names found in the sheet
const COUNTRY_FIXES: Record<string, string> = {
  'hungry': 'Hungary',
  'south kerea': 'South Korea',
  'taibei': 'Chinese Taipei',
  'taipei': 'Chinese Taipei',
  'taiwan': 'Chinese Taipei',
  'usa': 'United States',
  'us': 'United States',
  'u.s.': 'United States',
  'united states of america': 'United States',
  'uk': 'United Kingdom',
  'turkey': 'Türkiye',
};

export function normalizeCountry(country: string | undefined): string {
  const value = (country || '').trim();
  return COUNTRY_FIXES[value.toLowerCase()] || value;
}

// Fixes for misspelled state names found in the sheet
const STATE_FIXES: Record<string, string> = {
  'califolia': 'California',
};

export function normalizeState(state: string | undefined): string {
  const value = (state || '').trim();
  return STATE_FIXES[value.toLowerCase()] || value;
}
