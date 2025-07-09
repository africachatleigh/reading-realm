export interface Book {
  id: string;
  title: string;
  author: string;
  completionMonth: number;
  completionYear: number;
  genres: string[]; // Changed from genre: string to genres: string[]
  coverImage?: string;
  ratings: {
    characters: number | null; // Updated to support N/A
    worldBuilding: number | null; // Updated to support N/A
    plot: number | null; // Updated to support N/A
    writingStyle: number | null; // Updated to support N/A
    enjoyment: number | null; // Updated to support N/A
  };
  overallRating: number;
  dateadded: string; // Changed from dateAdded to match database column
  isStandalone: boolean;
  seriesName?: string;
  whichWitch?: string; // New field for Which Witch selection
}

export interface Genre {
  id: string;
  name: string;
  isCustom: boolean;
}

export interface Series {
  id: string;
  name: string;
}

export interface Author {
  id: string;
  name: string;
}