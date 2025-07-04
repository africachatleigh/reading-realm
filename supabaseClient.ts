import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://armqjcqhlysyaujoeyss.supabase.co';  // replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybXFqY3FobHlzeWF1am9leXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzUwMTAsImV4cCI6MjA2NzIxMTAxMH0.FuQnP6m5IqrI3CDprU_BcofI3LVM9fIzBeJ8nqPk6X4';                   // replace with your anon public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://armqjcqhlysyaujoeyss.supabase.co';  // your Supabase URL
const SUPABASE_ANON_KEY = 'your-anon-key-here';                   // your anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch all books from Supabase
export async function fetchBooks() {
  const { data, error } = await supabase.from('books').select('*');
  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }
  return data;
}

// Add a new book to Supabase
export async function addBook(book: any) {
  const { data, error } = await supabase.from('books').insert([book]);
  if (error) {
    console.error('Error adding book:', error);
    throw error;
  }
  return data;
}
