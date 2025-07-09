import { addBook, updateBook, fetchBooks, testConnection, deleteBook } from './supabaseClient';
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, BarChart3, BookOpen, AlertCircle } from 'lucide-react';
import { Book as BookType, Genre, Series, Author } from './types/Book';
import { 
  loadGenres, 
  saveGenres, 
  loadSeries, 
  saveSeries, 
  loadAuthors, 
  saveAuthors, 
  calculateOverallRating 
} from './utils/storage';
import BookForm from './components/BookForm';
import BookList from './components/BookList';
import { convertToStarRating } from './utils/storage';

function App() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  
  // Shared filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [whichWitchFilter, setWhichWitchFilter] = useState('');
  const [sortField, setSortField] = useState<'title' | 'author' | 'date' | 'rating' | 'genre'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
          // If connected, fetch books from Supabase
          const loadedBooks = await fetchBooks();
          console.log('Loaded books count:', loadedBooks.length);
          setBooks(loadedBooks);
        } else {
          // If not connected, start with empty array
          console.warn('Supabase not connected, starting with empty book list. Please check your Vercel environment variables.');
          setBooks([]);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setSupabaseConnected(false);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
    setGenres(loadGenres());
    setSeries(loadSeries());
    setAuthors(loadAuthors());
  }, []);
  
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

    // Store original books for potential revert
    const originalBooks = books;

    try {
      // The updateBook function now returns the updated book with the final image URL
      const finalUpdatedBook = await updateBook(bookToUpdate);
      
      // Update the UI with the final book data (with correct image URL)
      setBooks(prev => prev.map(book =>
        book.id === finalUpdatedBook.id ? finalUpdatedBook : book
      ));
      
      setEditingBook(null);
      console.log('Book updated successfully in Supabase');
    } catch (error) {
      console.error('Failed to update book:', error);
      // Revert to original books on error
      setBooks(originalBooks);
      alert('Failed to update book. Please check your Supabase connection and try again.');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!supabaseConnected) {
      alert('Please connect Supabase first.');
      return;
    }

    try {
      // Remove from UI first (optimistic update)
      setBooks(prev => prev.filter(book => book.id !== bookId));
      
      // Delete from database
      await deleteBook(bookId);
      
      console.log('Book deleted successfully');
    } catch (error) {
      console.error('Failed to delete book:', error);
      // Restore the book if deletion failed
      const restoredBooks = await fetchBooks();
      setBooks(restoredBooks);
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
      dateadded: new Date().toISOString(),
    };

    console.log('New book object:', newBook);

    // Optimistic UI update
    setBooks(prev => [newBook, ...prev]);

    try {
      await addBook(newBook);
      console.log('Book saved successfully to Supabase');
      
      // Verify the book was actually saved by refetching
      const updatedBooks = await fetchBooks();
      setBooks(updatedBooks);
      console.log('Books refetched after add:', updatedBooks.length);
    } catch (error) {
      console.error('Failed to save book to Supabase:', error);
      // Revert optimistic update on error
      setBooks(prev => prev.filter(book => book.id !== newBook.id));
      alert('Failed to save book. Please check your Supabase connection and try again.');
    }
  };
  
  const handleAddGenre = (genreName: string) => {
    const newGenre: Genre = {
      id: Date.now().toString(),
      name: genreName,
      isCustom: true,
    };

    const updatedGenres = [...genres, newGenre];
    setGenres(updatedGenres);
    saveGenres(updatedGenres);
  };

  const handleAddSeries = (seriesName: string) => {
    const newSeries: Series = {
      id: Date.now().toString(),
      name: seriesName,
    };

    const updatedSeries = [...series, newSeries];
    setSeries(updatedSeries);
    saveSeries(updatedSeries);
  };

  const handleAddAuthor = (authorName: string) => {
    const newAuthor: Author = {
      id: Date.now().toString(),
      name: authorName,
    };

    const updatedAuthors = [...authors, newAuthor];
    setAuthors(updatedAuthors);
    saveAuthors(updatedAuthors);
  };

  // Calculate filtered books for stats
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = !genreFilter || (book.genres || []).includes(genreFilter);
      const matchesYear = !yearFilter || book.completionYear.toString() === yearFilter;
      const matchesWhichWitch = !whichWitchFilter || book.whichWitch === whichWitchFilter;

      return matchesSearch && matchesGenre && matchesYear && matchesWhichWitch;
    });
  }, [books, searchTerm, genreFilter, yearFilter, whichWitchFilter]);

  const getStats = () => {
    const totalBooks = filteredBooks.length;
    const currentYear = new Date().getFullYear();
    const booksThisYear = filteredBooks.filter(book => book.completionYear === currentYear).length;

    return { totalBooks, booksThisYear };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="min-h-screen font-serif flex items-center justify-center" style={{ 
        background: 'linear-gradient(to bottom right, #f0dae3, #e8f0e1, #f0dae3)',
        fontFamily: '"EB Garamond", serif'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#77a361' }}></div>
          <p className="text-lg text-gray-600">Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-serif" style={{ 
      background: 'linear-gradient(to bottom right, #f0dae3, #e8f0e1, #f0dae3)',
      fontFamily: '"EB Garamond", serif'
    }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg shadow-md" style={{ background: 'linear-gradient(to bottom right, #77a361, #5d8a47)' }}>
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
                  backgroundColor: '#77a361',
                  ':hover': { backgroundColor: '#5d8a47' }
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5d8a47'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#77a361'}
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
          <div className="flex flex-col space-y-4 lg:w-64">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#f0dae3' }}>
                  <BookOpen className="w-5 h-5" style={{ color: '#77a361' }} />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Total Books</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalBooks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#f0dae3' }}>
                  <BarChart3 className="w-5 h-5" style={{ color: '#77a361' }} />
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
          />
        )}
      </div>
    </div>
  );
}

export default App;