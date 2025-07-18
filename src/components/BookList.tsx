import React, { useMemo, useEffect, useRef } from 'react';
import { Search, Filter, SortAsc, SortDesc, Grid, List, Loader2 } from 'lucide-react';
import { Book, Genre } from '../types/Book';
import { convertToStarRating } from '../utils/storage';
import BookCard from './BookCard';
import StarRating from './StarRating';

type SortField = 'title' | 'author' | 'date' | 'rating' | 'genre';
type ViewMode = 'grid' | 'table';

interface BookListProps {
  books: Book[];
  genres: Genre[];
  onEditBook: (book: Book) => void;
  showFiltersOnly?: boolean;
  totalCount?: number;
  totalCollectionCount?: number;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  allAvailableYears?: number[];
  // Filter state props
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  genreFilter: string;
  setGenreFilter: (genre: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  whichWitchFilter: string;
  setWhichWitchFilter: (witch: string) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const BookList: React.FC<BookListProps> = ({ 
  books, 
  genres, 
  onEditBook, 
  showFiltersOnly = false,
  totalCount = 0,
  totalCollectionCount = 0,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  allAvailableYears = [],
  searchTerm,
  setSearchTerm,
  genreFilter,
  setGenreFilter,
  yearFilter,
  setYearFilter,
  whichWitchFilter,
  setWhichWitchFilter,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  viewMode,
  setViewMode
}) => {
  // Ref for infinite scroll detection
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onLoadMore, hasMore, isLoading]);

  const whichWitchOptions = ['🧙‍♀️ Lou Lou', '🪄 Chlo', '✨ Affo'];

  // Helper function to get witch colors
  const getWitchColors = (witch: string) => {
    switch (witch) {
      case 'Affo':
        return { backgroundColor: '#98e1eb', color: '#39929e' };
      case 'Lou Lou':
        return { backgroundColor: '#f5af69', color: '#b86009' };
      case 'Chlo':
        return { backgroundColor: '#abd9a3', color: '#507a48' };
      default:
        return { backgroundColor: '#d681a3', color: 'white' };
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // If showing filters only, return just the search and filters section
  if (showFiltersOnly) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search books, authors, or series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ 
                '--tw-ring-color': '#d681a3',
                focusRingColor: '#d681a3'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d681a3'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
              style={{ 
                '--tw-ring-color': '#d681a3',
                focusRingColor: '#d681a3'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d681a3'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.name}>{genre.name}</option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
              style={{ 
                '--tw-ring-color': '#d681a3',
                focusRingColor: '#d681a3'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d681a3'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Years</option>
              {allAvailableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={whichWitchFilter}
              onChange={(e) => setWhichWitchFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
              style={{ 
                '--tw-ring-color': '#d681a3',
                focusRingColor: '#d681a3'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d681a3'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Witches</option>
              {whichWitchOptions.map(witch => (
                <option key={witch} value={witch}>{witch}</option>
              ))}
            </select>

            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field as SortField);
                setSortDirection(direction as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
              style={{ 
                '--tw-ring-color': '#d681a3',
                focusRingColor: '#d681a3'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d681a3'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="author-asc">Author A-Z</option>
              <option value="author-desc">Author Z-A</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="genre-asc">Genre A-Z</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {totalCount} of {totalCollectionCount} books
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                style={viewMode === 'grid' ? { backgroundColor: '#f0dae3', color: '#d681a3' } : {}}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                style={viewMode === 'table' ? { backgroundColor: '#f0dae3', color: '#d681a3' } : {}}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (books.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
        <p className="text-gray-600">
          {totalCount === 0 ? 'Add your first book to get started!' : 'Try adjusting your search or filter criteria'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Books Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {books.map(book => (
            <BookCard key={book.id} book={book} onEdit={onEditBook} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#f0dae3' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Book
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort('author')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Author</span>
                      {sortField === 'author' && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort('genre')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Genres</span>
                      {sortField === 'genre' && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Which Witch
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Completed</span>
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rating</span>
                      {sortField === 'rating' && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onEditBook(book)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={`${book.title} cover`}
                            className="w-12 h-16 object-cover rounded mr-4"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gray-200 rounded mr-4 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Cover</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{book.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.author}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(book.genres || []).slice(0, 2).map((genre, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                            style={{ backgroundColor: '#d681a3' }}
                          >
                            {genre}
                          </span>
                        ))}
                        {(book.genres || []).length > 2 && (
                          <span 
                            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                            style={{ backgroundColor: '#f0dae3', color: '#d681a3' }}
                          >
                            +{(book.genres || []).length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {book.isStandalone ? (
                        <span 
                          className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                          style={{ backgroundColor: '#d681a3' }}
                        >
                          Standalone
                        </span>
                      ) : (
                        <span 
                          className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          style={{ backgroundColor: '#f0dae3', color: '#d681a3' }}
                        >
                          {book.seriesName || 'Series'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {book.whichWitch ? (
                        <span 
                          className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          style={getWitchColors(book.whichWitch)}
                        >
                          {book.whichWitch}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {months[book.completionMonth - 1]} {book.completionYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StarRating rating={convertToStarRating(book.overallRating)} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      <div className="space-y-1">
                        <div>Characters: {book.ratings.characters !== null ? `${book.ratings.characters}/10` : 'N/A'}</div>
                        <div>World: {book.ratings.worldBuilding !== null ? `${book.ratings.worldBuilding}/10` : 'N/A'}</div>
                        <div>Plot: {book.ratings.plot !== null ? `${book.ratings.plot}/10` : 'N/A'}</div>
                        <div>Style: {book.ratings.writingStyle !== null ? `${book.ratings.writingStyle}/10` : 'N/A'}</div>
                        <div>Enjoyment: {book.ratings.enjoyment !== null ? `${book.ratings.enjoyment}/10` : 'N/A'}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoading ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more books...</span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Scroll to load more books</div>
          )}
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && books.length > 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          You've reached the end of your book collection!
        </div>
      )}
    </div>
  );
};

export default BookList;