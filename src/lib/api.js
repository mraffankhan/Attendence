const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const customFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  // Handle headers: Don't set Content-Type for FormData
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  // If it's NOT FormData, stringify the body
  if (options.body && !isFormData && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${baseURL}${endpoint}`, config);
  
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || 'API Error');
    error.response = { data };
    throw error;
  }

  return { data };
};

export default {
  get: (endpoint, options) => customFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => customFetch(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => customFetch(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => customFetch(endpoint, { ...options, method: 'DELETE' }),
};
