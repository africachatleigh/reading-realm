import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, BookOpen } from 'lucide-react';
import { Book as BookType, Genre, Series, Author } from './types/Book';
import { 
  loadBooks, 
  saveBooks, 
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
import ConnectionStatus from './components/ConnectionStatus';
import { convertToStarRating } from './utils/storage';

function App() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    setBooks(loadBooks());
    setGenres(loadGenres());
    setSeries(loadSeries());
    setAuthors(loadAuthors());
  }, []);

  const handleAddBook = (bookData: Omit<BookType, 'id' | 'overallRating' | 'dateAdded'>) => {
    const newBook: BookType = {
      ...bookData,
      id: Date.now().toString(),
      overallRating: calculateOverallRating(bookData.ratings),
      dateAdded: new Date().toISOString(),
    };

    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    saveBooks(updatedBooks);
  };

  const handleEditBook = (bookData: Omit<BookType, 'overallRating'>) => {
    const updatedBook: BookType = {
      ...bookData,
      overallRating: calculateOverallRating(bookData.ratings),
    };

    const updatedBooks = books.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    );
    setBooks(updatedBooks);
    saveBooks(updatedBooks);
    setEditingBook(null);
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

  const getStats = () => {
    const totalBooks = books.length;
    const currentYear = new Date().getFullYear();
    const booksThisYear = books.filter(book => book.completionYear === currentYear).length;

    return { totalBooks, booksThisYear };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen font-serif" style={{ 
      background: 'linear-gradient(to bottom right, #d0dfc8, #e8f0e1, #d0dfc8)',
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
                <h1 className="text-3xl font-bold text-gray-900">Chaskit Books</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ConnectionStatus onConnectionChange={setIsBackendConnected} />
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
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#d0dfc8' }}>
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
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#d0dfc8' }}>
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
            />
          </div>
        </div>

        {/* Book List */}
        <BookList 
          books={books} 
          genres={genres} 
          onEditBook={setEditingBook}
          showFiltersOnly={false}
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