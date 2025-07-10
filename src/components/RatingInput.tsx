import React from 'react';

interface RatingInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

const RatingInput: React.FC<RatingInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="space-y-3 py-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
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
  );
};

export default RatingInput;