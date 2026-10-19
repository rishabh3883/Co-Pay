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
          try {
            response = await fetch(`http://localhost:5000/api${endpoint}`, { ...options, headers });
          } catch (localErr) {
            if (setIsBackendConnected) setIsBackendConnected(false);
            throw localErr;
          }
        } else {
          if (setIsBackendConnected) setIsBackendConnected(false);
          throw netErr;
        }
      }

      // Any HTTP response means the backend is reachable and alive
      if (setIsBackendConnected) setIsBackendConnected(true);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error (${response.status})`);
      }
      return await response.json();
    } catch (err) {
      console.warn('API error:', err.message);
      throw err;
    }
  };
};
