import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus, Payment, PaymentStatus, Address, Delivery, DeliveryStatus } from '@/types';
import { generateOrderNumber, generateInvoiceNumber } from '@/data/mockData';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

interface OrderContextType {
  orders: Order[];
  allOrders: Order[];
  deliveries: Delivery[];
  createOrder: (shippingAddress: Address, paymentMethod: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
  processPayment: (orderId: string) => Promise<{ success: boolean; reference: string }>;
  assignDelivery: (orderId: string, agentId: string) => void;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus, note?: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDERS_KEY = 'techmart_orders';
const DELIVERIES_KEY = 'techmart_deliveries';

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    setAllOrders(savedOrders);
    
    if (user) {
      setOrders(savedOrders.filter((o: Order) => o.userId === user.id));
    } else {
      setOrders([]);
    }

    const savedDeliveries = JSON.parse(localStorage.getItem(DELIVERIES_KEY) || '[]');
    setDeliveries(savedDeliveries);
  }, [user]);

  const saveOrders = (newOrders: Order[]) => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
    setAllOrders(newOrders);
    if (user) {
      setOrders(newOrders.filter(o => o.userId === user.id));
    }
  };

  const saveDeliveries = (newDeliveries: Delivery[]) => {
    localStorage.setItem(DELIVERIES_KEY, JSON.stringify(newDeliveries));
    setDeliveries(newDeliveries);
  };

  const createOrder = async (shippingAddress: Address, paymentMethod: string): Promise<Order> => {
    if (!user) throw new Error('User must be logged in');

    const orderItems = cart.items.map(item => ({
      id: `item-${Date.now()}-${Math.random()}`,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.product.name,
      variantName: [item.variant.color, item.variant.storage].filter(Boolean).join(' - '),
      sku: item.variant.sku,
      price: item.variant.price,
      quantity: item.quantity,
      image: item.product.images[0]?.url,
    }));

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      userId: user.id,
      items: orderItems,
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      tax: cart.tax,
      total: cart.total,
      status: 'PENDING_PAYMENT',
      shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedOrders = [...allOrders, newOrder];
    saveOrders(updatedOrders);

    return newOrder;
  };

  const processPayment = async (orderId: string): Promise<{ success: boolean; reference: string }> => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const reference = `PAY-${Date.now()}`;
    const success = Math.random() > 0.1; // 90% success rate for demo

    const updatedOrders = allOrders.map(order => {
      if (order.id === orderId) {
        const payment: Payment = {
          id: `pay-${Date.now()}`,
          orderId,
          amount: order.total,
          method: 'CARD',
          status: success ? 'SUCCESS' : 'FAILED',
          reference,
          createdAt: new Date().toISOString(),
        };

        return {
          ...order,
          status: success ? 'PAID' as OrderStatus : 'PENDING_PAYMENT' as OrderStatus,
          payment,
          updatedAt: new Date().toISOString(),
        };
      }
      return order;
    });

    saveOrders(updatedOrders);

    if (success) {
      clearCart();
      
      // Create delivery record
      const order = updatedOrders.find(o => o.id === orderId);
      if (order) {
        const delivery: Delivery = {
          id: `del-${Date.now()}`,
          orderId,
          status: 'PENDING',
          fee: order.deliveryFee,
          updates: [{
            id: `upd-${Date.now()}`,
            status: 'PENDING',
            note: 'Order placed and payment confirmed',
            timestamp: new Date().toISOString(),
            updatedBy: 'system',
          }],
          createdAt: new Date().toISOString(),
        };
        saveDeliveries([...deliveries, delivery]);
      }
    }

    return { success, reference };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updatedOrders = allOrders.map(order =>
      order.id === orderId
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    );
    saveOrders(updatedOrders);
  };

  const getOrderById = (orderId: string) => {
    return allOrders.find(o => o.id === orderId);
  };

  const assignDelivery = (orderId: string, agentId: string) => {
    const updatedDeliveries = deliveries.map(delivery => {
      if (delivery.orderId === orderId) {
        return {
          ...delivery,
          agentId,
          status: 'ASSIGNED' as DeliveryStatus,
          updates: [
            ...delivery.updates,
            {
              id: `upd-${Date.now()}`,
              status: 'ASSIGNED' as DeliveryStatus,
              note: 'Assigned to delivery agent',
              timestamp: new Date().toISOString(),
              updatedBy: 'admin',
            },
          ],
        };
      }
      return delivery;
    });
    saveDeliveries(updatedDeliveries);
    updateOrderStatus(orderId, 'ASSIGNED_TO_DELIVERY');
  };

  const updateDeliveryStatus = (deliveryId: string, status: DeliveryStatus, note?: string) => {
    const updatedDeliveries = deliveries.map(delivery => {
      if (delivery.id === deliveryId) {
        const updated = {
          ...delivery,
          status,
          actualDelivery: status === 'DELIVERED' ? new Date().toISOString() : delivery.actualDelivery,
          updates: [
            ...delivery.updates,
            {
              id: `upd-${Date.now()}`,
              status,
              note: note || `Status updated to ${status}`,
              timestamp: new Date().toISOString(),
              updatedBy: user?.id || 'system',
            },
          ],
        };

        // Update corresponding order status
        const orderStatus: Record<DeliveryStatus, OrderStatus> = {
          PENDING: 'PROCESSING',
          ASSIGNED: 'ASSIGNED_TO_DELIVERY',
          PICKED_UP: 'ASSIGNED_TO_DELIVERY',
          IN_TRANSIT: 'OUT_FOR_DELIVERY',
          DELIVERED: 'DELIVERED',
          FAILED: 'DELIVERY_FAILED',
        };
        updateOrderStatus(delivery.orderId, orderStatus[status]);

        return updated;
      }
      return delivery;
    });
    saveDeliveries(updatedDeliveries);
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
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
