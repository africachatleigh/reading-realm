import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react';
import { Book, Genre } from '../types/Book';
import { convertToStarRating } from '../utils/storage';
import BookCard from './BookCard';
import StarRating from './StarRating';

interface BookListProps {
  books: Book[];
  genres: Genre[];
  onEditBook: (book: Book) => void;
  showFiltersOnly?: boolean;
}

type SortField = 'title' | 'author' | 'date' | 'rating' | 'genre';
type ViewMode = 'grid' | 'table';

const BookList: React.FC<BookListProps> = ({ books, genres, onEditBook, showFiltersOnly = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const uniqueYears = useMemo(() => {
    const years = Array.from(new Set(books.map(book => book.completionYear))).sort((a, b) => b - a);
    return years;
  }, [books]);

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = !genreFilter || (book.genres || []).includes(genreFilter);
      const matchesYear = !yearFilter || book.completionYear.toString() === yearFilter;
      const matchesRating = !ratingFilter || (() => {
        const starRating = convertToStarRating(book.overallRating);
        switch (ratingFilter) {
          case '5': return starRating >= 4.5;
          case '4': return starRating >= 3.5 && starRating < 4.5;
          case '3': return starRating >= 2.5 && starRating < 3.5;
          case '2': return starRating >= 1.5 && starRating < 2.5;
          case '1': return starRating < 1.5;
          default: return true;
        }
      })();

      return matchesSearch && matchesGenre && matchesYear && matchesRating;
    });

    // Sort books
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'date':
          comparison = new Date(a.completionYear, a.completionMonth - 1).getTime() - 
                      new Date(b.completionYear, b.completionMonth - 1).getTime();
          break;
        case 'rating':
          comparison = a.overallRating - b.overallRating;
          break;
        case 'genre':
          comparison = (a.genres || [])[0]?.localeCompare((b.genres || [])[0] || '') || 0;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [books, searchTerm, genreFilter, yearFilter, ratingFilter, sortField, sortDirection]);

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
              placeholder="Search books or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ 
                '--tw-ring-color': '#77a361',
                focusRingColor: '#77a361'
              }}
              onFocus={(e) => e.target.style.borderColor = '#77a361'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
              style={{ 
                '--tw-ring-color': '#77a361',
                focusRingColor: '#77a361'
              }}
              onFocus={(e) => e.target.style.borderColor = '#77a361'}
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
                '--tw-ring-color': '#77a361',
                focusRingColor: '#77a361'
              }}
              onFocus={(e) => e.target.style.borderColor = '#77a361'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
              style={{ 
                '--tw-ring-color': '#77a361',
                focusRingColor: '#77a361'
              }}
              onFocus={(e) => e.target.style.borderColor = '#77a361'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
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
                '--tw-ring-color': '#77a361',
                focusRingColor: '#77a361'
              }}
              onFocus={(e) => e.target.style.borderColor = '#77a361'}
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
              Showing {filteredAndSortedBooks.length} of {books.length} books
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                style={viewMode === 'grid' ? { backgroundColor: '#d0dfc8', color: '#77a361' } : {}}
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
                style={viewMode === 'table' ? { backgroundColor: '#d0dfc8', color: '#77a361' } : {}}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No books yet</h3>
        <p className="text-gray-600">Add your first book to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Books Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedBooks.map(book => (
            <BookCard key={book.id} book={book} onEdit={onEditBook} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#d0dfc8' }}>
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
                {filteredAndSortedBooks.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onEditBook(book)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={`${book.title} cover`}
                            className="w-12 h-16 object-cover rounded mr-4"
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
                            style={{ backgroundColor: '#77a361' }}
                          >
                            {genre}
                          </span>
                        ))}
                        {(book.genres || []).length > 2 && (
                          <span 
                            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                            style={{ backgroundColor: '#d0dfc8', color: '#77a361' }}
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
                          style={{ backgroundColor: '#77a361' }}
                        >
                          Standalone
                        </span>
                      ) : (
                        <span 
                          className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          style={{ backgroundColor: '#d0dfc8', color: '#77a361' }}
                        >
                          {book.seriesName || 'Series'}
                        </span>
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
                        <div>Characters: {book.ratings.characters}/10</div>
                        <div>World: {book.ratings.worldBuilding}/10</div>
                        <div>Plot: {book.ratings.plot}/10</div>
                        <div>Style: {book.ratings.writingStyle}/10</div>
                        <div>Enjoyment: {book.ratings.enjoyment}/10</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredAndSortedBooks.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No books match your filters</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default BookList;