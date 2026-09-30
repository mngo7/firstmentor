import { UserGroupIcon, BriefcaseIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface TeamInfoProps {
  teamNumber?: string;
  teamName?: string;
  program?: string;
  location?: string;
  className?: string;
}

export const TeamInfo = ({ teamNumber, teamName, program, location, className = "" }: TeamInfoProps) => {
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1 ${className} min-w-0`}>
      {teamNumber && teamName && (
        <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
          <UserGroupIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">Team #{teamNumber} - {teamName}</span>
        </div>
      )}
      {program && (
        <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
          <BriefcaseIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{program}</span>
        </div>
      )}
      {location && (
        <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
          <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
      )}
    </div>
  );
};