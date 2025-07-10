import React from 'react';
import RatingGuide from './RatingGuide';

interface RatingInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

const RatingInput: React.FC<RatingInputProps> = ({ label, value, onChange }) => {
  const [showGuide, setShowGuide] = React.useState(false);

  return (
    <>
      <div className="space-y-3 py-2">
      {/* Label */}
        <div className="flex items-center space-x-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="flex items-center justify-center w-5 h-5 bg-gray-300 border border-gray-400 rounded-full hover:bg-gray-400 transition-colors text-white text-xs font-bold"
            title={`Rating guide for ${label}`}
          >
            ?
          </button>
        </div>
      
      {/* Rating Controls */}
      <div className="space-y-3">
        {/* N/A Option */}
        <div className="flex items-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name={`rating-${label}`}
              checked={value === null}
              onChange={() => onChange(null)}
              className="w-4 h-4"
              style={{ accentColor: '#d681a3' }}
            />
            <span className="text-sm text-gray-600">N/A (Not Applicable)</span>
          </label>
        </div>
        
        {/* Rating Scale */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium">Rate 1-10:</div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <label key={rating} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`rating-${label}`}
                  value={rating}
                  checked={value === rating}
                  onChange={() => onChange(rating)}
                  className="sr-only"
                />
                <div
                  className={`w-full h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all ${
                    value === rating
                      ? 'text-white border-transparent shadow-md'
                      : 'text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  style={
                    value === rating
                      ? { backgroundColor: '#d681a3', borderColor: '#d681a3' }
                      : {}
                  }
                >
                  {rating}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      </div>
      <RatingGuide
        category={label}
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </>
  );
};

export default RatingInput;