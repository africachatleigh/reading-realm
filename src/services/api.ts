// API service for connecting to backend functions

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const testConnection = async () => {
  const response = await fetch('/.netlify/functions/hello');
  const data = await response.json();
  return data;
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
      const response = await fetch('/.netlify/functions/books');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
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
      const response = await fetch('/.netlify/functions/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(book)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
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