import React from 'react';

interface RatingInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

const RatingInput: React.FC<RatingInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-sm font-medium text-gray-700 min-w-0 flex-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        {/* N/A Option */}
        <label className="flex items-center space-x-1 cursor-pointer">
          <input
            type="radio"
            name={`rating-${label}`}
            checked={value === null}
            onChange={() => onChange(null)}
            className="w-4 h-4"
            style={{ accentColor: '#d681a3' }}
          />
          <span className="text-sm text-gray-600">N/A</span>
        </label>
        
        {/* Rating Scale */}
        <div className="flex items-center space-x-1">
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
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
                  value === rating
                    ? 'text-white border-transparent'
                    : 'text-gray-600 border-gray-300 hover:border-gray-400'
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
  );
};

export default RatingInput;