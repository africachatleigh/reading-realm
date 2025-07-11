import { createClient } from '@supabase/supabase-js';
import { Book, Genre, Series, Author } from './types/Book';

// Environment variables for Vercel deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables
console.log('Supabase Configuration:', {
  url: supabaseUrl || 'MISSING',
  hasKey: !!supabaseAnonKey,
  environment: import.meta.env.MODE
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Pagination interface
export interface PaginatedBooksResult {
  books: Book[];
  totalCount: number;
  hasMore: boolean;
}

// Filter and sort interface
export interface BookFilters {
  searchTerm?: string;
  genreFilter?: string;
  yearFilter?: string;
  whichWitchFilter?: string;
  sortField?: 'title' | 'author' | 'date' | 'rating' | 'genre';
  sortDirection?: 'asc' | 'desc';
}

// Test the connection
export async function testConnection(): Promise<boolean> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase not configured. Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        url: supabaseUrl ? 'Present' : 'Missing',
        key: supabaseAnonKey ? 'Present' : 'Missing'
      });
      return false;
    }
    
    const { data, error } = await supabase.from('books').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    console.log('Supabase connection successful. Table accessible.');
    return true;
  } catch (error) {
    console.error('Supabase connection error (catch block):', error);
    return false;
  }
}

// Helper function to convert base64 to File object
function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// Helper function to generate unique filename
function generateImageFilename(bookId: string, originalName?: string): string {
  const timestamp = Date.now();
  const extension = originalName?.split('.').pop() || 'jpg';
  return `book-covers/${bookId}-${timestamp}.${extension}`;
}

// Upload image to Supabase Storage
export async function uploadBookCover(bookId: string, imageFile: File | string): Promise<string> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    let fileToUpload: File;
    let filename: string;

    if (typeof imageFile === 'string') {
      // Handle base64 string
      filename = generateImageFilename(bookId);
      fileToUpload = base64ToFile(imageFile, filename);
    } else {
      // Handle File object
      filename = generateImageFilename(bookId, imageFile.name);
      fileToUpload = imageFile;
    }

    console.log('Uploading image to Supabase Storage:', filename);

    const { data, error } = await supabase.storage
      .from('book-covers')
      .upload(filename, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('book-covers')
      .getPublicUrl(filename);

    console.log('Successfully uploaded image:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
}

// Delete image from Supabase Storage
export async function deleteBookCover(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl || !imageUrl.includes('book-covers/')) {
      return; // Not a storage URL, skip deletion
    }

    const filename = imageUrl.split('book-covers/')[1];
    if (!filename) return;

    console.log('Deleting image from Supabase Storage:', filename);

    const { error } = await supabase.storage
      .from('book-covers')
      .remove([`book-covers/${filename}`]);

    if (error) {
      console.error('Error deleting image:', error);
      // Don't throw here - image deletion failure shouldn't stop book operations
    }
  } catch (error) {
    console.error('Failed to delete image:', error);
    // Don't throw here - image deletion failure shouldn't stop book operations
  }
}

// NEW: Fetch books with pagination and filters
export async function fetchBooksWithPagination(
  page: number = 0,
  limit: number = 20,
  filters: BookFilters = {}
): Promise<PaginatedBooksResult> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, returning empty result');
      return { books: [], totalCount: 0, hasMore: false };
    }

    console.log('Fetching books with pagination:', { page, limit, filters });

    // Build the query
    let query = supabase.from('books').select('*', { count: 'exact' });

    // Apply filters
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,seriesname.ilike.%${searchTerm}%`);
    }

    if (filters.genreFilter) {
      query = query.contains('genres', [filters.genreFilter]);
    }

    if (filters.yearFilter) {
      query = query.eq('completionyear', parseInt(filters.yearFilter));
    }

    if (filters.whichWitchFilter) {
      query = query.eq('whichwitch', filters.whichWitchFilter);
    }

    // Apply sorting
    const sortField = filters.sortField || 'date';
    const sortDirection = filters.sortDirection || 'desc';
    const ascending = sortDirection === 'asc';

    switch (sortField) {
      case 'title':
        query = query.order('title', { ascending });
        break;
      case 'author':
        query = query.order('author', { ascending });
        break;
      case 'date':
        // Sort by completion date first, then by date added (most recent first within each month)
        query = query.order('completionyear', { ascending })
                     .order('completionmonth', { ascending })
                     .order('dateadded', { ascending: false }); // Most recent additions first within each month
        break;
      case 'rating':
        query = query.order('overallrating', { ascending });
        break;
      case 'genre':
        // For genre sorting, we'll need to handle it client-side since it's an array
        query = query.order('title', { ascending }); // Fallback sort
        break;
      default:
        query = query.order('dateadded', { ascending: false }); // Default to newest first
    }

    // Apply pagination
    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching books:', error);
      throw error;
    }

    console.log('Successfully fetched paginated books:', {
      page,
      limit,
      count: data?.length || 0,
      totalCount: count || 0
    });

    // Map database column names to expected property names
    const mappedBooks = data?.map(book => ({
      ...book,
      completionMonth: book.completionmonth,
      completionYear: book.completionyear,
      coverImage: book.coverimage,
      isStandalone: book.isstandalone,
      seriesName: book.seriesname,
      whichWitch: book.whichwitch,
      overallRating: book.overallrating,
      dateAdded: book.dateadded
    })) || [];

    const totalCount = count || 0;
    const hasMore = from + (data?.length || 0) < totalCount;

    return {
      books: mappedBooks as Book[],
      totalCount,
      hasMore
    };
  } catch (error) {
    console.error('Failed to fetch books with pagination:', error);
    throw error;
  }
}

// Get all unique years from books for filter dropdown
export async function fetchAllYears(): Promise<number[]> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }

    console.log('Fetching all available years from Supabase...');
    const { data, error } = await supabase
      .from('books')
      .select('completionyear')
      .order('completionyear', { ascending: false });
    
    if (error) {
      console.error('Error fetching years:', error);
      throw error;
    }
    
    // Get unique years and sort them
    const years = Array.from(new Set(data?.map(book => book.completionyear) || [])).sort((a, b) => b - a);
    
    console.log('Successfully fetched years:', years);
    return years;
  } catch (error) {
    console.error('Failed to fetch years:', error);
    throw error;
  }
}

// Get count of books for current year
export async function fetchCurrentYearCount(): Promise<number> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, returning 0');
      return 0;
    }

    const currentYear = new Date().getFullYear();
    console.log('Fetching current year count from Supabase for year:', currentYear);
    
    const { count, error } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('completionyear', currentYear);
    
    if (error) {
      console.error('Error fetching current year count:', error);
      throw error;
    }
    
    console.log('Successfully fetched current year count:', count || 0);
    return count || 0;
  } catch (error) {
    console.error('Failed to fetch current year count:', error);
    throw error;
  }
}
export async function fetchBooks(): Promise<Book[]> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }

    console.log('Fetching all books from Supabase...');
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('dateadded', { ascending: false });
    
    if (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
    
    console.log('Successfully fetched books:', data?.length || 0);
    
    // Map database column names to expected property names
    const mappedBooks = data?.map(book => ({
      ...book,
      completionMonth: book.completionmonth,
      completionYear: book.completionyear,
      coverImage: book.coverimage,
      isStandalone: book.isstandalone,
      seriesName: book.seriesname,
      whichWitch: book.whichwitch,
      overallRating: book.overallrating,
      dateAdded: book.dateadded
    })) || [];
    
    return mappedBooks as Book[];
  } catch (error) {
    console.error('Failed to fetch books:', error);
    throw error;
  }
}

// Add a new book to Supabase
export async function addBook(book: Book): Promise<void> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Adding book to Supabase:', book.title);
    
    let coverImageUrl = null;
    
    // Handle image upload if present
    if (book.coverImage) {
      try {
        if (book.coverImage.startsWith('data:')) {
          // Base64 image - upload to storage
          coverImageUrl = await uploadBookCover(book.id, book.coverImage);
        } else {
          // Already a URL - use as is
          coverImageUrl = book.coverImage;
        }
      } catch (imageError) {
        console.error('Failed to upload cover image:', imageError);
        // Continue without image rather than failing entirely
      }
    }
    
    // Ensure all required fields are present and properly formatted
    const bookToInsert = {
      id: book.id,
      title: book.title,
      author: book.author,
      completionmonth: book.completionMonth,
      completionyear: book.completionYear,
      genres: book.genres || [],
      coverimage: coverImageUrl,
      ratings: book.ratings,
      overallrating: book.overallRating,
      dateadded: book.dateAdded,
      isstandalone: book.isStandalone,
      seriesname: book.seriesName || null,
      whichwitch: book.whichWitch || null
    };

    console.log('Book data being inserted:', bookToInsert);
    
    const { error } = await supabase
      .from('books')
      .insert([bookToInsert]);
    
    if (error) {
      // If book insert fails, clean up uploaded image
      if (coverImageUrl) {
        await deleteBookCover(coverImageUrl);
      }
      console.error('Error adding book:', error);
      throw error;
    }
    
    console.log('Successfully added book:', book.title);
  } catch (error) {
    console.error('Failed to add book:', error);
    throw error;
  }
}

// Update an existing book in Supabase
export async function updateBook(book: Book): Promise<Book> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Updating book in Supabase:', book.title);
    
    // Get the current book data to preserve existing coverimage
    const { data: currentBook, error: fetchError } = await supabase
      .from('books')
      .select('coverimage')
      .eq('id', book.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current book data:', fetchError);
      throw fetchError;
    }
    
    let coverImageUrl = currentBook.coverimage;
    
    // Handle image update if a new image is provided
    if (book.coverImage && book.coverImage.startsWith('data:')) {
      try {
        // Delete old image if it exists
        if (currentBook.coverimage) {
          await deleteBookCover(currentBook.coverimage);
        }
        
        // Upload new image
        coverImageUrl = await uploadBookCover(book.id, book.coverImage);
      } catch (imageError) {
        console.error('Failed to update cover image:', imageError);
        // Keep existing image if upload fails
        coverImageUrl = currentBook.coverimage;
      }
    } else if (book.coverImage === '') {
      // Empty string means remove image
      if (currentBook.coverimage) {
        await deleteBookCover(currentBook.coverimage);
      }
      coverImageUrl = null;
    } else if (book.coverImage && !book.coverImage.startsWith('data:')) {
      // Already a URL - use as is
      coverImageUrl = book.coverImage;
    }
    // If book.coverImage is undefined, keep existing image (coverImageUrl already set)
    
    // Ensure all fields are properly formatted for update
    const bookToUpdate = {
      title: book.title,
      author: book.author,
      completionmonth: book.completionMonth,
      completionyear: book.completionYear,
      genres: book.genres || [],
      coverimage: coverImageUrl,
      ratings: book.ratings,
      overallrating: book.overallRating,
      dateadded: book.dateAdded,
      isstandalone: book.isStandalone,
      seriesname: book.seriesName || null,
      whichwitch: book.whichWitch || null
    };

    console.log('Book data being updated:', bookToUpdate);

    const { error } = await supabase
      .from('books')
      .update(bookToUpdate)
      .eq('id', book.id);

    if (error) {
      console.error('Error updating book:', error);
      throw error;
    }
    
    console.log('Successfully updated book:', book.title);
    
    // Return the updated book with the final coverImage URL and proper property mapping
    return {
      ...book,
      coverImage: coverImageUrl || '',
      completionMonth: book.completionMonth,
      completionYear: book.completionYear,
      isStandalone: book.isStandalone,
      seriesName: book.seriesName,
      whichWitch: book.whichWitch,
      overallRating: book.overallRating,
      dateAdded: book.dateAdded
    };
  } catch (error) {
    console.error('Failed to update book:', error);
    throw error;
  }
}

// Delete a book from Supabase
export async function deleteBook(id: string): Promise<void> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Deleting book from Supabase:', id);
    
    // Get the book data to clean up associated image
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select('coverimage')
      .eq('id', id)
      .single();
    
    if (!fetchError && book?.coverimage) {
      await deleteBookCover(book.coverimage);
    }
    
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
    
    console.log('Successfully deleted book:', id);
  } catch (error) {
    console.error('Failed to delete book:', error);
    throw error;
  }
}

// ==================== GENRES ====================

// Fetch all genres from Supabase
export async function fetchGenres(): Promise<Genre[]> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }

    console.log('Fetching genres from Supabase...');
    const { data, error } = await supabase
      .from('genres')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
    
    console.log('Successfully fetched genres:', data?.length || 0);
    
    // Map database column names to expected property names
    const mappedGenres = data?.map(genre => ({
      id: genre.id,
      name: genre.name,
      isCustom: genre.is_custom
    })) || [];
    
    return mappedGenres as Genre[];
  } catch (error) {
    console.error('Failed to fetch genres:', error);
    throw error;
  }
}

// Add a new genre to Supabase
export async function addGenre(name: string): Promise<Genre> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Adding genre to Supabase:', name);
    
    const { data, error } = await supabase
      .from('genres')
      .insert([{ name, is_custom: true }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding genre:', error);
      throw error;
    }
    
    console.log('Successfully added genre:', data.name);
    
    return {
      id: data.id,
      name: data.name,
      isCustom: data.is_custom
    };
  } catch (error) {
    console.error('Failed to add genre:', error);
    throw error;
  }
}

// Edit a genre name and update all books that use it
export async function editGenre(id: string, oldName: string, newName: string): Promise<Genre> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Editing genre:', oldName, 'to', newName);
    
    // First update the genre name in the genres table
    const { data: genreData, error: genreError } = await supabase
      .from('genres')
      .update({ name: newName })
      .eq('id', id)
      .select()
      .single();
    
    if (genreError) {
      console.error('Error updating genre:', genreError);
      throw genreError;
    }

    // Then update all books that have this genre in their genres array
    const { data: booksWithGenre, error: fetchError } = await supabase
      .from('books')
      .select('id, genres')
      .contains('genres', [oldName]);

    if (fetchError) {
      console.error('Error fetching books with genre:', fetchError);
      throw fetchError;
    }

    // Update each book's genres array
    for (const book of booksWithGenre || []) {
      const updatedGenres = book.genres.map((genre: string) => 
        genre === oldName ? newName : genre
      );
      
      const { error: updateError } = await supabase
        .from('books')
        .update({ genres: updatedGenres })
        .eq('id', book.id);

      if (updateError) {
        console.error('Error updating book genres:', updateError);
        // Continue with other books even if one fails
      }
    }
    
    console.log('Successfully updated genre and all associated books');
    
    return {
      id: genreData.id,
      name: genreData.name,
      isCustom: genreData.is_custom
    };
  } catch (error) {
    console.error('Failed to edit genre:', error);
    throw error;
  }
}

// Delete a genre from Supabase
export async function deleteGenre(id: string): Promise<void> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Deleting genre from Supabase:', id);
    
    const { error } = await supabase
      .from('genres')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting genre:', error);
      throw error;
    }
    
    console.log('Successfully deleted genre:', id);
  } catch (error) {
    console.error('Failed to delete genre:', error);
    throw error;
  }
}

// ==================== SERIES ====================

// Fetch all series from Supabase
export async function fetchSeries(): Promise<Series[]> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }

    console.log('Fetching series from Supabase...');
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching series:', error);
      throw error;
    }
    
    console.log('Successfully fetched series:', data?.length || 0);
    
    return data?.map(series => ({
      id: series.id,
      name: series.name
    })) || [];
  } catch (error) {
    console.error('Failed to fetch series:', error);
    throw error;
  }
}

// Add a new series to Supabase
export async function addSeries(name: string): Promise<Series> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Adding series to Supabase:', name);
    
    const { data, error } = await supabase
      .from('series')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding series:', error);
      throw error;
    }
    
    console.log('Successfully added series:', data.name);
    
    return {
      id: data.id,
      name: data.name
    };
  } catch (error) {
    console.error('Failed to add series:', error);
    throw error;
  }
}

// Edit a series name and update all books that use it
export async function editSeries(id: string, oldName: string, newName: string): Promise<Series> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Editing series:', oldName, 'to', newName);
    
    // First update the series name in the series table
    const { data: seriesData, error: seriesError } = await supabase
      .from('series')
      .update({ name: newName })
      .eq('id', id)
      .select()
      .single();
    
    if (seriesError) {
      console.error('Error updating series:', seriesError);
      throw seriesError;
    }

    // Then update all books that have this series name
    const { error: updateBooksError } = await supabase
      .from('books')
      .update({ seriesname: newName })
      .eq('seriesname', oldName);

    if (updateBooksError) {
      console.error('Error updating books with series:', updateBooksError);
      throw updateBooksError;
    }
    
    console.log('Successfully updated series and all associated books');
    
    return {
      id: seriesData.id,
      name: seriesData.name
    };
  } catch (error) {
    console.error('Failed to edit series:', error);
    throw error;
  }
}

// Delete a series from Supabase
export async function deleteSeries(id: string): Promise<void> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Deleting series from Supabase:', id);
    
    const { error } = await supabase
      .from('series')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting series:', error);
      throw error;
    }
    
    console.log('Successfully deleted series:', id);
  } catch (error) {
    console.error('Failed to delete series:', error);
    throw error;
  }
}

// ==================== AUTHORS ====================

// Fetch all authors from Supabase
export async function fetchAuthors(): Promise<Author[]> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }

    console.log('Fetching authors from Supabase...');
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching authors:', error);
      throw error;
    }
    
    console.log('Successfully fetched authors:', data?.length || 0);
    
    return data?.map(author => ({
      id: author.id,
      name: author.name
    })) || [];
  } catch (error) {
    console.error('Failed to fetch authors:', error);
    throw error;
  }
}

// Add a new author to Supabase
export async function addAuthor(name: string): Promise<Author> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Adding author to Supabase:', name);
    
    const { data, error } = await supabase
      .from('authors')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding author:', error);
      throw error;
    }
    
    console.log('Successfully added author:', data.name);
    
    return {
      id: data.id,
      name: data.name
    };
  } catch (error) {
    console.error('Failed to add author:', error);
    throw error;
  }
}

// Edit an author name and update all books that use it
export async function editAuthor(id: string, oldName: string, newName: string): Promise<Author> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Editing author:', oldName, 'to', newName);
    
    // First update the author name in the authors table
    const { data: authorData, error: authorError } = await supabase
      .from('authors')
      .update({ name: newName })
      .eq('id', id)
      .select()
      .single();
    
    if (authorError) {
      console.error('Error updating author:', authorError);
      throw authorError;
    }

    // Then update all books that have this author name
    const { error: updateBooksError } = await supabase
      .from('books')
      .update({ author: newName })
      .eq('author', oldName);

    if (updateBooksError) {
      console.error('Error updating books with author:', updateBooksError);
      throw updateBooksError;
    }
    
    console.log('Successfully updated author and all associated books');
    
    return {
      id: authorData.id,
      name: authorData.name
    };
  } catch (error) {
    console.error('Failed to edit author:', error);
    throw error;
  }
}

// Delete an author from Supabase
export async function deleteAuthor(id: string): Promise<void> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    console.log('Deleting author from Supabase:', id);
    
    const { error } = await supabase
      .from('authors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting author:', error);
      throw error;
    }
    
    console.log('Successfully deleted author:', id);
  } catch (error) {
    console.error('Failed to delete author:', error);
    throw error;
  }
}