import { createClient } from '@supabase/supabase-js';
import { Book } from './types/Book'; // adjust this path if needed

const SUPABASE_URL = 'https://armqjcqhlysyaujoeyss.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybXFqY3FobHlzeWF1am9leXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzUwMTAsImV4cCI6MjA2NzIxMTAxMH0.FuQnP6m5IqrI3CDprU_BcofI3LVM9fIzBeJ8nqPk6X4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch all books from Supabase
export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase.from('books').select('*').order('dateAdded', { ascending: false });
  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }
  return data as Book[];
}

// Add a new book to Supabase
export async function addBook(book: Book): Promise<void> {
  const { error } = await supabase.from('books').insert([book]);
  if (error) {
    console.error('Error adding book:', error);
    throw error;
  }
}

export async function updateBook(book: any) {
  const { data, error } = await supabase
    .from('books')
    .update(book)
    .eq('id', book.id);

  if (error) {
    console.error('Error updating book:', error);
    throw error;
  }

  return data;
}

export async function deleteBook(id: string) {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
}
