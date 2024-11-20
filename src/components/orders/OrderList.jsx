import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ref, get } from 'firebase/database';
import { db } from '../../services/firebase';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBox, FaShoppingBag, FaTruck, FaCheck } from 'react-icons/fa';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = ref(db, 'orders');
        const snapshot = await get(ordersRef);
        const ordersList = [];
        
        snapshot.forEach((childSnapshot) => {
          const order = childSnapshot.val();
          if (order.userId === user.uid) {
            ordersList.push({
              id: childSnapshot.key,
              ...order
            });
          }
        });

        setOrders(ordersList.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user.uid]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FaBox className="text-warning" />;
      case 'processing':
        return <FaShoppingBag className="text-info" />;
      case 'shipped':
        return <FaTruck className="text-primary" />;
      case 'delivered':
        return <FaCheck className="text-success" />;
      default:
        return <FaBox />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'processing':
        return 'bg-info text-white';
      case 'shipped':
        return 'bg-primary text-white';
      case 'delivered':
        return 'bg-success text-white';
      default:
        return 'bg-secondary';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-5 text-center">
        <FaShoppingBag size={48} className="text-muted mb-4" />
        <h2>No Orders Found</h2>
        <p className="lead">You haven't placed any orders yet.</p>
        <Link to="/products" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">My Orders</h2>
        <div className="btn-group">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`btn ${filter === 'processing' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('processing')}
          >
            Processing
          </button>
          <button 
            className={`btn ${filter === 'shipped' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('shipped')}
          >
            Shipped
          </button>
          <button 
            className={`btn ${filter === 'delivered' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('delivered')}
          >
            Delivered
          </button>
        </div>
      </div>

      <div className="row">
        {filteredOrders.map(order => (
          <div key={order.id} className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-body-tertiary border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    {getStatusIcon(order.status)}
                    <span className="fw-bold ms-2">Order #{order.id.slice(-8)}</span>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h5 className="card-title mb-3">Order Items</h5>
                    <div className="list-group">
                      {order.items.map(item => (
                        <div key={item.id} className="list-group-item bg-body-tertiary border-0 mb-2 rounded">
                          <div className="d-flex align-items-center">
                            <img 
                              src={item.thumbnail} 
                              alt={item.title}
                              className="rounded me-3"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                            <div className="flex-grow-1">
                              <h6 className="mb-0">{item.title}</h6>
                              <small className="text-body-secondary">
                                Quantity: {item.quantity} × ${item.price}
                              </small>
                            </div>
                            <span className="text-primary fw-bold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-body-tertiary p-4 rounded">
                      <h5 className="card-title mb-3">Order Details</h5>
                      <p className="mb-2">
                        <strong>Date:</strong><br />
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="mb-2">
                        <strong>Total:</strong><br />
                        <span className="text-primary fw-bold h5">
                          ${order.total.toFixed(2)}
                        </span>
                      </p>
                      <p className="mb-0">
                        <strong>Shipping Address:</strong><br />
                        {order.shippingDetails.shippingAddress}<br />
                        {order.shippingDetails.city}, {order.shippingDetails.postalCode}<br />
                        Phone: {order.shippingDetails.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted">No orders found with the selected filter.</p>
        </div>
      )}
    </div>
  );
}

export default OrderList; 