/*
  # Create books table for Reading Realm application

  1. New Tables
    - `books`
      - `id` (text, primary key) - Unique identifier for each book
      - `title` (text, required) - Book title
      - `author` (text, required) - Book author
      - `completionMonth` (integer, required) - Month when book was completed (1-12)
      - `completionYear` (integer, required) - Year when book was completed
      - `genres` (text array, default empty) - Array of genre strings
      - `coverImage` (text, optional) - URL to book cover image
      - `ratings` (jsonb, required) - JSON object containing rating categories
      - `overallRating` (real, required) - Calculated overall rating
      - `dateAdded` (text, required) - ISO timestamp when book was added
      - `isStandalone` (boolean, required) - Whether book is standalone or part of series
      - `seriesName` (text, optional) - Name of series if not standalone
      - `whichWitch` (text, optional) - Which Witch selection field

  2. Security
    - Enable RLS on `books` table
    - Add policy for public read access (since no authentication is implemented)
    - Add policy for public write access (since no authentication is implemented)

  3. Notes
    - Uses text arrays for genres to support multiple genre selection
    - Uses JSONB for ratings to store structured rating data
    - Includes all fields from the TypeScript Book interface
*/

CREATE TABLE IF NOT EXISTS books (
  id text PRIMARY KEY,
  title text NOT NULL,
  author text NOT NULL,
  completionMonth integer NOT NULL,
  completionYear integer NOT NULL,
  genres text[] NOT NULL DEFAULT '{}',
  coverImage text,
  ratings jsonb NOT NULL,
  overallRating real NOT NULL,
  dateAdded text NOT NULL,
  isStandalone boolean NOT NULL,
  seriesName text,
  whichWitch text
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication is implemented)
-- Allow anyone to read books
CREATE POLICY "Allow public read access to books"
  ON books
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert books
CREATE POLICY "Allow public insert access to books"
  ON books
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to update books
CREATE POLICY "Allow public update access to books"
  ON books
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete books
CREATE POLICY "Allow public delete access to books"
  ON books
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_books_completion_year ON books(completionYear);
CREATE INDEX IF NOT EXISTS idx_books_date_added ON books(dateAdded);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_genres ON books USING GIN(genres);