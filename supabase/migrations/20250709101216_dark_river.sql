/*
  # Fix column names to match application code

  1. Changes
    - Rename `dateAdded` to `dateadded` to match application expectations
    - Rename `completionMonth` to `completionmonth` 
    - Rename `completionYear` to `completionyear`
    - Rename `coverImage` to `coverimage`
    - Rename `overallRating` to `overallrating`
    - Rename `isStandalone` to `isstandalone`
    - Rename `seriesName` to `seriesname`
    - Rename `whichWitch` to `whichwitch`

  2. Notes
    - This ensures the database schema matches exactly what the application expects
    - All existing data will be preserved during the column renames
*/

-- Rename columns to match the application's expectations
DO $$
BEGIN
  -- Check if old column names exist and rename them
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'dateAdded'
  ) THEN
    ALTER TABLE books RENAME COLUMN "dateAdded" TO dateadded;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'completionMonth'
  ) THEN
    ALTER TABLE books RENAME COLUMN "completionMonth" TO completionmonth;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'completionYear'
  ) THEN
    ALTER TABLE books RENAME COLUMN "completionYear" TO completionyear;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'coverImage'
  ) THEN
    ALTER TABLE books RENAME COLUMN "coverImage" TO coverimage;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'overallRating'
  ) THEN
    ALTER TABLE books RENAME COLUMN "overallRating" TO overallrating;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'isStandalone'
  ) THEN
    ALTER TABLE books RENAME COLUMN "isStandalone" TO isstandalone;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'seriesName'
  ) THEN
    ALTER TABLE books RENAME COLUMN "seriesName" TO seriesname;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'whichWitch'
  ) THEN
    ALTER TABLE books RENAME COLUMN "whichWitch" TO whichwitch;
  END IF;
END $$;