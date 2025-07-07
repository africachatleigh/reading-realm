import { createClient } from '@supabase/supabase-js';
import { Book } from './types/Book';

const SUPABASE_URL = 'https://armqjcqhlysyaujoeyss.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybXFqY3FobHlzeWF1am9leXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzUwMTAsImV4cCI6MjA2NzIxMTAxMH0.FuQnP6m5IqrI3CDprU_BcofI3LVM9fIzBeJ8nqPk6X4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test the connection
export async function testConnection(): Promise<boolean> {
  try {
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
    console.log('Fetching books from Supabase...');
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('dateAdded', { ascending: false });
    
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
    console.log('Adding book to Supabase:', book.title);
    
    // Ensure all required fields are present and properly formatted
    const bookToInsert = {
      id: book.id,
      title: book.title,
      author: book.author,
      completionMonth: book.completionMonth,
      completionYear: book.completionYear,
      genres: book.genres || [],
      coverImage: book.coverImage || null,
      ratings: book.ratings,
      overallRating: book.overallRating,
      dateAdded: book.dateAdded,
      isStandalone: book.isStandalone,
      seriesName: book.seriesName || null,
      whichWitch: book.whichWitch
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
    console.log('Updating book in Supabase:', book.title);
    
    // Ensure all fields are properly formatted for update
    const bookToUpdate = {
      title: book.title,
      author: book.author,
      completionMonth: book.completionMonth,
      completionYear: book.completionYear,
      genres: book.genres || [],
      coverImage: book.coverImage || null,
      ratings: book.ratings,
      overallRating: book.overallRating,
      dateAdded: book.dateAdded,
      isStandalone: book.isStandalone,
      seriesName: book.seriesName || null,
      whichWitch: book.whichWitch
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