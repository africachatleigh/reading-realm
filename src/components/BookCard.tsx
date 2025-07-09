import React from 'react';
import { Calendar, User, Tag, Edit, BookOpen, Users, Sparkles } from 'lucide-react';
import { Book } from '../types/Book';
import { convertToStarRating } from '../utils/storage';
import StarRating from './StarRating';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit }) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group relative h-48">
      {/* Edit Button */}
      <button
        onClick={() => onEdit(book)}
        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
      >
        <Edit className="w-4 h-4 text-gray-600 hover:text-blue-600" />
      </button>

      <div className="flex h-full">
        {/* Book Cover - Full Height */}
        <div className="flex-shrink-0">
          {book.coverimage ? (
            <img
              src={book.coverimage}
              alt={`${book.title} cover`}
              className="w-32 h-full object-cover rounded-l-xl"
            />
          ) : (
            <div className="w-32 h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-l-xl">
              <span className="text-gray-400 text-xs text-center px-2">No Cover</span>
            </div>
          )}
        </div>

        {/* Book Details - Left Column */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div className="space-y-2">
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">
                {book.title}
              </h3>
              <div className="flex items-center text-gray-600 text-sm space-x-3">
                <div className="flex items-center space-x-1 min-w-0">
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{book.author}</span>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Calendar className="w-3 h-3" />
                  <span>{months[book.completionMonth - 1]} {book.completionYear}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              {/* Multiple Genres Display */}
              <div className="flex items-start space-x-1">
                <Tag className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1 min-w-0">
                  {(book.genres || []).slice(0, 2).map((genre, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#f0dae3', color: '#d681a3' }}
                    >
                      {genre}
                    </span>
                  ))}
                  {(book.genres || []).length > 2 && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f0dae3', color: '#d681a3' }}>
                      +{(book.genres || []).length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Series Information */}
              <div className="flex items-center space-x-1">
                {book.isStandalone ? (
                  <>
                    <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: '#d681a3' }} />
                    <span className="text-xs text-white px-2 py-1 rounded-full" style={{ backgroundColor: '#d681a3' }}>
                      Standalone
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: '#d681a3' }} />
                    <span className="text-xs text-white px-2 py-1 rounded-full truncate" style={{ backgroundColor: '#d681a3' }}>
                      {book.seriesName || 'Series'}
                    </span>
                  </>
                )}
              </div>

              {/* Which Witch Information */}
              {book.whichWitch && (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 flex-shrink-0" style={{ color: '#d681a3' }} />
                  <span className="text-xs text-white px-2 py-1 rounded-full" style={{ backgroundColor: '#d681a3' }}>
                    {book.whichWitch}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <StarRating rating={convertToStarRating(book.overallrating)} size="sm" />
          </div>
        </div>

        {/* Ratings - Right Column - Hidden on Mobile */}
        <div className="hidden md:flex w-36 lg:w-40 p-3 bg-gray-50 border-l border-gray-100 flex-col">
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Ratings</h4>
          <div className="space-y-1.5 text-xs text-gray-600 flex-1">
            <div className="flex justify-between">
              <span>Characters:</span>
              <span className="font-semibold text-gray-900">
                {book.ratings.characters !== null ? `${book.ratings.characters}/10` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>World Building:</span>
              <span className="font-semibold text-gray-900">
                {book.ratings.worldBuilding !== null ? `${book.ratings.worldBuilding}/10` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Plot:</span>
              <span className="font-semibold text-gray-900">
                {book.ratings.plot !== null ? `${book.ratings.plot}/10` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Writing Style:</span>
              <span className="font-semibold text-gray-900">
                {book.ratings.writingStyle !== null ? `${book.ratings.writingStyle}/10` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Enjoyment:</span>
              <span className="font-semibold text-gray-900">
                {book.ratings.enjoyment !== null ? `${book.ratings.enjoyment}/10` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;