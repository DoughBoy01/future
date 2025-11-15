import { useUserView, UserView } from '../../contexts/UserViewContext';
import { Users, Building2, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function UserViewToggle() {
  const { currentView, setView, canSwitchView } = useUserView();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!canSwitchView) {
    return null;
  }

  const viewOptions: { value: UserView; label: string; icon: typeof Users }[] = [
    { value: 'parent', label: "I'm a Parent", icon: Users },
    { value: 'camp_organiser', label: "I'm a Camp Organiser", icon: Building2 },
  ];

  const currentOption = viewOptions.find(opt => opt.value === currentView) || viewOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-2 px-3 lg:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-standard border border-white/30 backdrop-blur-sm text-sm font-medium"
        aria-label="Switch user view"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <CurrentIcon className="w-4 h-4" aria-hidden="true" />
        <span className="hidden md:inline">{currentOption.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-20 border border-airbnb-grey-300">
            {viewOptions.map((option) => {
              const Icon = option.icon;
              const isActive = currentView === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setView(option.value);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-fast flex items-center space-x-3 ${
                    isActive
                      ? 'bg-airbnb-pink-50 text-airbnb-pink-600 font-medium'
                      : 'text-airbnb-grey-700 hover:bg-airbnb-grey-50'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
