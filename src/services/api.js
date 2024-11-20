import axios from 'axios';
import { auth } from './firebase';
import { firebaseAuth } from './firebase';

const api = axios.create({
  baseURL: 'https://dummyjson.com'
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products API
export const productsAPI = {
  getAll: ({ limit = 12, skip = 0 }) => 
    api.get(`/products?limit=${limit}&skip=${skip}`),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  search: (query) => api.get(`/products/search?q=${query}`),
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const userData = await firebaseAuth.login(credentials);
      return { data: userData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const user = await firebaseAuth.register(userData);
      return { data: user };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  forgotPassword: async (email) => {
    try {
      await firebaseAuth.forgotPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
};

export default api; 