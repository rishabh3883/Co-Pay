export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const buildApiFetcher = (token, setIsBackendConnected) => {
    return async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }
      setIsBackendConnected(true);
      return await response.json();
    } catch (err) {
      console.warn('API error (using fallback storage if disconnected):', err.message);
      if (err.message.includes('Failed to fetch')) {
        setIsBackendConnected(false);
      }
      throw err;
    }
  };
};
