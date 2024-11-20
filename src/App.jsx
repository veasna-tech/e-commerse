import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { setDarkMode } from './store/slices/themeSlice';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';
import Cart from './components/cart/Cart';
import Checkout from './components/cart/Checkout';
import Categories from './pages/Categories';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import OrderConfirmation from './components/orders/OrderConfirmation';
import OrderList from './components/orders/OrderList';
import Profile from './components/profile/Profile';
import ForgotPassword from './components/auth/ForgotPassword';

function App() {
  const { darkMode } = useSelector(state => state.theme);
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize dark mode
    const savedMode = localStorage.getItem('darkMode');
    const initialDarkMode = savedMode === null ? true : savedMode === 'true';
    dispatch(setDarkMode(initialDarkMode));
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <Router>
      <ErrorBoundary>
        <ToastContainer
          theme={darkMode ? 'dark' : 'light'}
          position="top-right"
          autoClose={3000}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="categories" element={<Categories />} />
            <Route 
              path="cart" 
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-confirmation" 
              element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrderList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
