import { Book, Genre, Series, Author } from '../types/Book';

const GENRES_KEY = 'bookTracker_genres';
const SERIES_KEY = 'bookTracker_series';
const AUTHORS_KEY = 'bookTracker_authors';

export const defaultGenres: Genre[] = [
  { id: '1', name: 'Epic Fantasy', isCustom: false },
  { id: '2', name: 'High Fantasy', isCustom: false },
  { id: '3', name: 'Low Fantasy', isCustom: false },
  { id: '4', name: 'Romantasy', isCustom: false },
  { id: '5', name: 'Cosy Fantasy', isCustom: false },
  { id: '6', name: 'Grimdark Fantasy', isCustom: false },
  { id: '7', name: 'Urban Fantasy', isCustom: false },
  { id: '8', name: 'Fairytale Fantasy', isCustom: false },
  { id: '9', name: 'Dystopian Fiction', isCustom: false },
  { id: '10', name: 'Mythology Retelling', isCustom: false },
  { id: '11', name: 'Childrens Fiction', isCustom: false },
  { id: '12', name: 'YA Fiction', isCustom: false },
  { id: '13', name: 'Historical Fiction', isCustom: false },
  { id: '14', name: 'Sci-Fi', isCustom: false },
  { id: '15', name: 'Contemporary Fiction', isCustom: false },
  { id: '16', name: 'Romance', isCustom: false },
  { id: '17', name: 'Paranormal Fiction', isCustom: false },
  { id: '18', name: 'Gothic Fiction', isCustom: false },
  { id: '19', name: 'Horror', isCustom: false },
  { id: '20', name: 'Magical Realism', isCustom: false },
  { id: '21', name: 'Thriller/Mystery', isCustom: false },
  { id: '22', name: 'Non-Fiction', isCustom: false },
];

export const defaultAuthors: Author[] = [
  { id: '1', name: 'Sarah J. Maas' },
];

// GENRES (localStorage)
export const loadGenres = (): Genre[] => {
  try {
    const stored = localStorage.getItem(GENRES_KEY);
    return stored ? JSON.parse(stored) : defaultGenres;
  } catch {
    return defaultGenres;
  }
};

export const saveGenres = (genres: Genre[]): void => {
  localStorage.setItem(GENRES_KEY, JSON.stringify(genres));
};

// SERIES (localStorage)
export const loadSeries = (): Series[] => {
  try {
    const stored = localStorage.getItem(SERIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveSeries = (series: Series[]): void => {
  localStorage.setItem(SERIES_KEY, JSON.stringify(series));
};

// AUTHORS (localStorage)
export const loadAuthors = (): Author[] => {
  try {
    const stored = localStorage.getItem(AUTHORS_KEY);
    return stored ? JSON.parse(stored) : defaultAuthors;
  } catch {
    return defaultAuthors;
  }
};

export const saveAuthors = (authors: Author[]): void => {
  localStorage.setItem(AUTHORS_KEY, JSON.stringify(authors));
};

// FIXED: Calculate overall rating excluding N/A ratings
export const calculateOverallRating = (ratings: Book['ratings']): number => {
  // Filter out null values (N/A ratings)
  const validRatings = Object.values(ratings).filter((rating): rating is number => rating !== null);
  
  if (validRatings.length === 0) {
    return 0; // Return 0 if all ratings are N/A
  }
  
  const total = validRatings.reduce((sum, rating) => sum + rating, 0);
  const average = total / validRatings.length;
  
  return Math.round(average * 10) / 10; // Round to 1 decimal place
};

// FIXED: Convert 10-point scale to 5-star scale  
export const convertToStarRating = (rating: number): number => {
  return Math.round((rating / 10) * 5 * 10) / 10; // Convert 0-10 to 0-5 star scale, rounded to 1 decimal
};