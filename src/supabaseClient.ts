import { createClient } from '@supabase/supabase-js';
import { Book } from './types/Book';

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

// Fetch all books from Supabase
export async function fetchBooks(): Promise<Book[]> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }

    console.log('Fetching books from Supabase...');
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
      dateadded: book.dateadded,
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
      dateadded: book.dateadded,
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
    
    // Return the updated book with the final coverImage URL
    return {
      ...book,
      coverImage: coverImageUrl || ''
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