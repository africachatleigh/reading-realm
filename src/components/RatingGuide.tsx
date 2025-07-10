import React from 'react';
import { X } from 'lucide-react';

interface RatingGuideProps {
  category: string;
  isOpen: boolean;
  onClose: () => void;
}

const RatingGuide: React.FC<RatingGuideProps> = ({ category, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getRatingDescriptions = (category: string) => {
    const descriptions: Record<string, Record<number, string>> = {
      'Characters': {
        1: 'Hate them so much and never want to see their names again. Fuck them',
        2: 'Really really disliked the characters, they were crap',
        3: 'The characters were boring and actively annoying',
        4: 'I just could not have cared less about these characters',
        5: 'The characters were mostly very meh, with personalities like cardboard',
        6: 'The characters were generally fine, but no lasting impression',
        7: 'The characters were well written and I enjoyed them',
        8: 'The characters were very interesting with great personalities',
        9: 'Absolutely incredible and deeply developed characters',
        10: 'I will think about these characters daily until I die'
      },
      'World Building': {
        1: 'Worst world building ever, it was shit',
        2: 'The world made absolutely no sense, and no planning went into it',
        3: 'The world system was boring and under developed',
        4: 'It was functional but I did not care for the world',
        5: 'The worldbuilding was okay but could have been much better',
        6: 'Generally good world building, but I may not remember it well',
        7: 'The world system was interesting and enjoyable to read',
        8: 'The world system was very extremely constructed, unique and interesting',
        9: 'The world gripped me like a fishie on a hook, and I adored every page there',
        10: 'I was totally transported to this brilliant world, and would spend my life studying its lore'
      },
      'Plot': {
        1: 'What the fuck even was that. I have no words',
        2: 'Truly awful',
        3: 'I actively didn not like the plot',
        4: 'I found the plot a bit boring or did not make sense in places',
        5: 'The plot was meh. Not for me or had some unclear elements',
        6: 'The plot was decent in places, but the pacing/logic was off at points, or I doubt I will remember it',
        7: 'The plot was good and compelling to read',
        8: 'The plot was unique, well executed, and gripping',
        9: 'The plot was extremely well developed and paced. It will have a lasting impact on me',
        10: 'This story deserves its own religion. Get it made into a high budget TV show immediately'
      },
      'Writing Style': {
        1: 'Terrible writing, difficult to read or poorly constructed',
        2: 'Poor writing style, awkward prose or frequent errors',
        3: 'Below average writing, readable but lacks flow or elegance',
        4: 'Mediocre writing style, functional but not particularly engaging',
        5: 'Average writing style, clear and readable prose',
        6: 'Good writing style, well-crafted and engaging prose',
        7: 'Very good writing style, beautiful and flowing language',
        8: 'Excellent writing style, masterful use of language',
        9: 'Outstanding writing style, exceptional and memorable prose',
        10: 'Perfect writing style, absolutely beautiful and flawless'
      },
      'Enjoyment': {
        1: 'Hated it, could barely finish reading',
        2: 'Disliked it strongly, struggled to continue',
        3: 'Disliked it, not enjoyable but manageable',
        4: 'Below average enjoyment, some redeeming qualities',
        5: 'Average enjoyment, okay read but nothing special',
        6: 'Good enjoyment, liked it and would recommend',
        7: 'Very enjoyable, really liked it and engaged throughout',
        8: 'Excellent enjoyment, loved it and couldn\'t put it down',
        9: 'Outstanding enjoyment, absolutely loved every moment',
        10: 'Perfect enjoyment, one of the best books ever read'
      }
    };

    return descriptions[category] || {};
  };

  const descriptions = getRatingDescriptions(category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">
              Rating Guide: {category}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Use this guide to help you decide what rating to give for {category.toLowerCase()}. 
            Choose the rating that best matches your experience with this aspect of the book.
          </p>

          <div className="space-y-3">
            {Object.entries(descriptions).map(([rating, description]) => (
              <div 
                key={rating}
                className="flex items-start space-x-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: '#d681a3' }}
                >
                  {rating}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#f0dae3' }}>
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> Don't overthink it! Go with your gut feeling about how this aspect 
              of the book made you feel. You can always edit your rating later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingGuide;