const NETLIFY_BASE_URL = 'https://chaskitbooks.netlify.app';

// API service for connecting to backend functions

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const testConnection = async () => {
  try {
    const response = await fetch('/.netlify/functions/hello');

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const text = await response.text();

    if (!text) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error('API connection error:', error);
    throw error;
  }
};


export const api = {
  // Test connection to hello function
  async testConnection(): Promise<ApiResponse<{ message: string }>> {
    try {
      const data = await testConnection();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('API connection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Future endpoints can be added here
  async getBooks(): Promise<ApiResponse<any[]>> {
    try {
      // This would connect to a books endpoint when available
      const response = await fetch(`${NETLIFY_BASE_URL}/.netlify/functions/books`);

      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
const data = text ? JSON.parse(text) : [];
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get books error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch books'
      };
    }
  },

  async saveBook(book: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${NETLIFY_BASE_URL}/.netlify/functions/books`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(book),
});

      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
     const text = await response.text();
const data = text ? JSON.parse(text) : [];

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Save book error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save book'
      };
    }
  }
};