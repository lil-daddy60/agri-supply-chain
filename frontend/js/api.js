// // ===== API HELPER =====
// const API_URL = 'http://localhost:5000/api';

// async function apiRequest(endpoint, options = {}) {
//   const token = localStorage.getItem('token');
  
//   const config = {
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token && { 'Authorization': `Bearer ${token}` }),
//       ...options.headers
//     },
//     ...options
//   };

//   if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
//     config.body = JSON.stringify(config.body);
//   }

//   const response = await fetch(`${API_URL}${endpoint}`, config);
//   const data = await response.json();

//   if (response.status === 401) {
//     localStorage.removeItem('token');
//     window.location.href = 'index.html';
//     return null;
//   }

//   if (!response.ok) {
//     throw new Error(data.message || 'Request failed');
//   }

//   return data;
// }

// // GET request
// function get(endpoint) {
//   return apiRequest(endpoint, { method: 'GET' });
// }

// // POST request
// function post(endpoint, body) {
//   return apiRequest(endpoint, { method: 'POST', body });
// }

// // PUT request
// function put(endpoint, body) {
//   return apiRequest(endpoint, { method: 'PUT', body });
// }

// // DELETE request
// function del(endpoint) {
//   return apiRequest(endpoint, { method: 'DELETE' });
// }

// window.API = { get, post, put, delete: del };
const API_URL = 'https://agri-supply-api.onrender.com/api';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
      return null;
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

const API = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};