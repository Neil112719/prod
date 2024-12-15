import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_ADDRESS, // Your backend API base URL
  withCredentials: true, // Ensures cookies are sent with requests
});

// Separate Axios instance for session verification
const sessionAxios = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_ADDRESS,
  withCredentials: true,
});

// Function to check session validity
const verifySession = async () => {
  try {
    const response = await sessionAxios.post('/verifySession.php', {});
    if (response.data.status !== 'success') {
      throw new Error('Session is invalid');
    }
  } catch (error) {
    // Redirect to login if verification fails
    console.error('Session verification failed:', error.message);
    window.location.href = '/login';
    throw error; // Stop further execution
  }
};

// Add a request interceptor to verify session before every request
axiosInstance.interceptors.request.use(
  async (config) => {
    await verifySession(); // Verify session
    return config; // Proceed with the original request
  },
  (error) => Promise.reject(error) // Handle errors in request configuration
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response, // Forward successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized responses
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error); // Forward the error for further handling
  }
);

export default axiosInstance;
