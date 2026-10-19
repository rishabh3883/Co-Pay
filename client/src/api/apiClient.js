const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // When running in production / cloud
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  // Prefer IPv4 127.0.0.1 on local dev to prevent Windows IPv6 ECONNREFUSED issues
  return 'http://127.0.0.1:5000/api';
};

export const API_BASE = getApiBase();

export const buildApiFetcher = (token, setIsBackendConnected) => {
  return async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    try {
      let response;
      try {
        response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      } catch (netErr) {
        // Fallback from 127.0.0.1 to localhost if needed
        if (API_BASE.includes('127.0.0.1')) {
          response = await fetch(`http://localhost:5000/api${endpoint}`, { ...options, headers });
        } else {
          throw netErr;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API request failed');
      }
      if (setIsBackendConnected) setIsBackendConnected(true);
      return await response.json();
    } catch (err) {
      console.warn('API error (using fallback storage if disconnected):', err.message);
      if (setIsBackendConnected) setIsBackendConnected(false);
      throw err;
    }
  };
};
