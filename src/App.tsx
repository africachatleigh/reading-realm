import { 
  addBook, 
  updateBook, 
  fetchBooks, 
  fetchBooksWithPagination, 
  fetchAllYears,
  fetchCurrentYearCount,
  fetchFilteredCounts,
  testConnection, 
  deleteBook,
  fetchGenres,
  addGenre,
  editGenre,
  deleteGenre,
  fetchSeries,
  addSeries,
  editSeries,
  deleteSeries,
  fetchAuthors,
  addAuthor,
  editAuthor,
  deleteAuthor,
  type BookFilters 
} from './supabaseClient';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, BarChart3, BookOpen, AlertCircle } from 'lucide-react';
import { Book as BookType, Genre, Series, Author } from './types/Book';
import { 
  calculateOverallRating 
} from './utils/storage';
import BookForm from './components/BookForm';
import BookList from './components/BookList';
import { convertToStarRating } from './utils/storage';

function App() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [allAvailableYears, setAllAvailableYears] = useState<number[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalCollectionCount, setTotalCollectionCount] = useState(0);
  const [currentYearCount, setCurrentYearCount] = useState(0);
  const [filteredStats, setFilteredStats] = useState({ totalCount: 0, currentYearCount: 0 });
  const [filtersChanged, setFiltersChanged] = useState(false);
  
  // Shared filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [whichWitchFilter, setWhichWitchFilter] = useState('');
  const [sortField, setSortField] = useState<'title' | 'author' | 'date' | 'rating' | 'genre'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const ITEMS_PER_PAGE = 20;

  // Debounce search term
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Create filters object
  const filters: BookFilters = useMemo(() => ({
    searchTerm: debouncedSearchTerm || undefined,
    genreFilter: genreFilter || undefined,
    yearFilter: yearFilter || undefined,
    whichWitchFilter: whichWitchFilter || undefined,
    sortField,
    sortDirection
  }), [debouncedSearchTerm, genreFilter, yearFilter, whichWitchFilter, sortField, sortDirection]);

  // Load books with pagination
  const loadBooksPage = useCallback(async (page: number = 0, isNewSearch = false) => {
    if (!supabaseConnected) return;
    
    try {
      if (isNewSearch) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await fetchBooksWithPagination(page, ITEMS_PER_PAGE, filters);
      
      if (isNewSearch || page === 0) {
        setBooks(result.books);
      } else {
        setBooks(prev => [...prev, ...result.books]);
      }
      
      setCurrentPage(page);
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
      setFiltersChanged(false);
      
      // Update filtered stats whenever we load books
      updateFilteredStats();
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [supabaseConnected, filters]);

  // Update filtered stats based on current filters
  const updateFilteredStats = useCallback(async () => {
    if (!supabaseConnected) return;
    
    try {
      const stats = await fetchFilteredCounts(filters);
      setFilteredStats(stats);
    } catch (error) {
      console.error('Failed to update filtered stats:', error);
      setFilteredStats({ totalCount: 0, currentYearCount: 0 });
    }
  }, [supabaseConnected, filters]);

  // Load more books for infinite scroll
  const loadMoreBooks = useCallback(() => {
    if (!isLoadingMore && hasMore && !filtersChanged) {
      loadBooksPage(currentPage + 1, false);
    }
  }, [isLoadingMore, hasMore, currentPage, filtersChanged, loadBooksPage]);

  // Reset and reload when filters change
  useEffect(() => {
    if (supabaseConnected) {
      setFiltersChanged(true);
      loadBooksPage(0, true);
    }
  }, [filters, supabaseConnected, loadBooksPage]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Debug environment variables
        console.log('Environment check:', {
          hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          nodeEnv: import.meta.env.MODE
        });
        
        // Test Supabase connection first
        const isConnected = await testConnection();
        console.log('Supabase connection result:', isConnected);
        setSupabaseConnected(isConnected);
        
        if (isConnected) {
          // Load first page of books
          await loadBooksPage(0, true);
          // Load genres, series, authors, years, and counts from database
          await loadGenresFromDB();
          await loadSeriesFromDB();
          await loadAuthorsFromDB();
          await loadAvailableYears();
          await loadTotalCollectionCount();
          await loadCurrentYearCount();
        } else {
          // If not connected, start with empty array
          console.warn('Supabase not connected, starting with empty book list. Please check your Vercel environment variables.');
          setBooks([]);
          setGenres([]);
          setSeries([]);
          setAuthors([]);
          setAllAvailableYears([]);
          setTotalCollectionCount(0);
          setCurrentYearCount(0);
          setFilteredStats({ totalCount: 0, currentYearCount: 0 });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setSupabaseConnected(false);
        setBooks([]);
        setGenres([]);
        setSeries([]);
        setAuthors([]);
        setAllAvailableYears([]);
        setTotalCollectionCount(0);
        setCurrentYearCount(0);
        setFilteredStats({ totalCount: 0, currentYearCount: 0 });
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Load current year count from database
  const loadCurrentYearCount = async () => {
    try {
      const count = await fetchCurrentYearCount();
      setCurrentYearCount(count);
    } catch (error) {
      console.error('Failed to load current year count:', error);
      setCurrentYearCount(0);
    }
  };

  // Load total collection count (all books, no filters)
  const loadTotalCollectionCount = async () => {
    try {
      const result = await fetchBooksWithPagination(0, 1, {}); // Just get count, no filters
      setTotalCollectionCount(result.totalCount);
    } catch (error) {
      console.error('Failed to load total collection count:', error);
      setTotalCollectionCount(0);
    }
  };

  // Load all available years from database
  const loadAvailableYears = async () => {
    try {
      const years = await fetchAllYears();
      setAllAvailableYears(years);
    } catch (error) {
      console.error('Failed to load available years:', error);
      setAllAvailableYears([]);
    }
  };

  // Load genres from database
  const loadGenresFromDB = async () => {
    try {
      const dbGenres = await fetchGenres();
      
      // If database is empty, populate with default genres
      if (dbGenres.length === 0) {
        console.log('No genres in database, populating with defaults...');
        const defaultGenres = [
          'Fantasy Fiction', 'Epic Fantasy', 'Romantasy', 'Mythology Retelling', 
          'Cosy Fantasy', 'Grimdark Fantasy', 'Urban Fantasy', 'Fairytale Fantasy',
          'Dystopian Fiction', 'Thriller/Mystery', 'Childrens Fiction', 'Young Adult Fiction',
          'Historical Fiction', 'Sci-Fi', 'Contemporary Fiction', 'Romance',
          'Paranormal Fiction', 'Gothic Fiction', 'Horror', 'Magical Realism', 'Non-Fiction'
        ];
        
        // Add all default genres to database
        const addedGenres = [];
        for (const genreName of defaultGenres) {
          try {
            const newGenre = await addGenre(genreName);
            addedGenres.push(newGenre);
          } catch (error) {
            console.error(`Failed to add default genre ${genreName}:`, error);
          }
        }
        
        setGenres(addedGenres.sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        setGenres(dbGenres);
      }
    } catch (error) {
      console.error('Failed to load genres from database:', error);
      setGenres([]);
    }
  };

  // Load series from database
  const loadSeriesFromDB = async () => {
    try {
      const dbSeries = await fetchSeries();
      setSeries(dbSeries);
    } catch (error) {
      console.error('Failed to load series from database:', error);
      setSeries([]);
    }
  };

  // Load authors from database
  const loadAuthorsFromDB = async () => {
    try {
      const dbAuthors = await fetchAuthors();
      setAuthors(dbAuthors);
    } catch (error) {
      console.error('Failed to load authors from database:', error);
      setAuthors([]);
    }
  };
  
  const handleEditBook = async (bookData: Omit<BookType, 'overallRating'>) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first by clicking the "Connect to Supabase" button in the top right.');
      return;
    }

    // Find the original book to preserve existing data
    const originalBook = books.find(book => book.id === bookData.id);
    if (!originalBook) {
      console.error('Original book not found');
      return;
    }

    // Create the book data to send to database
    const bookToUpdate: BookType = {
      ...originalBook, // Start with all original data
      ...bookData, // Override with form data
      // Preserve the existing coverImage if no new image was provided
      coverImage: bookData.coverImage !== undefined ? bookData.coverImage : originalBook.coverImage,
      overallRating: calculateOverallRating(bookData.ratings),
    };

    try {
      // The updateBook function now returns the updated book with the final image URL
      const finalUpdatedBook = await updateBook(bookToUpdate);
      
      setEditingBook(null);
      console.log('Book updated successfully in Supabase');
      
      // Refresh the book list and counts to reflect changes
      loadBooksPage(0, true);
      loadCurrentYearCount(); // In case completion year changed
    } catch (error) {
      console.error('Failed to update book:', error);
      alert('Failed to update book. Please check your Supabase connection and try again.');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first.');
      return;
    }

    try {
      // Delete from database
      await deleteBook(bookId);
      
      console.log('Book deleted successfully');
      
      // Refresh book list and counts
      loadBooksPage(0, true);
      loadTotalCollectionCount();
      loadCurrentYearCount();
    } catch (error) {
      console.error('Failed to delete book:', error);
      alert('Failed to delete book. Please try again.');
    }
  };

  const handleAddBook = async (bookData: Omit<BookType, 'id' | 'overallRating' | 'dateadded'>) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first by clicking the "Connect to Supabase" button in the top right.');
      return;
    }

    console.log('Adding book with data:', bookData);

    const newBook: BookType = {
      ...bookData,
      id: Date.now().toString(),
      overallRating: calculateOverallRating(bookData.ratings),
      dateAdded: new Date().toISOString(),
    };

    console.log('New book object:', newBook);

    try {
      await addBook(newBook);
      console.log('Book saved successfully to Supabase');
      
      // Reload from beginning to show new book and update counts
      loadBooksPage(0, true);
      loadTotalCollectionCount();
      loadCurrentYearCount();
    } catch (error) {
      console.error('Failed to save book to Supabase:', error);
      alert('Failed to save book. Please check your Supabase connection and try again.');
    }
  };
  
  const handleAddGenre = async (genreName: string) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first.');
      return;
    }

    try {
      const newGenre = await addGenre(genreName);
      setGenres(prev => [...prev, newGenre].sort((a, b) => a.name.localeCompare(b.name)));
      console.log('Genre added successfully:', newGenre.name);
    } catch (error) {
      console.error('Failed to add genre:', error);
      alert('Failed to add genre. Please try again.');
    }
  };

  const handleAddSeries = async (seriesName: string) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first.');
      return;
    }

    try {
      const newSeries = await addSeries(seriesName);
      setSeries(prev => [...prev, newSeries].sort((a, b) => a.name.localeCompare(b.name)));
      console.log('Series added successfully:', newSeries.name);
    } catch (error) {
      console.error('Failed to add series:', error);
      alert('Failed to add series. Please try again.');
    }
  };

  const handleAddAuthor = async (authorName: string) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first.');
      return;
    }

    try {
      const newAuthor = await addAuthor(authorName);
      setAuthors(prev => [...prev, newAuthor].sort((a, b) => a.name.localeCompare(b.name)));
      console.log('Author added successfully:', newAuthor.name);
    } catch (error) {
      console.error('Failed to add author:', error);
      alert('Failed to add author. Please try again.');
    }
  };

  const handleDeleteGenre = async (genreId: string) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first.');
      return;
    }

    try {
      await deleteGenre(genreId);
      setGenres(prev => prev.filter(genre => genre.id !== genreId));
      console.log('Genre deleted successfully');
    } catch (error) {
      console.error('Failed to delete genre:', error);
      alert('Failed to delete genre. Please try again.');
    }
  };

  const handleDeleteSeries = async (seriesId: string) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first.');
      return;
    }

    try {
      await deleteSeries(seriesId);
      setSeries(prev => prev.filter(series => series.id !== seriesId));
      console.log('Series deleted successfully');
    } catch (error) {
      console.error('Failed to delete series:', error);
      alert('Failed to delete series. Please try again.');
    }
  };

  const handleDeleteAuthor = async (authorId: string) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first.');
      return;
    }

    try {
      await deleteAuthor(authorId);
      setAuthors(prev => prev.filter(author => author.id !== authorId));
      console.log('Author deleted successfully');
    } catch (error) {
      console.error('Failed to delete author:', error);
      alert('Failed to delete author. Please try again.');
    }
  };

  const handleEditGenre = async (genreId: string, oldName: string, newName: string) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first.');
      return;
    }

    try {
      const updatedGenre = await editGenre(genreId, oldName, newName);
      setGenres(prev => prev.map(genre => 
        genre.id === genreId ? updatedGenre : genre
      ).sort((a, b) => a.name.localeCompare(b.name)));
      
      // Refresh book list to show updated genre names
      loadBooksPage(0, true);
      console.log('Genre edited successfully');
    } catch (error) {
      console.error('Failed to edit genre:', error);
      alert('Failed to edit genre. Please try again.');
    }
  };

  const handleEditSeries = async (seriesId: string, oldName: string, newName: string) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first.');
      return;
    }

    try {
      const updatedSeries = await editSeries(seriesId, oldName, newName);
      setSeries(prev => prev.map(series => 
        series.id === seriesId ? updatedSeries : series
      ).sort((a, b) => a.name.localeCompare(b.name)));
      
      // Refresh book list to show updated series names
      loadBooksPage(0, true);
      console.log('Series edited successfully');
    } catch (error) {
      console.error('Failed to edit series:', error);
      alert('Failed to edit series. Please try again.');
    }
  };

  const handleEditAuthor = async (authorId: string, oldName: string, newName: string) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first.');
      return;
    }

    try {
      const updatedAuthor = await editAuthor(authorId, oldName, newName);
      setAuthors(prev => prev.map(author => 
        author.id === authorId ? updatedAuthor : author
      ).sort((a, b) => a.name.localeCompare(b.name)));
      
      // Refresh book list to show updated author names
      loadBooksPage(0, true);
      console.log('Author edited successfully');
    } catch (error) {
      console.error('Failed to edit author:', error);
      alert('Failed to edit author. Please try again.');
    }
  };

  const getStats = () => {
    // Check if any filters are applied
    const hasFilters = !!(filters.searchTerm || filters.genreFilter || filters.yearFilter || filters.whichWitchFilter);
    
    if (hasFilters) {
      // Use filtered stats when filters are applied
      return { 
        totalBooks: filteredStats.totalCount, 
        booksThisYear: filteredStats.currentYearCount 
      };
    } else {
      // Use unfiltered stats when no filters are applied
      return { 
        totalBooks: totalCollectionCount, 
        booksThisYear: currentYearCount 
      };
    }
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="min-h-screen font-serif flex items-center justify-center" style={{ 
        background: 'linear-gradient(to bottom right, #f0dae3, #d681a3, #f5d3e0)',
        fontFamily: '"EB Garamond", serif'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#d681a3' }}></div>
          <p className="text-lg text-gray-600">Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-serif" style={{ 
      background: 'linear-gradient(to bottom right, #f0dae3, #f5e6ec, #f0dae3)',
      fontFamily: '"EB Garamond", serif'
    }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg shadow-md" style={{ background: 'linear-gradient(to bottom right, #d681a3, #f5d3e0)' }}>
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reading Realm</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Supabase Connection Status */}
              {supabaseConnected === false && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700">
                    Connect Supabase to save books
                  </span>
                </div>
              )}
              
              <button
                onClick={() => setShowBookForm(true)}
                className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
                style={{ 
                  backgroundColor: '#d681a3',
                  ':hover': { backgroundColor: '#c166a0' }
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c166a0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d681a3'}
              >
                <Plus className="w-5 h-5" />
                <span>Add Book</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats and Filters Layout */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Stats Column */}
          <div className="flex flex-row lg:flex-col space-x-4 lg:space-x-0 lg:space-y-4 lg:w-64">
            <div className="bg-white p-4 rounded-xl shadow-sm flex-1 lg:flex-none">
              <div className="flex items-center">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#f0dae3' }}>
                  <BookOpen className="w-5 h-5" style={{ color: '#d681a3' }} />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Total Books</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalBooks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm flex-1 lg:flex-none">
              <div className="flex items-center">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#f0dae3' }}>
                  <BarChart3 className="w-5 h-5" style={{ color: '#d681a3' }} />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">This Year</p>
                  <p className="text-xl font-bold text-gray-900">{stats.booksThisYear}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Column */}
          <div className="flex-1">
            <BookList 
              books={books} 
              genres={genres} 
              onEditBook={setEditingBook}
              showFiltersOnly={true}
              totalCount={totalCount}
              totalCollectionCount={totalCollectionCount}
              allAvailableYears={allAvailableYears}
              // Pass filter state and setters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              genreFilter={genreFilter}
              setGenreFilter={setGenreFilter}
              yearFilter={yearFilter}
              setYearFilter={setYearFilter}
              whichWitchFilter={whichWitchFilter}
              setWhichWitchFilter={setWhichWitchFilter}
              sortField={sortField}
              setSortField={setSortField}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
        </div>

        {/* Book List */}
        <BookList 
          books={books} 
          genres={genres} 
          onEditBook={setEditingBook}
          showFiltersOnly={false}
          totalCount={totalCount}
          totalCollectionCount={totalCollectionCount}
          isLoading={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreBooks}
          allAvailableYears={allAvailableYears}
          // Pass the same filter state
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          whichWitchFilter={whichWitchFilter}
          setWhichWitchFilter={setWhichWitchFilter}
          sortField={sortField}
          setSortField={setSortField}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Book Form Modal */}
        {(showBookForm || editingBook) && (
          <BookForm
            book={editingBook}
            onSubmit={editingBook ? handleEditBook : handleAddBook}
            onClose={() => {
              setShowBookForm(false);
              setEditingBook(null);
            }}
            onDelete={editingBook ? handleDeleteBook : undefined}
            genres={genres}
            series={series}
            authors={authors}
            onAddGenre={handleAddGenre}
            onAddSeries={handleAddSeries}
            onAddAuthor={handleAddAuthor}
            onDeleteGenre={handleDeleteGenre}
            onDeleteSeries={handleDeleteSeries}
            onDeleteAuthor={handleDeleteAuthor}
            onEditGenre={handleEditGenre}
            onEditSeries={handleEditSeries}
            onEditAuthor={handleEditAuthor}
          />
        )}
      </div>
    </div>
  );
}

export default App;