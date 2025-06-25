
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LocationData } from '@/types/Location';

interface GlobalActivityProps {
  locations: LocationData[];
}

const GlobalActivity = ({ locations }: GlobalActivityProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg max-w-sm">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm font-semibold text-gray-800">
            Atividade Global ({locations.length})
          </span>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 text-xs text-gray-600 space-y-1 border-t border-gray-100 pt-2">
          {locations.slice(0, 4).map((location, index) => (
            <div key={location.id} className="flex items-center">
              <span className="mr-2">
                {index === 0 && '🙏'} {index === 1 && '⚡'} {index === 2 && '🔥'} {index === 3 && '📿'}
              </span>
              <span>{location.intercessorCount} em {location.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalActivity;
