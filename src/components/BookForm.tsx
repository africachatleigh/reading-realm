import React, { useState, useEffect } from 'react';
import { Upload, Plus, X } from 'lucide-react';
import { Book, Genre, Series, Author } from '../types/Book';
import { calculateOverallRating, convertToStarRating } from '../utils/storage';
import RatingInput from './RatingInput';
import StarRating from './StarRating';

interface BookFormProps {
  book?: Book | null;
  onSubmit: (book: Omit<Book, 'overallRating'> | Omit<Book, 'id' | 'overallRating' | 'dateAdded'>) => void;
  onClose: () => void;
  genres: Genre[];
  series: Series[];
  authors: Author[];
  onAddGenre: (genreName: string) => void;
  onAddSeries: (seriesName: string) => void;
  onAddAuthor: (authorName: string) => void;
}

const BookForm: React.FC<BookFormProps> = ({ 
  book, 
  onSubmit, 
  onClose, 
  genres, 
  series, 
  authors, 
  onAddGenre, 
  onAddSeries, 
  onAddAuthor 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    completionMonth: new Date().getMonth() + 1,
    completionYear: new Date().getFullYear(),
    genres: [] as string[],
    coverImage: '',
    isStandalone: true,
    seriesName: '',
    whichWitch: '', // This will be required
  });

  const [ratings, setRatings] = useState({
    characters: 5,
    worldBuilding: 5,
    plot: 5,
    writingStyle: 5,
    enjoyment: 5,
  });

  const [newGenre, setNewGenre] = useState('');
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [newSeries, setNewSeries] = useState('');
  const [showAddSeries, setShowAddSeries] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [showAddAuthor, setShowAddAuthor] = useState(false);

  // Which Witch options
  const whichWitchOptions = ['Lou Lou', 'Chlo', 'Affo'];

  // Populate form when editing
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        completionMonth: book.completionMonth,
        completionYear: book.completionYear,
        genres: book.genres || [],
        coverImage: book.coverImage || '',
        isStandalone: book.isStandalone,
        seriesName: book.seriesName || '',
        whichWitch: book.whichWitch || '',
      });
      setRatings(book.ratings);
    }
  }, [book]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, coverImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenreToggle = (genreName: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genreName)
        ? prev.genres.filter(g => g !== genreName)
        : [...prev.genres, genreName]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation - check required fields
    if (!formData.title || !formData.author || formData.genres.length === 0 || !formData.whichWitch) {
      alert('Please fill in all required fields: Title, Author, at least one Genre, and Which Witch selection.');
      return;
    }

    const bookData = {
      ...formData,
      ratings,
      seriesName: formData.isStandalone ? undefined : formData.seriesName,
    };

    if (book) {
      // Editing existing book
      onSubmit({
        ...bookData,
        id: book.id,
        dateAdded: book.dateAdded,
      });
    } else {
      // Adding new book
      onSubmit(bookData);
    }

    onClose();
  };

  const handleAddGenre = () => {
    if (newGenre.trim()) {
      onAddGenre(newGenre.trim());
      setFormData(prev => ({ 
        ...prev, 
        genres: [...prev.genres, newGenre.trim()]
      }));
      setNewGenre('');
      setShowAddGenre(false);
    }
  };

  const handleAddSeries = () => {
    if (newSeries.trim()) {
      onAddSeries(newSeries.trim());
      setFormData(prev => ({ ...prev, seriesName: newSeries.trim() }));
      setNewSeries('');
      setShowAddSeries(false);
    }
  };

  const handleAddAuthor = () => {
    if (newAuthor.trim()) {
      onAddAuthor(newAuthor.trim());
      setFormData(prev => ({ ...prev, author: newAuthor.trim() }));
      setNewAuthor('');
      setShowAddAuthor(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {book ? 'Edit Book' : 'Add New Book'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Book Cover</label>
            <div className="flex items-center space-x-4">
              {formData.coverImage ? (
                <div className="relative">
                  <img
                    src={formData.coverImage}
                    alt="Book cover"
                    className="w-20 h-28 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="cursor-pointer text-white px-4 py-2 rounded-lg border transition-colors"
                  style={{ 
                    backgroundColor: '#d0dfc8',
                    color: '#77a361',
                    borderColor: '#77a361'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#77a361';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d0dfc8';
                    e.currentTarget.style.color = '#77a361';
                  }}
                >
                  Upload Cover
                </label>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                placeholder="Enter book title"
                style={{ 
                  '--tw-ring-color': '#77a361',
                  focusRingColor: '#77a361'
                }}
                onFocus={(e) => e.target.style.borderColor = '#77a361'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
              <div className="space-y-2">
                <select
                  required
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': '#77a361',
                    focusRingColor: '#77a361'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#77a361'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="">Select an author</option>
                  {authors.map(author => (
                    <option key={author.id} value={author.name}>{author.name}</option>
                  ))}
                </select>

                {!showAddAuthor ? (
                  <button
                    type="button"
                    onClick={() => setShowAddAuthor(true)}
                    className="flex items-center space-x-1 hover:text-green-700 text-sm"
                    style={{ color: '#77a361' }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add new author</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="Enter author name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ 
                        '--tw-ring-color': '#77a361',
                        focusRingColor: '#77a361'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#77a361'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    <button
                      type="button"
                      onClick={handleAddAuthor}
                      className="px-4 py-2 text-white rounded-lg transition-colors"
                      style={{ backgroundColor: '#77a361' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5d8a47'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#77a361'}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddAuthor(false);
                        setNewAuthor('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Which Witch Selection - REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Which Witch *
              <span className="text-red-500 ml-1 font-normal">(Required)</span>
            </label>
            <select
              required
              value={formData.whichWitch}
              onChange={(e) => setFormData(prev => ({ ...prev, whichWitch: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ 
                '--tw-ring-color': '#77a361',
                focusRingColor: '#77a361'
              }}
              onFocus={(e) => e.target.style.borderColor = '#77a361'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">Select a witch</option>
              {whichWitchOptions.map(witch => (
                <option key={witch} value={witch}>{witch}</option>
              ))}
            </select>
          </div>

          {/* Completion Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Completion Date</label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.completionMonth}
                onChange={(e) => setFormData(prev => ({ ...prev, completionMonth: parseInt(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ 
                  '--tw-ring-color': '#77a361',
                  focusRingColor: '#77a361'
                }}
                onFocus={(e) => e.target.style.borderColor = '#77a361'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>

              <select
                value={formData.completionYear}
                onChange={(e) => setFormData(prev => ({ ...prev, completionYear: parseInt(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ 
                  '--tw-ring-color': '#77a361',
                  focusRingColor: '#77a361'
                }}
                onFocus={(e) => e.target.style.borderColor = '#77a361'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Genres - Multiple Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genres * ({formData.genres.length} selected)
            </label>
            
            {/* Selected Genres Display */}
            {formData.genres.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.genres.map(genre => (
                  <span
                    key={genre}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white"
                    style={{ backgroundColor: '#77a361' }}
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      className="ml-2 text-white hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Genre Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {genres.map(genre => (
                <label
                  key={genre.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre.name)}
                    onChange={() => handleGenreToggle(genre.name)}
                    className="w-4 h-4 border-gray-300 rounded"
                    style={{ 
                      accentColor: '#77a361'
                    }}
                  />
                  <span className="text-sm text-gray-700">{genre.name}</span>
                </label>
              ))}
            </div>

            {/* Add Custom Genre */}
            {!showAddGenre ? (
              <button
                type="button"
                onClick={() => setShowAddGenre(true)}
                className="flex items-center space-x-1 hover:text-green-700 text-sm"
                style={{ color: '#77a361' }}
              >
                <Plus className="w-4 h-4" />
                <span>Add custom genre</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  placeholder="Enter new genre"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': '#77a361',
                    focusRingColor: '#77a361'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#77a361'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  type="button"
                  onClick={handleAddGenre}
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#77a361' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5d8a47'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#77a361'}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddGenre(false);
                    setNewGenre('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Series Information */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Book Type</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="standalone"
                  name="bookType"
                  checked={formData.isStandalone}
                  onChange={() => setFormData(prev => ({ ...prev, isStandalone: true, seriesName: '' }))}
                  className="w-4 h-4"
                  style={{ accentColor: '#77a361' }}
                />
                <label htmlFor="standalone" className="text-sm text-gray-700">Standalone</label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="series"
                  name="bookType"
                  checked={!formData.isStandalone}
                  onChange={() => setFormData(prev => ({ ...prev, isStandalone: false }))}
                  className="w-4 h-4"
                  style={{ accentColor: '#77a361' }}
                />
                <label htmlFor="series" className="text-sm text-gray-700">Part of a series</label>
              </div>

              {!formData.isStandalone && (
                <div className="ml-7 space-y-2">
                  <select
                    value={formData.seriesName}
                    onChange={(e) => setFormData(prev => ({ ...prev, seriesName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': '#77a361',
                      focusRingColor: '#77a361'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#77a361'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="">Select a series</option>
                    {series.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>

                  {!showAddSeries ? (
                    <button
                      type="button"
                      onClick={() => setShowAddSeries(true)}
                      className="flex items-center space-x-1 hover:text-green-700 text-sm"
                      style={{ color: '#77a361' }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add new series</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSeries}
                        onChange={(e) => setNewSeries(e.target.value)}
                        placeholder="Enter series name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ 
                          '--tw-ring-color': '#77a361',
                          focusRingColor: '#77a361'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#77a361'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                      <button
                        type="button"
                        onClick={handleAddSeries}
                        className="px-4 py-2 text-white rounded-lg transition-colors"
                        style={{ backgroundColor: '#77a361' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5d8a47'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#77a361'}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddSeries(false);
                          setNewSeries('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Ratings</h3>
            <div className="grid grid-cols-1 gap-4">
              <RatingInput
                label="Characters"
                value={ratings.characters}
                onChange={(value) => setRatings(prev => ({ ...prev, characters: value }))}
              />
              <RatingInput
                label="World Building"
                value={ratings.worldBuilding}
                onChange={(value) => setRatings(prev => ({ ...prev, worldBuilding: value }))}
              />
              <RatingInput
                label="Plot"
                value={ratings.plot}
                onChange={(value) => setRatings(prev => ({ ...prev, plot: value }))}
              />
              <RatingInput
                label="Writing Style"
                value={ratings.writingStyle}
                onChange={(value) => setRatings(prev => ({ ...prev, writingStyle: value }))}
              />
              <RatingInput
                label="Enjoyment"
                value={ratings.enjoyment}
                onChange={(value) => setRatings(prev => ({ ...prev, enjoyment: value }))}
              />
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: '#d0dfc8' }}>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Overall Rating:</span>
                <div className="flex items-center space-x-3">
                  <StarRating 
                    rating={convertToStarRating(calculateOverallRating(ratings))} 
                    size="md" 
                    showNumber={false}
                  />
                  <span className="text-lg font-bold" style={{ color: '#77a361' }}>
                    {convertToStarRating(calculateOverallRating(ratings)).toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
              style={{ backgroundColor: '#77a361' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5d8a47'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#77a361'}
            >
              {book ? 'Update Book' : 'Add Book'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;