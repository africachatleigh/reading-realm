import React from 'react';

interface RatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const RatingInput: React.FC<RatingInputProps> = ({ label, value, onChange }) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return '#d681a3';
    if (rating >= 6) return '#a3b86c';
    if (rating >= 4) return '#d4a574';
    return '#d47474';
  };

  const getRatingText = (rating: number) => {
    if (rating === 10) return 'Masterpiece';
    if (rating === 9) return 'Outstanding';
    if (rating === 8) return 'Fantastic';
    if (rating === 7) return 'Good';
    if (rating === 6) return 'Okay';
    if (rating === 5) return 'Meh';
    if (rating === 4) return 'Below Average';
    if (rating === 3) return 'Poor';
    if (rating === 2) return 'Very Poor';
    if (rating === 1) return 'Terrible';
    return 'Unrated';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center space-x-2">
          <span 
            className="px-2 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: getRatingColor(value) }}
          >
            {getRatingText(value)}
          </span>
          <span className="text-sm font-bold text-gray-900">{value}/10</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${value * 10}%, #d681a3 ${value * 10}%, #d681a3 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
};

export default RatingInput;