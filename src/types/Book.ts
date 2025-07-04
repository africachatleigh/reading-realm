export interface Book {
  id: string;
  title: string;
  author: string;
  completionMonth: number;
  completionYear: number;
  genres: string[]; // Changed from genre: string to genres: string[]
  coverImage?: string;
  ratings: {
    characters: number;
    worldBuilding: number;
    plot: number;
    writingStyle: number;
    enjoyment: number;
  };
  overallRating: number;
  dateAdded: string;
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