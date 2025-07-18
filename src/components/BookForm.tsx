import React, { useState, useEffect } from 'react';
import { Upload, Plus, X, Trash2, Edit } from 'lucide-react';
import { Book, Genre, Series, Author } from '../types/Book';
import { calculateOverallRating, convertToStarRating } from '../utils/storage';
import RatingInput from './RatingInput';
import StarRating from './StarRating';

interface BookFormProps {
  book?: Book | null;
  onSubmit: (book: Omit<Book, 'overallRating'> | Omit<Book, 'id' | 'overallRating' | 'dateAdded'>) => void;
  onClose: () => void;
  onDelete?: (bookId: string) => void;
  genres: Genre[];
  series: Series[];
  authors: Author[];
  onAddGenre: (genreName: string) => void;
  onAddSeries: (seriesName: string) => void;
  onAddAuthor: (authorName: string) => void;
  onDeleteGenre?: (genreId: string) => void;
  onDeleteSeries?: (seriesId: string) => void;
  onDeleteAuthor?: (authorId: string) => void;
  onEditGenre?: (genreId: string, oldName: string, newName: string) => void;
  onEditSeries?: (seriesId: string, oldName: string, newName: string) => void;
  onEditAuthor?: (authorId: string, oldName: string, newName: string) => void;
}

