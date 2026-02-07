const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper for API calls with auth
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for auth
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: any) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () =>
    apiCall('/auth/logout', { method: 'POST' }),
  requestPasswordReset: (email: string) =>
    apiCall('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
  getCurrentUser: () =>
    apiCall('/auth/me', { method: 'GET' }),
};

// Product API
export const productAPI = {
  getAll: (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/products?${params}`, { method: 'GET' });
  },
  getById: (id: string | number) =>
    apiCall(`/products/${id}`, { method: 'GET' }),
  getBySlug: (slug: string) =>
    apiCall(`/products/slug/${slug}`, { method: 'GET' }),
  getVariants: (productId: number) =>
    apiCall(`/products/${productId}/variants`, { method: 'GET' }),
};

// Cart API
export const cartAPI = {
  getCart: () =>
    apiCall('/user/cart', { method: 'GET' }),
  addToCart: (productId: number, variantId: number, quantity: number) =>
    apiCall('/user/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, variantId, quantity }),
    }),
  removeFromCart: (cartItemId: number) =>
    apiCall(`/user/cart/${cartItemId}`, { method: 'DELETE' }),
  updateCart: (cartItemId: number, quantity: number) =>
    apiCall(`/user/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  clearCart: () =>
    apiCall('/user/cart', { method: 'DELETE' }),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () =>
    apiCall('/user/wishlist', { method: 'GET' }),
  addToWishlist: (productId: number) =>
    apiCall('/user/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
  removeFromWishlist: (productId: number) =>
    apiCall(`/user/wishlist/${productId}`, { method: 'DELETE' }),
};

// Order API
export const orderAPI = {
  getOrders: () =>
    apiCall('/orders', { method: 'GET' }),
  getOrderById: (orderId: number) =>
    apiCall(`/orders/${orderId}`, { method: 'GET' }),
  createOrder: (orderData: any) =>
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  cancelOrder: (orderId: number) =>
    apiCall(`/orders/${orderId}/cancel`, { method: 'POST' }),
};

// Delivery API
export const deliveryAPI = {
  getDeliveryStatus: (orderId: number) =>
    apiCall(`/orders/${orderId}/delivery`, { method: 'GET' }),
  trackDelivery: (trackingNumber: string) =>
    apiCall(`/delivery/track/${trackingNumber}`, { method: 'GET' }),
};

// Address API
export const addressAPI = {
  getAddresses: () =>
    apiCall('/user/addresses', { method: 'GET' }),
  addAddress: (addressData: any) =>
    apiCall('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    }),
  updateAddress: (addressId: number, addressData: any) =>
    apiCall(`/user/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    }),
  deleteAddress: (addressId: number) =>
    apiCall(`/user/addresses/${addressId}`, { method: 'DELETE' }),
};

// Notification API
export const notificationAPI = {
  getNotifications: () =>
    apiCall('/notifications', { method: 'GET' }),
  markAsRead: (notificationId: number) =>
    apiCall(`/notifications/${notificationId}/read`, { method: 'PUT' }),
  deleteNotification: (notificationId: number) =>
    apiCall(`/notifications/${notificationId}`, { method: 'DELETE' }),
};

// Message API
export const messageAPI = {
  getMessages: () =>
    apiCall('/user/messages', { method: 'GET' }),
  getMessageThread: (userId: number) =>
    apiCall(`/user/messages/${userId}/thread`, { method: 'GET' }),
  sendMessage: (recipientId: number, message: string) =>
    apiCall('/user/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, message }),
    }),
  markMessageAsRead: (messageId: number) =>
    apiCall(`/user/messages/${messageId}/read`, { method: 'PUT' }),
};

// Review API
export const reviewAPI = {
  getProductReviews: (productId: number) =>
    apiCall(`/products/${productId}/reviews`, { method: 'GET' }),
  submitReview: (productId: number, reviewData: any) =>
    apiCall(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
  updateReview: (reviewId: number, reviewData: any) =>
    apiCall(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),
  deleteReview: (reviewId: number) =>
    apiCall(`/reviews/${reviewId}`, { method: 'DELETE' }),
};

// Admin API
export const adminAPI = {
  // Products
  createProduct: (productData: any) =>
    apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),
  updateProduct: (productId: number, productData: any) =>
    apiCall(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),
  deleteProduct: (productId: number) =>
    apiCall(`/products/${productId}`, { method: 'DELETE' }),

  // Variants
  createVariant: (productId: number, variantData: any) =>
    apiCall(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variantData),
    }),
  updateVariant: (variantId: number, variantData: any) =>
    apiCall(`/products/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(variantData),
    }),
  deleteVariant: (variantId: number) =>
    apiCall(`/products/variants/${variantId}`, { method: 'DELETE' }),

  // Categories
  getCategories: () =>
    apiCall('/admin/categories', { method: 'GET' }),
  createCategory: (categoryData: any) =>
    apiCall('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),
  updateCategory: (categoryId: number, categoryData: any) =>
    apiCall(`/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),
  deleteCategory: (categoryId: number) =>
    apiCall(`/admin/categories/${categoryId}`, { method: 'DELETE' }),

  // Brands
  getBrands: () =>
    apiCall('/admin/brands', { method: 'GET' }),
  createBrand: (brandData: any) =>
    apiCall('/admin/brands', {
      method: 'POST',
      body: JSON.stringify(brandData),
    }),
  updateBrand: (brandId: number, brandData: any) =>
    apiCall(`/admin/brands/${brandId}`, {
      method: 'PUT',
      body: JSON.stringify(brandData),
    }),
  deleteBrand: (brandId: number) =>
    apiCall(`/admin/brands/${brandId}`, { method: 'DELETE' }),

  // Orders
  getOrders: () =>
    apiCall('/admin/orders', { method: 'GET' }),
  getOrderById: (orderId: number) =>
    apiCall(`/admin/orders/${orderId}`, { method: 'GET' }),
  updateOrderStatus: (orderId: number, status: string) =>
    apiCall(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Customers
  getCustomers: () =>
    apiCall('/admin/customers', { method: 'GET' }),
  getCustomerById: (customerId: number) =>
    apiCall(`/admin/customers/${customerId}`, { method: 'GET' }),

  // Messages
  getMessages: () =>
    apiCall('/admin/messages', { method: 'GET' }),
  replyToMessage: (messageId: number, reply: string) =>
    apiCall(`/admin/messages/${messageId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ replyMessage: reply }),
    }),
  deleteMessage: (messageId: number) =>
    apiCall(`/admin/messages/${messageId}`, { method: 'DELETE' }),

  // Reviews
  getReviews: () =>
    apiCall('/admin/reviews', { method: 'GET' }),
  approveReview: (reviewId: number) =>
    apiCall(`/admin/reviews/${reviewId}/approve`, { method: 'POST' }),
  rejectReview: (reviewId: number) =>
    apiCall(`/admin/reviews/${reviewId}/reject`, { method: 'POST' }),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message: string, image?: File) => {
    const formData = new FormData();
    formData.append('message', message);
    if (image) formData.append('image', image);

    return fetch(`${API_BASE_URL}/chatbot/message`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(r => r.json());
  },
  getConversation: () =>
    apiCall('/chatbot/conversation', { method: 'GET' }),
  uploadImage: (image: File) => {
    const formData = new FormData();
    formData.append('image', image);

    return fetch(`${API_BASE_URL}/chatbot/upload-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(r => r.json());
  },
};

// User Profile API
export const userAPI = {
  getProfile: () =>
    apiCall('/user/profile', { method: 'GET' }),
  updateProfile: (profileData: any) =>
    apiCall('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  updatePassword: (currentPassword: string, newPassword: string) =>
    apiCall('/user/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

export default {
  authAPI,
  productAPI,
  cartAPI,
  wishlistAPI,
  orderAPI,
  deliveryAPI,
  addressAPI,
  notificationAPI,
  messageAPI,
  reviewAPI,
  adminAPI,
  chatbotAPI,
  userAPI,
};
