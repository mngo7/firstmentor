'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchFilters from '@/components/SearchFilters';
import ProfileCard, { Profile } from '@/components/ProfileCard';
import Pagination from '@/components/Pagination';

// Import state options for filtering
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

const ITEMS_PER_PAGE = 8; // Display 8 cards per page in a single column

export default function MentorMatch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 从URL中读取页码
  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    if (pageFromUrl) {
      const pageNum = parseInt(pageFromUrl, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }
  }, [searchParams]);
  const [activeFilters, setActiveFilters] = useState<{
    role: string[];
    programs: string[];
    specialties: string[];
    experience: string[];
    mentorTypes: string[];
    countries: string[];
    states: string[];
    teamNumber: string[];
    teamName: string[];
    firstName: string[];
  }>({
    role: [],
    programs: [],
    specialties: [],
    experience: [],
    mentorTypes: [],
    countries: [],
    states: [],
    teamNumber: [],
    teamName: [],
    firstName: [],
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/profiles', {
        cache: 'no-store', // 禁用缓存
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      const data = await response.json();
      setProfiles(data);
      setFilteredProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);
  const currentProfiles = filteredProfiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (section: string, values: string[]) => {
    console.log(`Filter changed: ${section}`, values);
    
    // Update active filters
    const newFilters = {
      ...activeFilters,
      [section]: values
    };
    setActiveFilters(newFilters);

    // Start filtering from original data
    let filtered = [...profiles];
    
    console.log('Total profiles:', filtered.length);

    // Apply role filter
    if (newFilters.role.length > 0) {
      const selectedRole = newFilters.role[0];
      filtered = filtered.filter((profile: Profile) => {
        if (selectedRole === 'mentor') {
          return profile.isMentor;
        } else if (selectedRole === 'mentee') {
          return profile.isMentee;
        } else if (selectedRole === 'member') {
          return !profile.isListedTeam;
        } else if (selectedRole === 'listed') {
          return profile.isListedTeam;
        }
        return true;
      });
    }

    // 应用程序过滤器
    if (newFilters.programs.length > 0 && !newFilters.programs.includes('all')) {
      filtered = filtered.filter((profile: Profile) => {
        return newFilters.programs.some(value => 
          profile.program.toLowerCase() === value.toLowerCase()
        );
      });
    }

    // 应用专业过滤器
    if (!newFilters.specialties.includes('all') && newFilters.specialties.length > 0) {
      console.log('Applying specialty filter:', newFilters.specialties);
      console.log('Selected role:', newFilters.role);
      
      filtered = filtered.filter((profile: Profile) => {
        // 根据用户选择的角色过滤
        if (newFilters.role.length > 0) {
          const selectedRole = newFilters.role[0];
          if (selectedRole === 'mentor') {
            // 如果选择了 "mentor"，从 Column H (mentorSpecialties) 中搜索
            console.log(`Checking mentor ${profile.name}:`, {
              isMentor: profile.isMentor,
              mentorSpecialties: profile.mentorSpecialties
            });
            return profile.isMentor && profile.mentorSpecialties?.some((specialty: string) => 
              newFilters.specialties.some(selected => 
                specialty.toLowerCase() === selected.toLowerCase()
              )
            );
          } else if (selectedRole === 'mentee') {
            // 如果选择了 "mentee"，从 Column U (menteeNeeds) 中搜索
            return profile.isMentee && profile.menteeNeeds?.some((need: string) => 
              newFilters.specialties.some(selected => 
                need.toLowerCase() === selected.toLowerCase()
              )
            );
          }
        }
        // 如果没有选择角色，则同时搜索两者
        if (profile.isMentor) {
          return profile.mentorSpecialties?.some((specialty: string) => 
            newFilters.specialties.some(selected => 
              specialty.toLowerCase() === selected.toLowerCase()
            )
          );
        }
        if (profile.isMentee) {
          return profile.menteeNeeds?.some((need: string) => 
            newFilters.specialties.some(selected => 
              need.toLowerCase() === selected.toLowerCase()
            )
          );
        }
        return false;
      });
      
      console.log('Profiles after specialty filter:', filtered.length);
    }

    // 应用经验过滤器
    if (!newFilters.experience.includes('all') && newFilters.experience.length > 0) {
      filtered = filtered.filter((profile: Profile) => {
        // 根据用户选择的角色过滤
        if (newFilters.role.length > 0) {
          const selectedRole = newFilters.role[0];
          if (selectedRole === 'mentor') {
            // 如果选择了 "mentor"，从 Column I (mentorExperience) 中搜索
            if (!profile.isMentor) return false;
            const profileExp = (profile.mentorExperience || '').toLowerCase().trim();
            // 只要 Column I 有数据就显示（跳过空值或默认值）
            if (!profileExp || profileExp === 'coming soon...' || profileExp === '') return false;
            
            // 如果有多个选中的经验等级，匹配任意一个即可
            return newFilters.experience.some(exp => {
              const selectedExp = exp.toLowerCase().trim();
              return profileExp.includes(selectedExp) || selectedExp.includes(profileExp);
            });
          } else if (selectedRole === 'mentee') {
            // 如果选择了 "mentee"，从 Column W (menteeRequiredExperience) 中搜索
            if (!profile.isMentee) return false;
            const profileExp = (profile.menteeRequiredExperience || '').toLowerCase().trim();
            // 只要 Column W 有数据就显示（跳过空值或默认值）
            if (!profileExp || profileExp === 'coming soon...' || profileExp === '') return false;
            
            // 如果有多个选中的经验等级，匹配任意一个即可
            return newFilters.experience.some(exp => {
              const selectedExp = exp.toLowerCase().trim();
              return profileExp.includes(selectedExp) || selectedExp.includes(profileExp);
            });
          }
        }
        
        // 如果没有选择角色，则按原逻辑处理
        if (profile.isMentor) {
          const profileExp = (profile.mentorExperience || '').toLowerCase().trim();
          if (!profileExp || profileExp === 'coming soon...' || profileExp === '') return false;
          return newFilters.experience.some(exp => {
            const selectedExp = exp.toLowerCase().trim();
            return profileExp.includes(selectedExp) || selectedExp.includes(profileExp);
          });
        } else if (profile.isMentee) {
          const profileExp = (profile.menteeRequiredExperience || '').toLowerCase().trim();
          if (!profileExp || profileExp === 'coming soon...' || profileExp === '') return false;
          return newFilters.experience.some(exp => {
            const selectedExp = exp.toLowerCase().trim();
            return profileExp.includes(selectedExp) || selectedExp.includes(profileExp);
          });
        }
        return false;
      });
    }

    // 应用 Mentor Type 过滤器
    if (!newFilters.mentorTypes.includes('all') && newFilters.mentorTypes.length > 0) {
      filtered = filtered.filter((profile: Profile) => {
        return profile.role && profile.role.trim() !== '' && newFilters.mentorTypes.some(selectedType => 
          profile.role!.toLowerCase() === selectedType.toLowerCase()
        );
      });
    }

    // 应用国家过滤器
    if (newFilters.countries.length > 0) {
      filtered = filtered.filter((profile: Profile) => {
        return newFilters.countries.some(value => 
          profile.country.toLowerCase() === value.toLowerCase()
        );
      });
    }

    // 应用州过滤器
    if (newFilters.states.length > 0) {
      filtered = filtered.filter((profile: Profile) => {
        if (profile.state) {
          return newFilters.states.some(value => {
            const stateOption = stateOptions.find(opt => opt.id === value);
            return profile.state === stateOption?.name;
          });
        }
        return false;
      });
    }

    // 应用团队编号过滤器
    if (newFilters.teamNumber.length > 0 && newFilters.teamNumber[0]) {
      const searchTeamNumber = newFilters.teamNumber[0].toLowerCase().trim();
      filtered = filtered.filter((profile: Profile) => {
        return profile.teamNumber?.toLowerCase().includes(searchTeamNumber);
      });
    }

    // 应用团队名称过滤器
    if (newFilters.teamName.length > 0 && newFilters.teamName[0]) {
      const searchTeamName = newFilters.teamName[0].toLowerCase().trim();
      filtered = filtered.filter((profile: Profile) => {
        return profile.teamName?.toLowerCase().includes(searchTeamName);
      });
    }

    // 应用名字过滤器 (Column D)
    if (newFilters.firstName.length > 0 && newFilters.firstName[0]) {
      const searchFirstName = newFilters.firstName[0].toLowerCase().trim();
      filtered = filtered.filter((profile: Profile) => {
        return profile.name?.toLowerCase().includes(searchFirstName);
      });
    }
    
    setFilteredProfiles(filtered);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 更新URL查询参数
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f3f2ef' }}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
          Mentor / Mentee Search
        </h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Search Filters */}
          <div className="md:w-1/4">
            <SearchFilters onFilterChange={handleFilterChange} />
          </div>
          
          {/* Right Column - Profile Cards */}
          <div className="md:w-3/4">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {filteredProfiles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No matching profiles found.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      {currentProfiles.map((profile: Profile) => (
                        <ProfileCard key={profile.id} profile={profile} />
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}