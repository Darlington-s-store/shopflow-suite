console.log('Testing routes...');
try {
    await import('./routes/auth.js'); console.log('auth ok');
} catch (e) { console.error('auth failed', e); }

try {
    await import('./routes/product.js'); console.log('product ok');
} catch (e) { console.error('product failed', e); }

try {
    await import('./routes/user.js'); console.log('user ok');
} catch (e) { console.error('user failed', e); }

try {
    await import('./routes/order.js'); console.log('order ok');
} catch (e) { console.error('order failed', e); }

try {
    await import('./routes/review.js'); console.log('review ok');
} catch (e) { console.error('review failed', e); }

try {
    await import('./routes/coupon.js'); console.log('coupon ok');
} catch (e) { console.error('coupon failed', e); }

try {
    await import('./routes/delivery.js'); console.log('delivery ok');
} catch (e) { console.error('delivery failed', e); }

try {
    await import('./routes/admin.js'); console.log('admin ok');
} catch (e) { console.error('admin failed', e); }

try {
    await import('./routes/notifications.js'); console.log('notifications ok');
} catch (e) { console.error('notifications failed', e); }

try {
    await import('./routes/chatbot.js'); console.log('chatbot ok');
} catch (e) { console.error('chatbot failed', e); }

try {
    await import('./routes/deals.js'); console.log('deals ok');
} catch (e) { console.error('deals failed', e); }
