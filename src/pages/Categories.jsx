import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaBox } from 'react-icons/fa';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryProducts, setCategoryProducts] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch categories first
        const response = await productsAPI.getCategories();
        const categoryList = response.data || [];
        const processedCategories = categoryList.map(cat => 
          typeof cat === 'object' ? cat.name || cat.slug || String(cat) : String(cat)
        );
        setCategories(processedCategories);

        // Fetch products for each category in parallel with batching
        const batchSize = 5; // Process 5 categories at a time
        const productsMap = {};
        
        for (let i = 0; i < processedCategories.length; i += batchSize) {
          const batch = processedCategories.slice(i, i + batchSize);
          const batchPromises = batch.map(async (category) => {
            try {
              const products = await productsAPI.getByCategory(category);
              return { category, products: products.data.products.slice(0, 4) };
            } catch (error) {
              console.error(`Error fetching products for ${category}:`, error);
              return { category, products: [] };
            }
          });

          const batchResults = await Promise.all(batchPromises);
          batchResults.forEach(({ category, products }) => {
            productsMap[category] = products;
          });
          
          // Update state incrementally for each batch
          setCategoryProducts(prev => ({
            ...prev,
            ...Object.fromEntries(batchResults.map(({ category, products }) => [category, products]))
          }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const formatCategoryName = (category) => {
    if (!category || typeof category !== 'string') return '';
    return category
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-center">Product Categories</h1>
      <div className="row g-4">
        {categories.map((category) => (
          <div key={category} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <FaBox className="me-2" />
                  {formatCategoryName(category)}
                </h5>
              </div>
              <div className="card-body">
                {!categoryProducts[category] ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row g-2">
                    {categoryProducts[category]?.map((product) => (
                      <div key={product.id} className="col-6">
                        <Link 
                          to={`/products/${product.id}`}
                          className="text-decoration-none"
                        >
                          <div className="card h-100">
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="card-img-top"
                              style={{ height: '100px', objectFit: 'cover' }}
                              loading="lazy"
                            />
                            <div className="card-body p-2">
                              <p className="card-text small text-truncate text-dark">
                                {product.title}
                              </p>
                              <p className="card-text small text-primary mb-0">
                                ${product.price}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-footer bg-white">
                <Link
                  to={`/products?category=${category}`}
                  className="btn btn-outline-primary w-100"
                >
                  View All Products
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;
