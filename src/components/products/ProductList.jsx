import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';
import { productsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaShoppingCart, FaEye } from 'react-icons/fa';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  const dispatch = useDispatch();

  // Get category from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories and products in parallel
        const [categoriesRes, productsRes] = await Promise.all([
          productsAPI.getCategories(),
          selectedCategory !== 'All Categories'
            ? productsAPI.getByCategory(selectedCategory)
            : productsAPI.getAll({ 
                limit: productsPerPage, 
                skip: (currentPage - 1) * productsPerPage 
              })
        ]);

        // Process categories
        const categoryList = categoriesRes.data || [];
        const processedCategories = ['All Categories', ...categoryList.map(cat => 
          typeof cat === 'object' ? cat.name || cat.slug || String(cat) : String(cat)
        )];
        setCategories(processedCategories);

        // Process products
        setProducts(productsRes.data.products || []);
        setTotalProducts(productsRes.data.total || 0);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentPage, selectedCategory]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      fetchInitialData();
      return;
    }
    
    try {
      setLoading(true);
      const response = await productsAPI.search(searchQuery);
      setProducts(response.data.products || []);
      setTotalProducts(response.data.total || 0);
      setCurrentPage(1);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleCategoryChange = useCallback(async (category) => {
    try {
      setLoading(true);
      setSelectedCategory(category);
      
      let response;
      if (category === 'All Categories') {
        response = await productsAPI.getAll({ 
          limit: productsPerPage, 
          skip: 0 
        });
      } else {
        response = await productsAPI.getByCategory(category);
      }
      
      setProducts(response.data.products || []);
      setTotalProducts(response.data.total || 0);
      setCurrentPage(1);

      // Update URL
      const url = new URL(window.location);
      if (category === 'All Categories') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', category);
      }
      window.history.pushState({}, '', url);
    } catch (error) {
      console.error('Category filter error:', error);
      toast.error('Failed to filter products');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addItem(product));
    toast.success('Added to cart!');
  };

  // Memoize the page range calculation
  const getPageRange = useCallback(() => {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const current = currentPage;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);
    if (totalPages <= 1) return range;

    for (let i = current - delta; i <= current + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    range.push(totalPages);

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }, [currentPage, totalProducts, productsPerPage]);

  return (
    <div className="container py-4">
      {/* Search and Filter Section */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleSearch}
              disabled={loading}
            >
              <FaSearch className="me-1" /> Search
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex gap-2">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={loading}
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleCategoryChange('All Categories')}
              disabled={loading}
              title="Reset all filters"
            >
              <FaFilter /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCategory !== 'All Categories' || searchQuery) && (
        <div className="mb-3">
          <div className="d-flex gap-2 align-items-center">
            <small className="text-muted">Active Filters:</small>
            {selectedCategory !== 'All Categories' && (
              <span className="badge bg-primary">
                Category: {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="badge bg-primary">
                Search: {searchQuery}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="alert alert-info">
          No products found. Try different filters or search terms.
        </div>
      ) : (
        <div className="row g-4">
          {products.map(product => (
            <div key={product.id} className="col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="position-relative">
                  <img 
                    src={product.thumbnail} 
                    alt={product.title}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  {product.discountPercentage > 0 && (
                    <span className="position-absolute top-0 start-0 badge bg-danger m-2">
                      -{Math.round(product.discountPercentage)}%
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-1">{product.title}</h5>
                  <p className="card-text text-muted small mb-2">{product.brand}</p>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <span className="h5 text-primary mb-0">${product.price}</span>
                      {product.discountPercentage > 0 && (
                        <small className="text-muted text-decoration-line-through ms-2">
                          ${Math.round(product.price * (1 + product.discountPercentage/100))}
                        </small>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <Link 
                        to={`/products/${product.id}`}
                        className="btn btn-outline-primary btn-sm"
                        title="View Details"
                      >
                        <FaEye />
                      </Link>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAddToCart(product)}
                        title="Add to Cart"
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">Stock: {product.stock}</small>
                    <div className="rating">
                      <span className="text-warning">★</span>
                      <small className="text-muted ms-1">{product.rating}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalProducts > productsPerPage && !loading && (
        <nav aria-label="Product navigation" className="mt-4">
          <ul className="pagination justify-content-center">
            {/* First Page */}
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || loading}
              >
                <span aria-hidden="true">&laquo;</span>
                <span className="visually-hidden">First</span>
              </button>
            </li>

            {/* Previous Page */}
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </button>
            </li>

            {/* Page Numbers */}
            {getPageRange().map((page, index) => (
              <li 
                key={index} 
                className={`page-item ${currentPage === page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => page !== '...' && setCurrentPage(page)}
                  disabled={page === '...' || loading}
                >
                  {page}
                </button>
              </li>
            ))}

            {/* Next Page */}
            <li className={`page-item ${currentPage === Math.ceil(totalProducts / productsPerPage) ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalProducts / productsPerPage)))}
                disabled={currentPage === Math.ceil(totalProducts / productsPerPage) || loading}
              >
                Next
              </button>
            </li>

            {/* Last Page */}
            <li className={`page-item ${currentPage === Math.ceil(totalProducts / productsPerPage) ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(Math.ceil(totalProducts / productsPerPage))}
                disabled={currentPage === Math.ceil(totalProducts / productsPerPage) || loading}
              >
                <span aria-hidden="true">&raquo;</span>
                <span className="visually-hidden">Last</span>
              </button>
            </li>
          </ul>

          {/* Page Info */}
          <div className="text-center mt-2">
            <small className="text-muted">
              Page {currentPage} of {Math.ceil(totalProducts / productsPerPage)} | 
              Total Products: {totalProducts}
            </small>
          </div>
        </nav>
      )}
    </div>
  );
}

export default ProductList;