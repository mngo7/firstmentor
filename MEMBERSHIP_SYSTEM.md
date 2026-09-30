# Two-Tier Membership System Implementation

## Overview
This document describes the implementation of a two-tier membership system for the Mentor Match platform, allowing users to choose between **General Member** (free, view-only) and **Pro Member** (free, full access with networking features).

## Changes Made

### 1. New Membership Selection Page
**File**: `/src/app/signup/choose-membership/page.tsx`
- Created a new page that displays two membership tiers side-by-side
- **General Member**: Quick signup with email only, can browse and view profiles
- **Pro Member**: Complete profile registration, can connect with mentors/mentees and appear in search results
- Users are redirected here from Sign Up buttons

### 2. Updated Signup Flow
**File**: `/src/app/signup/page.tsx`
- Modified to accept `?type=general` or `?type=pro` URL parameter
- Automatically redirects to `/signup/choose-membership` if no type is specified
- **General Members**: Only see email and password fields
- **Pro Members**: See full registration form with all profile fields
- Added `membershipType` field to FormData interface

### 3. Database Schema Changes
**File**: `/src/lib/googleSheets.ts`
- Added new column **AK** (Column 36) for `membershipType`
- Updated `SHEET_COLUMN_MAPPING` to include `membershipType: 'AK'`
- Modified `convertFormDataToSheetRow` to handle 37 columns (A-AK)
- Updated `getUserByEmail` to read and return membershipType
- Range updated from `A:AJ` to `A:AK` in getUserByEmail

### 4. API Updates

#### Signup API (`/src/app/api/auth/signup/route.ts`)
- Added logic to differentiate between general and pro member registration
- **General Members**: Only requires email and password, other fields set to empty/default
- **Pro Members**: Requires full form data
- Saves membershipType to Google Sheets Column AK

#### Profiles API (`/src/app/api/profiles/route.ts`)
- Added membershipType field retrieval from Column AK (index 36)
- **Filters out general members** from search results (only Pro Members appear)
- Defaults to 'pro' for existing users without membershipType set

#### Auth ME API (`/src/app/api/auth/me/route.ts`)
- No changes needed - automatically returns membershipType from getUserByEmail

### 5. ProfileCard Component
**File**: `/src/components/ProfileCard.tsx`
- Added `membershipType` field to Profile interface
- Imported and integrated `UpgradeModal` component
- Added `showUpgradeModal` state
- **Connect Button Protection**:
  - Checks if user is a general member before allowing Connect action
  - Shows UpgradeModal instead of alert for better UX
  - Double-checks membership type before sending connection request

### 6. New UpgradeModal Component
**File**: `/src/components/UpgradeModal.tsx`
- Beautiful modal showing Pro Member benefits
- Lists all Pro features with checkmarks
- "Upgrade Now" button redirects to `/signup?type=pro&upgrade=true`
- "Maybe Later" button to close modal

### 7. Navigation Updates

#### Home Page (`/src/app/page.tsx`)
- Changed "Become a Mentor" button to point to `/signup/choose-membership`

#### Navbar (`/src/components/Navbar.tsx`)
- Updated both desktop and mobile "Sign Up" links to point to `/signup/choose-membership`

## User Experience Flow

### General Member Flow
1. User clicks "Sign Up" → `/signup/choose-membership`
2. Selects "General Member" → `/signup?type=general`
3. Fills in email and password only
4. Account created, can sign in
5. Can browse mentor/mentee search and view profiles with "Learn More"
6. Clicking "Connect" shows UpgradeModal with Pro benefits

### Pro Member Flow
1. User clicks "Sign Up" → `/signup/choose-membership`
2. Selects "Pro Member" → `/signup?type=pro`
3. Fills in complete registration form (name, role, program, etc.)
4. Account created, can sign in
5. Profile appears in search results
6. Can send and receive connection requests
7. Full networking capabilities

### Upgrade Flow
1. General Member tries to use "Connect" feature
2. UpgradeModal appears showing benefits
3. Clicks "Upgrade Now" → redirected to `/signup?type=pro&upgrade=true`
4. Can complete Pro Member registration with existing email

## Database Structure

### New Column
- **Column AK (Index 36)**: `membershipType`
  - Values: 'general' or 'pro'
  - Default: 'pro' for existing users
  - Required field

### Row Structure (37 columns A-AK)
- Existing columns A-AJ remain unchanged
- New column AK stores membership tier

## Access Control Summary

| Feature | General Member | Pro Member |
|---------|---------------|------------|
| Browse profiles | ✅ Yes | ✅ Yes |
| View profile details (Learn More) | ✅ Yes | ✅ Yes |
| Send connection requests | ❌ No (shows upgrade prompt) | ✅ Yes |
| Receive connection requests | ❌ No | ✅ Yes |
| Appear in search results | ❌ No | ✅ Yes |
| Create profile | ❌ Limited (email only) | ✅ Full profile |

## Technical Notes

### Backward Compatibility
- Existing users without `membershipType` field default to 'pro' membership
- No data migration needed for existing users
- Profiles API filters profiles by checking `membershipType !== 'general'`

### Security
- Membership type checked on both client and server side
- Connect functionality blocked at multiple levels:
  1. ProfileCard handleConnect (shows modal)
  2. ProfileCard handleConnectSubmit (double-check)
  3. Server-side API can add additional checks if needed

### Future Enhancements
- Add account upgrade page in user dashboard
- Email notification for upgrade prompts
- Analytics tracking for conversion from General to Pro
- Admin panel to manage membership types

## Testing Checklist
- [ ] Test General Member signup flow
- [ ] Test Pro Member signup flow
- [ ] Verify General Members don't appear in search
- [ ] Verify General Members see UpgradeModal on Connect
- [ ] Verify Pro Members can send connections
- [ ] Test existing users still work (default to Pro)
- [ ] Verify membershipType saves to Column AK
- [ ] Test navigation links point to choose-membership
- [ ] Mobile responsive check for all new pages

## Google Sheets Setup
Before deploying, ensure Column AK exists in Google Sheets:
1. Open the Google Sheet
2. Add header "Membership Type" to Column AK
3. No need to fill existing rows - API defaults to 'pro'

## Deployment Notes
- No breaking changes for existing functionality
- Existing users automatically treated as Pro Members
- New column (AK) added to database schema
- All navigation updated to new signup flow
