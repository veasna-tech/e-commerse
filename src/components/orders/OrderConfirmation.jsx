import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ref, get } from 'firebase/database';
import { db } from '../../services/firebase';
import { FaCheckCircle } from 'react-icons/fa';

function OrderConfirmation() {
  const [latestOrder, setLatestOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        const ordersRef = ref(db, 'orders');
        const snapshot = await get(ordersRef);
        const orders = [];
        
        snapshot.forEach((childSnapshot) => {
          const order = childSnapshot.val();
          if (order.userId === user.uid) {
            orders.push({
              id: childSnapshot.key,
              ...order
            });
          }
        });

        // Sort by createdAt and get the latest order
        const sortedOrders = orders.sort((a, b) => b.createdAt - a.createdAt);
        setLatestOrder(sortedOrders[0]);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestOrder();
  }, [user.uid]);

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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-0 shadow">
            <div className="card-body text-center p-5">
              <FaCheckCircle className="text-success mb-4" size={64} />
              <h2 className="mb-4">Order Confirmed!</h2>
              <p className="lead mb-4">Thank you for your purchase. Your order has been received.</p>
              
              {latestOrder && (
                <div className="text-start">
                  <h4 className="mb-3">Order Details</h4>
                  <div className="bg-body-tertiary p-4 rounded mb-4">
                    <p><strong>Order ID:</strong> {latestOrder.id}</p>
                    <p><strong>Date:</strong> {new Date(latestOrder.createdAt).toLocaleString()}</p>
                    <p className="mb-0">
                      <strong>Status:</strong>{' '}
                      <span className="badge bg-warning text-dark">
                        {latestOrder.status}
                      </span>
                    </p>
                  </div>

                  <h5 className="mb-3">Items</h5>
                  <div className="list-group mb-4">
                    {latestOrder.items.map(item => (
                      <div key={item.id} className="list-group-item bg-body-tertiary border-0 mb-2 rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-0">{item.title}</h6>
                            <small className="text-body-secondary">Quantity: {item.quantity}</small>
                          </div>
                          <span className="text-primary fw-bold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-body-tertiary p-4 rounded mb-4">
                    <h5 className="mb-3">Shipping Details</h5>
                    <p className="mb-1">{latestOrder.shippingDetails.shippingAddress}</p>
                    <p className="mb-1">{latestOrder.shippingDetails.city}, {latestOrder.shippingDetails.postalCode}</p>
                    <p className="mb-0">Phone: {latestOrder.shippingDetails.phone}</p>
                  </div>

                  <div className="bg-body-tertiary p-4 rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Total Amount</h5>
                      <h5 className="mb-0 text-primary">
                        ${latestOrder.total.toFixed(2)}
                      </h5>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <button 
                  className="btn btn-primary me-3"
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/orders')}
                >
                  View All Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation; 