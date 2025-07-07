import { createClient } from '@supabase/supabase-js';
import { Book } from './types/Book';

// These environment variables will be automatically set when you connect Supabase in Bolt.new
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please connect Supabase in Bolt.new');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Test the connection
export async function testConnection(): Promise<boolean> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase not configured. Please connect Supabase in Bolt.new');
      return false;
    }
    
    const { data, error } = await supabase.from('books').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
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
    return data as Book[] || [];
  } catch (error) {
    console.error('Failed to fetch books:', error);
    throw error;
  }
}

// Add a new book to Supabase
export async function addBook(book: Book): Promise<void> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please connect Supabase in Bolt.new');
    }

    console.log('Adding book to Supabase:', book.title);
    
    // Ensure all required fields are present and properly formatted
    const bookToInsert = {
      id: book.id,
      title: book.title,
      author: book.author,
      completionmonth: book.completionMonth,
      completionyear: book.completionYear,
      genres: book.genres || [],
      coverimage: book.coverImage || null,
      ratings: book.ratings,
      overallrating: book.overallRating,
      dateadded: book.dateadded,
      isstandalone: book.isStandalone,
      seriesname: book.seriesName || null,
      whichwitch: book.whichWitch
    };

    console.log('Book data being inserted:', bookToInsert);
    
    const { error } = await supabase
      .from('books')
      .insert([bookToInsert]);
    
    if (error) {
      console.error('Error adding book:', error);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error message:', error.message);
      throw error;
    }
    
    console.log('Successfully added book:', book.title);
  } catch (error) {
    console.error('Failed to add book:', error);
    throw error;
  }
}

// Update an existing book in Supabase
export async function updateBook(book: Book): Promise<void> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please connect Supabase in Bolt.new');
    }

    console.log('Updating book in Supabase:', book.title);
    
    // Ensure all fields are properly formatted for update
    const bookToUpdate = {
      title: book.title,
      author: book.author,
      completionmonth: book.completionMonth,
      completionyear: book.completionYear,
      genres: book.genres || [],
      coverimage: book.coverImage || null,
      ratings: book.ratings,
      overallrating: book.overallRating,
      dateadded: book.dateadded,
      isstandalone: book.isStandalone,
      seriesname: book.seriesName || null,
      whichwitch: book.whichWitch
    };

    const { error } = await supabase
      .from('books')
      .update(bookToUpdate)
      .eq('id', book.id);

    if (error) {
      console.error('Error updating book:', error);
      throw error;
    }
    
    console.log('Successfully updated book:', book.title);
  } catch (error) {
    console.error('Failed to update book:', error);
    throw error;
  }
}

// Delete a book from Supabase
export async function deleteBook(id: string): Promise<void> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please connect Supabase in Bolt.new');
    }

    console.log('Deleting book from Supabase:', id);
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