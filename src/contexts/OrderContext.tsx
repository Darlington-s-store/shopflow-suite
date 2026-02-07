import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Order, OrderStatus, Payment, PaymentStatus, Address, Delivery, DeliveryStatus } from '@/types';
import { generateOrderNumber } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

interface OrderContextType {
  orders: Order[];
  allOrders: Order[];
  deliveries: Delivery[];
  createOrder: (shippingAddress: Address, paymentMethod: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  processPayment: (orderId: string, paystackReference?: string) => Promise<{ success: boolean; reference: string }>;
  assignDelivery: (orderId: string, agentId: string) => Promise<void>;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus, note?: string) => Promise<void>;
  loadDeliveries: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const { cart, clearCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load orders from backend
  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (token && user) {
          const response = await fetch(`${apiUrl}/user/orders`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const userOrders = Array.isArray(data) ? data : data.orders || [];
            setOrders(userOrders);
          }
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    };

    loadOrders();
  }, [token, user, apiUrl]);

  // Fetch all orders (admin only)
  useEffect(() => {
    const loadAllOrders = async () => {
      try {
        if (token && user?.role === 'ADMIN') {
          const response = await fetch(`${apiUrl}/orders`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const allOrdersData = Array.isArray(data) ? data : data.orders || [];
            setAllOrders(allOrdersData);
          }
        }
      } catch (error) {
        console.error('Failed to load all orders:', error);
      }
    };

    loadAllOrders();
  }, [token, user, apiUrl]);

  // Load deliveries from backend
  const loadDeliveries = useCallback(async () => {
    try {
      if (token) {
        const response = await fetch(`${apiUrl}/deliveries`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const deliveriesData = Array.isArray(data) ? data : data.deliveries || [];
          setDeliveries(deliveriesData);
        }
      }
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    }
  }, [token, apiUrl]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const createOrder = async (shippingAddress: Address, paymentMethod: string): Promise<Order> => {
    if (!user) throw new Error('User must be logged in');
    if (!token) throw new Error('No authentication token');

    const orderItems = cart.items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          shippingAddressId: shippingAddress.id,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      const newOrder = data.order || data.data;

      setOrders(prev => [...prev, newOrder]);
      setAllOrders(prev => [...prev, newOrder]);
      clearCart();

      return newOrder;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  };

  const processPayment = async (orderId: string, paystackReference?: string): Promise<{ success: boolean; reference: string }> => {
    if (!token) throw new Error('No authentication token');

    const reference = paystackReference || `PAY-${Date.now()}`;

    try {
      const response = await fetch(`${apiUrl}/orders/${orderId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reference,
          method: 'CARD',
        }),
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const data = await response.json();
      const success = data.success || data.payment?.status === 'SUCCESS';

      if (success) {
        // Reload orders from backend
        const ordersResponse = await fetch(`${apiUrl}/user/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          const userOrders = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
          setOrders(userOrders);
        }
      }

      return { success, reference };
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedOrder = data.order || data.data;

        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
        setAllOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      }
    } catch (error) {
      console.error('Update order status error:', error);
    }
  };

  const getOrderById = (orderId: string) => {
    return allOrders.find(o => o.id === orderId);
  };

  const assignDelivery = async (orderId: string, agentId: string): Promise<void> => {
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/deliveries/${orderId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ agentId }),
      });

      if (response.ok) {
        await loadDeliveries();
        await updateOrderStatus(orderId, 'ASSIGNED_TO_DELIVERY');
      }
    } catch (error) {
      console.error('Assign delivery error:', error);
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, status: DeliveryStatus, note?: string): Promise<void> => {
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/deliveries/${deliveryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, note }),
      });

      if (response.ok) {
        await loadDeliveries();

        // Find the delivery to get its order ID and update order status accordingly
        const delivery = deliveries.find(d => d.id === deliveryId);
        if (delivery) {
          const orderStatusMap: Record<DeliveryStatus, OrderStatus> = {
            PENDING: 'PROCESSING',
            ASSIGNED: 'ASSIGNED_TO_DELIVERY',
            PICKED_UP: 'ASSIGNED_TO_DELIVERY',
            IN_TRANSIT: 'OUT_FOR_DELIVERY',
            DELIVERED: 'DELIVERED',
            FAILED: 'DELIVERY_FAILED',
          };
          await updateOrderStatus(delivery.orderId, orderStatusMap[status]);
        }
      }
    } catch (error) {
      console.error('Update delivery status error:', error);
    }
  };

  const value: OrderContextType = {
    orders,
    allOrders,
    deliveries,
    createOrder,
    updateOrderStatus,
    getOrderById,
    processPayment,
    assignDelivery,
    updateDeliveryStatus,
    loadDeliveries,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