const BookForm: React.FC<BookFormProps> = ({ 
  book, 
  onSubmit, 
  onClose, 
  onDelete,
  genres, 
  series, 
  authors, 
  onAddGenre, 
  onAddSeries, 
  onAddAuthor,
  onDeleteGenre,
  onDeleteSeries,
  onDeleteAuthor,
  onEditGenre,
  onEditSeries,
  onEditAuthor
}) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    completionMonth: 0, // Changed to 0 for placeholder
    completionYear: 0,  // Changed to 0 for placeholder
    genres: [] as string[],
    coverImage: '',
    isStandalone: true,
    seriesName: '',
    whichWitch: '', // This will be required
  });

  const [ratings, setRatings] = useState({
    characters: 5 as number | null,
    worldBuilding: 5 as number | null,
    plot: 5 as number | null,
    writingStyle: 5 as number | null,
    enjoyment: 5 as number | null,
  });

  const [newGenre, setNewGenre] = useState('');
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [newSeries, setNewSeries] = useState('');
  const [showAddSeries, setShowAddSeries] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [showAddAuthor, setShowAddAuthor] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [showManageAuthors, setShowManageAuthors] = useState(false);
  const [showManageSeries, setShowManageSeries] = useState(false);
  const [showManageGenres, setShowManageGenres] = useState(false);
  
  // Edit states
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [editingGenreId, setEditingGenreId] = useState<string | null>(null);
  const [editingAuthorName, setEditingAuthorName] = useState('');
  const [editingSeriesName, setEditingSeriesName] = useState('');
  const [editingGenreName, setEditingGenreName] = useState('');

  // Which Witch options
  const whichWitchOptions = ['Lou Lou 🍁', '🪄 Chlo', 'Affo ⚔️'];

  // Sort authors and series alphabetically
  const sortedAuthors = [...authors].sort((a, b) => a.name.localeCompare(b.name));
  const sortedSeries = [...series].sort((a, b) => a.name.localeCompare(b.name));
  const sortedGenres = [...genres].sort((a, b) => a.name.localeCompare(b.name));

  // Populate form when editing
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        // Handle both camelCase and database column names
        completionMonth: book.completionMonth || book.completionmonth,
        completionYear: book.completionYear || book.completionyear,
        genres: book.genres || [],
        coverImage: book.coverImage || book.coverimage || '',
        isStandalone: book.isStandalone !== undefined ? book.isStandalone : book.isstandalone,
        seriesName: book.seriesName || book.seriesname || '',
        whichWitch: book.whichWitch || book.whichwitch || '',
      });
      setRatings(book.ratings);
      setImageChanged(false);
    }
  }, [book]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, coverImage: e.target?.result as string }));
        setImageChanged(true);
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
    if (!formData.title || !formData.author || formData.genres.length === 0 || !formData.whichWitch || !formData.completionMonth || !formData.completionYear) {
      alert('Please fill in all required fields: Title, Author, at least one Genre, Completion Date (Month and Year), and Which Witch selection.');
      return;
    }

    const bookData = {
      ...formData,
      ratings,
      seriesName: formData.isStandalone ? undefined : formData.seriesName,
      // Only include coverImage if it's changed (for edits) or if it's a new book
      coverImage: imageChanged || !book ? formData.coverImage : undefined,
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

  const handleDeleteAuthor = (authorId: string, authorName: string) => {
    if (onDeleteAuthor) {
      const confirmed = window.confirm(`Are you sure you want to delete the author "${authorName}"? This action cannot be undone.`);
      if (confirmed) {
        onDeleteAuthor(authorId);
        // If the deleted author was selected, clear the selection
        if (formData.author === authorName) {
          setFormData(prev => ({ ...prev, author: '' }));
        }
      }
    }
  };

  const handleDeleteSeries = (seriesId: string, seriesName: string) => {
    if (onDeleteSeries) {
      const confirmed = window.confirm(`Are you sure you want to delete the series "${seriesName}"? This action cannot be undone.`);
      if (confirmed) {
        onDeleteSeries(seriesId);
        // If the deleted series was selected, clear the selection
        if (formData.seriesName === seriesName) {
          setFormData(prev => ({ ...prev, seriesName: '' }));
        }
      }
    }
  };

  const handleDeleteGenre = (genreId: string, genreName: string) => {
    if (onDeleteGenre) {
      const confirmed = window.confirm(`Are you sure you want to delete the genre "${genreName}"? This action cannot be undone.`);
      if (confirmed) {
        onDeleteGenre(genreId);
        // If the deleted genre was selected, remove it from selection
        if (formData.genres.includes(genreName)) {
          setFormData(prev => ({ 
            ...prev, 
            genres: prev.genres.filter(g => g !== genreName)
          }));
        }
      }
    }
  };

  const handleDelete = () => {
    if (book && onDelete) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${book.title}"? This action cannot be undone.`
      );
      if (confirmed) {
        onDelete(book.id);
        onClose();
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, coverImage: '' }));
    setImageChanged(true);
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
                    onClick={handleRemoveImage}
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
                    backgroundColor: '#f0dae3',
                    color: '#d681a3',
                    borderColor: '#d681a3'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d681a3';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0dae3';
                    e.currentTarget.style.color = '#d681a3';
                  }}
                >
                  {formData.coverImage ? 'Change Cover' : 'Upload Cover'}
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
                  '--tw-ring-color': '#d681a3',
                  focusRingColor: '#d681a3'
                }}
                onFocus={(e) => e.target.style.borderColor = '#d681a3'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author *
                <button
                  type="button"
                  onClick={() => setShowManageAuthors(!showManageAuthors)}
                  className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
                  title={showManageAuthors ? 'Hide management' : 'Manage authors'}
                >
                  <Edit className="w-3 h-3" style={{ color: '#d681a3' }} />
                </button>
              </label>
              <div className="space-y-2">
                <select
                  required
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': '#d681a3',
                    focusRingColor: '#d681a3'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#d681a3'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="">Select an author</option>
                  {sortedAuthors.map(author => (
                    <option key={author.id} value={author.name}>{author.name}</option>
                  ))}
                </select>

                {/* Manage Authors Section */}
                {showManageAuthors && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="text-sm font-medium text-gray-700 mb-2">Manage Authors</div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {sortedAuthors.map(author => (
                        <div key={author.id} className="flex items-center justify-between py-1">
                          {editingAuthorId === author.id ? (
                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                type="text"
                                value={editingAuthorName}
                                onChange={(e) => setEditingAuthorName(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    if (onEditAuthor && editingAuthorName.trim()) {
                                      onEditAuthor(author.id, author.name, editingAuthorName.trim());
                                      setEditingAuthorId(null);
                                      setEditingAuthorName('');
                                    }
                                  } else if (e.key === 'Escape') {
                                    setEditingAuthorId(null);
                                    setEditingAuthorName('');
                                  }
                                }}
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (onEditAuthor && editingAuthorName.trim()) {
                                    onEditAuthor(author.id, author.name, editingAuthorName.trim());
                                    setEditingAuthorId(null);
                                    setEditingAuthorName('');
                                  }
                                }}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Save"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAuthorId(null);
                                  setEditingAuthorName('');
                                }}
                                className="p-1 text-gray-500 hover:text-gray-700"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm text-gray-700">{author.name}</span>
                              <div className="flex space-x-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAuthorId(author.id);
                                    setEditingAuthorName(author.name);
                                  }}
                                  className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                                  title="Edit author"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAuthor(author.id, author.name)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                  title="Delete author"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!showAddAuthor ? (
                  <button
                    type="button"
                    onClick={() => setShowAddAuthor(true)}
                    className="flex items-center space-x-1 hover:text-green-700 text-sm"
                    style={{ color: '#d681a3' }}
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
                        '--tw-ring-color': '#d681a3',
                        focusRingColor: '#d681a3'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d681a3'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    <button
                      type="button"
                      onClick={handleAddAuthor}
                      className="px-4 py-2 text-white rounded-lg transition-colors"
                      style={{ backgroundColor: '#d681a3' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c166a0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d681a3'}
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
            </label>
            <select
              required
              value={formData.whichWitch}
              onChange={(e) => setFormData(prev => ({ ...prev, whichWitch: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ 
                '--tw-ring-color': '#d681a3',
                focusRingColor: '#d681a3'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d681a3'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Date *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                required
                value={formData.completionMonth}
                onChange={(e) => setFormData(prev => ({ ...prev, completionMonth: parseInt(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ 
                  '--tw-ring-color': '#d681a3',
                  focusRingColor: '#d681a3'
                }}
                onFocus={(e) => e.target.style.borderColor = '#d681a3'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value={0}>Select Month</option>
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>

              <select
                required
                value={formData.completionYear}
                onChange={(e) => setFormData(prev => ({ ...prev, completionYear: parseInt(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ 
                  '--tw-ring-color': '#d681a3',
                  focusRingColor: '#d681a3'
                }}
                onFocus={(e) => e.target.style.borderColor = '#d681a3'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value={0}>Select Year</option>
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
              <button
                type="button"
                onClick={() => setShowManageGenres(!showManageGenres)}
                className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
                title={showManageGenres ? 'Hide management' : 'Manage genres'}
              >
                <Edit className="w-3 h-3" style={{ color: '#d681a3' }} />
              </button>
            </label>
            
            {/* Selected Genres Display */}
            {formData.genres.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.genres.map(genre => (
                  <span
                    key={genre}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white"
                    style={{ backgroundColor: '#d681a3' }}
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
              {sortedGenres.map(genre => (
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
                      accentColor: '#d681a3'
                    }}
                  />
                  <span className="text-sm text-gray-700">{genre.name}</span>
                </label>
              ))}
            </div>

            {/* Manage Genres Section */}
            {showManageGenres && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 mb-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Manage Genres</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {sortedGenres.map(genre => (
                    <div key={genre.id} className="flex items-center justify-between py-1">
                      {editingGenreId === genre.id ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="text"
                            value={editingGenreName}
                            onChange={(e) => setEditingGenreName(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (onEditGenre && editingGenreName.trim()) {
                                  onEditGenre(genre.id, genre.name, editingGenreName.trim());
                                  setEditingGenreId(null);
                                  setEditingGenreName('');
                                }
                              } else if (e.key === 'Escape') {
                                setEditingGenreId(null);
                                setEditingGenreName('');
                              }
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (onEditGenre && editingGenreName.trim()) {
                                onEditGenre(genre.id, genre.name, editingGenreName.trim());
                                setEditingGenreId(null);
                                setEditingGenreName('');
                              }
                            }}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingGenreId(null);
                              setEditingGenreName('');
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-gray-700">{genre.name}</span>
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGenreId(genre.id);
                                setEditingGenreName(genre.name);
                              }}
                              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                              title="Edit genre"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGenre(genre.id, genre.name)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="Delete genre"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Genre */}
            {!showAddGenre ? (
              <button
                type="button"
                onClick={() => setShowAddGenre(true)}
                className="flex items-center space-x-1 hover:text-pink-700 text-sm"
                style={{ color: '#d681a3' }}
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
                    '--tw-ring-color': '#d681a3',
                    focusRingColor: '#d681a3'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#d681a3'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  type="button"
                  onClick={handleAddGenre}
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#d681a3' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c166a0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d681a3'}
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
                  style={{ accentColor: '#d681a3' }}
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
                  style={{ accentColor: '#d681a3' }}
                />
                <label htmlFor="series" className="text-sm text-gray-700">Part of a series</label>
              </div>

              {!formData.isStandalone && (
                <div className="ml-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Series Name</span>
                    <button
                      type="button"
                      onClick={() => setShowManageSeries(!showManageSeries)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                      title={showManageSeries ? 'Hide management' : 'Manage series'}
                    >
                      <Edit className="w-3 h-3" style={{ color: '#d681a3' }} />
                    </button>
                  </div>
                  
                  <select
                    value={formData.seriesName}
                    onChange={(e) => setFormData(prev => ({ ...prev, seriesName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': '#d681a3',
                      focusRingColor: '#d681a3'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d681a3'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="">Select a series</option>
                    {sortedSeries.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>

                  {/* Manage Series Section */}
                  {showManageSeries && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="text-sm font-medium text-gray-700 mb-2">Manage Series</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {sortedSeries.map(s => (
                          <div key={s.id} className="flex items-center justify-between py-1">
                            {editingSeriesId === s.id ? (
                              <div className="flex items-center space-x-2 flex-1">
                                <input
                                  type="text"
                                  value={editingSeriesName}
                                  onChange={(e) => setEditingSeriesName(e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      if (onEditSeries && editingSeriesName.trim()) {
                                        onEditSeries(s.id, s.name, editingSeriesName.trim());
                                        setEditingSeriesId(null);
                                        setEditingSeriesName('');
                                      }
                                    } else if (e.key === 'Escape') {
                                      setEditingSeriesId(null);
                                      setEditingSeriesName('');
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onEditSeries && editingSeriesName.trim()) {
                                      onEditSeries(s.id, s.name, editingSeriesName.trim());
                                      setEditingSeriesId(null);
                                      setEditingSeriesName('');
                                    }
                                  }}
                                  className="p-1 text-green-600 hover:text-green-800"
                                  title="Save"
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSeriesId(null);
                                    setEditingSeriesName('');
                                  }}
                                  className="p-1 text-gray-500 hover:text-gray-700"
                                  title="Cancel"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm text-gray-700">{s.name}</span>
                                <div className="flex space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSeriesId(s.id);
                                      setEditingSeriesName(s.name);
                                    }}
                                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                                    title="Edit series"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSeries(s.id, s.name)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                    title="Delete series"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!showAddSeries ? (
                    <button
                      type="button"
                      onClick={() => setShowAddSeries(true)}
                      className="flex items-center space-x-1 hover:text-green-700 text-sm"
                      style={{ color: '#d681a3' }}
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
                          '--tw-ring-color': '#d681a3',
                          focusRingColor: '#d681a3'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#d681a3'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                      <button
                        type="button"
                        onClick={handleAddSeries}
                        className="px-4 py-2 text-white rounded-lg transition-colors"
                        style={{ backgroundColor: '#d681a3' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c166a0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d681a3'}
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

            <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0dae3' }}>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Overall Rating:</span>
                <div className="flex items-center space-x-3">
                  <StarRating 
                    rating={convertToStarRating(calculateOverallRating(ratings))} 
                    size="md" 
                    showNumber={false}
                  />
                  <span className="text-lg font-bold" style={{ color: '#d681a3' }}>
                    {convertToStarRating(calculateOverallRating(ratings)).toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit and Delete Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
              style={{ backgroundColor: '#d681a3' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c166a0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d681a3'}
            >
              {book ? 'Update Book' : 'Add Book'}
            </button>
            
            {book && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                Delete
              </button>
            )}
            
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