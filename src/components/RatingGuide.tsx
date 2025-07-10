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
        1: 'Extremely poor character development, unrealistic or annoying characters',
        2: 'Poor character development, mostly flat or stereotypical characters',
        3: 'Below average characters, some development but lacking depth',
        4: 'Mediocre characters, basic development with some interesting moments',
        5: 'Average characters, decent development but nothing exceptional',
        6: 'Good characters, solid development with some memorable traits',
        7: 'Very good characters, well-developed with clear motivations',
        8: 'Excellent characters, complex and engaging with strong arcs',
        9: 'Outstanding characters, deeply developed and emotionally resonant',
        10: 'Perfect characters, unforgettable and masterfully crafted'
      },
      'World Building': {
        1: 'No world building, confusing or inconsistent setting',
        2: 'Poor world building, basic setting with many gaps',
        3: 'Below average world building, some details but lacks cohesion',
        4: 'Mediocre world building, functional but not particularly engaging',
        5: 'Average world building, decent setting with adequate detail',
        6: 'Good world building, well-constructed with interesting elements',
        7: 'Very good world building, immersive and well-thought-out',
        8: 'Excellent world building, rich and detailed environment',
        9: 'Outstanding world building, incredibly immersive and original',
        10: 'Perfect world building, absolutely captivating and flawless'
      },
      'Plot': {
        1: 'Terrible plot, incoherent or extremely boring',
        2: 'Poor plot, confusing or unengaging storyline',
        3: 'Below average plot, some interesting moments but overall weak',
        4: 'Mediocre plot, functional but predictable or slow',
        5: 'Average plot, decent story with some engaging elements',
        6: 'Good plot, well-structured with engaging developments',
        7: 'Very good plot, compelling with good pacing and twists',
        8: 'Excellent plot, gripping and well-executed storyline',
        9: 'Outstanding plot, masterfully crafted and engaging',
        10: 'Perfect plot, absolutely brilliant and unforgettable'
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