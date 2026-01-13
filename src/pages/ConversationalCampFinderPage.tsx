import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { ConversationalCampFinder } from '../components/camp-finder/ConversationalCampFinder';

export function ConversationalCampFinderPage() {
  useEffect(() => {
    // Set page title
    document.title = 'Find Your Perfect Camp - Future';

    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F7F7F7]">
      {/* Header - Mobile optimized */}
      <div className="bg-white border-b border-[#DDDDDD] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#fe4d39] to-[#ff6b5c] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-[#222222]">
                Find Your Camp
              </h1>
              <p className="text-xs sm:text-sm text-[#717171]">
                Quick & personalized recommendations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container - Mobile optimized height */}
      <div className="max-w-2xl mx-auto" style={{ minHeight: 'calc(100vh - 100px)' }}>
        <ConversationalCampFinder />
      </div>
    </div>
  );
}
