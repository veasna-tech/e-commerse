import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';
import { productsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaShoppingCart } from 'react-icons/fa';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsAPI.getById(id);
        setProduct(response.data);
        setSelectedImage(response.data.thumbnail);
      } catch (error) {
        toast.error('Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    dispatch(addItem(product));
    toast.success('Added to cart!');
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

  if (!product) {
    return <div className="alert alert-danger">Product not found</div>;
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-6">
          <div className="position-relative mb-3">
            {product.discountPercentage > 0 && (
              <span className="position-absolute top-0 start-0 badge bg-danger m-2">
                -{Math.round(product.discountPercentage)}%
              </span>
            )}
            <img 
              src={selectedImage} 
              alt={product.title} 
              className="img-fluid rounded shadow"
              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
            />
          </div>
          <div className="row g-2">
            {product.images?.map((image, index) => (
              <div key={index} className="col-3">
                <img 
                  src={image} 
                  alt={`${product.title} ${index + 1}`} 
                  className={`img-fluid rounded cursor-pointer ${selectedImage === image ? 'border border-primary' : ''}`}
                  style={{ height: '80px', objectFit: 'cover' }}
                  onClick={() => setSelectedImage(image)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <h2 className="mb-2">{product.title}</h2>
          <p className="text-muted mb-3">{product.brand}</p>
          <div className="mb-3">
            <span className="h3 text-primary me-2">${product.price}</span>
            {product.discountPercentage > 0 && (
              <span className="text-muted text-decoration-line-through">
                ${Math.round(product.price * (1 + product.discountPercentage/100))}
              </span>
            )}
          </div>
          <p className="lead mb-4">{product.description}</p>
          <div className="d-flex align-items-center mb-4">
            <div className="me-4">
              <strong>Rating:</strong>
              <div className="text-warning">
                {'★'.repeat(Math.round(product.rating))}
                {'☆'.repeat(5 - Math.round(product.rating))}
                <span className="text-muted ms-2">({product.rating})</span>
              </div>
            </div>
            <div>
              <strong>Stock:</strong>
              <div className={`text-${product.stock > 0 ? 'success' : 'danger'}`}>
                {product.stock > 0 ? `${product.stock} units` : 'Out of stock'}
              </div>
            </div>
          </div>
          <button 
            className="btn btn-primary btn-lg d-flex align-items-center"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <FaShoppingCart className="me-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail; 