import Badge from './Badge';

interface SkillsSectionProps {
  specialties?: string[];
  needs?: string[];
  defaultSkills?: string[];
  variant?: 'preview' | 'detail';
}

export const SkillsSection = ({ specialties = [], needs = [], defaultSkills = [], variant = 'preview' }: SkillsSectionProps) => {
  const gapSize = variant === 'preview' ? 'gap-1' : 'gap-2';
  
  if (!specialties.length && !needs.length && !defaultSkills.length) {
    return null;
  }

  return (
    <div className="mb-4">
      {specialties.length > 0 && (
        <div className={variant === 'preview' ? 'mb-2' : 'mb-4'}>
          <h4 className={`${variant === 'preview' ? 'text-sm font-medium text-gray-700 mb-1' : 'font-medium text-gray-900 mb-2'}`}>
            Areas of Expertise:
          </h4>
          <div className={`flex flex-wrap ${gapSize}`}>
            {specialties.map(specialty => (
              <Badge key={specialty} text={specialty} variant="blue" />
            ))}
          </div>
        </div>
      )}
      {needs.length > 0 && (
        <div>
          <h4 className={`${variant === 'preview' ? 'text-sm font-medium text-gray-700 mb-1' : 'font-medium text-gray-900 mb-2'}`}>
            {variant === 'preview' ? 'Seeking Help With:' : 'Looking for Help With'}
          </h4>
          <div className={`flex flex-wrap ${gapSize}`}>
            {needs.map(need => (
              <Badge key={need} text={need} variant="green" />
            ))}
          </div>
        </div>
      )}
      {(!specialties.length && !needs.length && defaultSkills.length > 0) && (
        <div className={`flex flex-wrap ${gapSize}`}>
          {defaultSkills.map(skill => (
            <Badge key={skill} text={skill} />
          ))}
        </div>
      )}
    </div>
  );
};