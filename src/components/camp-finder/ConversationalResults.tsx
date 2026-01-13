import { Target, RefreshCw, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CampWithScore } from '../../services/quizService';

interface ConversationalResultsProps {
  results: CampWithScore[];
  childName: string;
  onStartOver: () => void;
}

export function ConversationalResults({
  results,
  childName,
  onStartOver,
}: ConversationalResultsProps) {
  if (results.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-[#717171] mb-4">
            No camps found with these exact criteria. Try adjusting your preferences.
          </p>
          <button
            onClick={onStartOver}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#fe4d39] text-white rounded-full font-semibold hover:bg-[#b13527] transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Start Over</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Results list */}
      <div className="space-y-6">
        {results.map((result, index) => (
          <div
            key={result.camp.id}
            className="animate-slide-in-left bg-white rounded-2xl border-2 border-[#DDDDDD] overflow-hidden hover:border-[#fe4d39] hover:shadow-lg transition-all duration-300"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            {/* Camp Image */}
            {result.camp.featured_image_url && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={result.camp.featured_image_url}
                  alt={result.camp.name || 'Camp'}
                  className="w-full h-full object-cover"
                />

                {/* Match Badge */}
                <div className="absolute top-3 right-3">
                  <div
                    className={`
                      px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      flex items-center gap-1
                      ${
                        result.matchLabel === 'perfect'
                          ? 'bg-[#dcfce7] text-[#166534] border-2 border-[#58cc02]'
                          : result.matchLabel === 'great'
                          ? 'bg-[#fee2e2] text-[#991b1b] border-2 border-[#fe4d39]'
                          : 'bg-[#f3e8ff] text-[#6b21a8] border-2 border-[#8b5cf6]'
                      }
                    `}
                  >
                    <Target className="w-3 h-3" />
                    <span>{result.matchLabel} match</span>
                  </div>
                </div>
              </div>
            )}

            {/* Camp Info */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-[#222222] mb-2">
                {result.camp.name}
              </h3>

              {/* Match Explanation */}
              <div className="bg-[#F7F7F7] rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <Target className="w-5 h-5 text-[#fe4d39] flex-shrink-0 mt-0.5" />
                  <h4 className="text-sm font-semibold text-[#222222]">
                    Why this matches {childName}:
                  </h4>
                </div>
                <ul className="space-y-1.5 text-sm text-[#222222]">
                  {result.matchReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#fe4d39] flex-shrink-0">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Link
                to={`/camps/${result.camp.id}`}
                className="block w-full text-center bg-[#fe4d39] text-white py-3 rounded-full font-semibold hover:bg-[#b13527] transition-colors duration-200"
              >
                View Camp Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#DDDDDD]">
        <button
          onClick={onStartOver}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#222222] text-[#222222] rounded-full font-semibold hover:bg-[#F7F7F7] transition-colors duration-200"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Start Over</span>
        </button>

        <button
          onClick={() => {
            // TODO: Implement email capture
            alert('Email feature coming soon!');
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#fe4d39] text-[#fe4d39] rounded-full font-semibold hover:bg-[#FFE8EA] transition-colors duration-200"
        >
          <Mail className="w-5 h-5" />
          <span>Email Results</span>
        </button>
      </div>
    </div>
  );
}
