//import { Book, Genre, Series, Author } from '../types/Book';

const BOOKS_KEY = 'bookTracker_books';
const GENRES_KEY = 'bookTracker_genres';
const SERIES_KEY = 'bookTracker_series';
const AUTHORS_KEY = 'bookTracker_authors';

export const defaultGenres: Genre[] = [
  { id: '1', name: 'Epic Fantasy', isCustom: false },
  { id: '2', name: 'Romantasy', isCustom: false },
  { id: '3', name: 'Dystopian Fiction', isCustom: false },
  { id: '4', name: 'Historical Fiction', isCustom: false },
  { id: '5', name: 'Science Fiction', isCustom: false },
  { id: '6', name: 'Mystery/Thriller', isCustom: false },
  { id: '7', name: 'Contemporary Fiction', isCustom: false },
  { id: '8', name: 'Young Adult', isCustom: false },
  { id: '9', name: 'Non-Fiction', isCustom: false },
  { id: '10', name: 'Biography/Memoir', isCustom: false },
];

export const defaultAuthors: Author[] = [
  { id: '1', name: 'Sarah J. Maas' },
  { id: '2', name: 'Brandon Sanderson' },
  { id: '3', name: 'Rebecca Yarros' },
  { id: '4', name: 'Colleen Hoover' },
  { id: '5', name: 'J.K. Rowling' },
];

//import { fetchBooks, addBook } from './supabaseclient'; // adjust path as needed
//import { Book } from './types/Book'; // adjust path if needed

export const loadBooks = async (): Promise<Book[]> => {
  try {
    const books = await fetchBooks();
    return books || [];
  } catch (error) {
    console.error('Failed to load books:', error);
    return [];
  }
};

export const saveBook = async (book: Book): Promise<void> => {
  try {
    await addBook(book);
  } catch (error) {
    console.error('Failed to save book:', error);
  }
};

// GENRES (still localStorage)
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

// SERIES (still localStorage)
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

// AUTHORS (still localStorage)
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


export const calculateOverallRating = (ratings: Book['ratings']): number => {
  const total = ratings.characters + ratings.worldBuilding + ratings.plot + 
                ratings.writingStyle + ratings.enjoyment;
  return Math.round((total / 5) * 10) / 10; // Average out of 10, rounded to 1 decimal
};

export const convertToStarRating = (rating: number): number => {
  return Math.round((rating / 2) * 10) / 10; // Convert 0-10 to 0-5 star scale
};