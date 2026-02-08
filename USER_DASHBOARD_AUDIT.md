# User Dashboard Audit

I have examined the User Dashboard pages to identify dependencies on `localStorage` and mock data. Here are the findings and recommended actions:

## 1. 🏠 UserAddresses.tsx (High Priority)
- **Current State**: Uses `localStorage` (`shopflow_user_addresses`) to store address data.
- **Backend Status**: ✅ **Ready**. The backend already has fully functional endpoints (`GET`, `POST`, `PUT`, `DELETE` at `/api/user/addresses`) backed by a database table.
- **Action Needed**: Refactor the component to replace `localStorage` usage with API calls using `useEffect` and `fetch`. Note: Data mapping is required between backend "snake_case" and frontend "camelCase".

## 2. 🔔 UserNotifications.tsx
- **Current State**: Uses `localStorage` (`shopflow_user_notifications`).
- **Backend Status**: ⚠️ **Incomplete**. A `notifications` table exists in the database, but there are no API routes or controllers exposed to fetch/manage them.
- **Action Needed**: Create a `NotificationController` and corresponding routes in the backend, then refactor the frontend component.

## 3. ⚙️ UserSettings.tsx
- **Current State**: Uses `localStorage` (`shopflow_user_settings`).
- **Status**: Mixed.
    - **Preferences (Theme, Language)**: `localStorage` is acceptable/standard for client-side preferences.
    - **Password Change**: Currently simulated. Backend is missing a `change-password` endpoint.
- **Action Needed**: Implement `POST /api/auth/change-password` in the backend and connect the frontend form.

## 4. 🛒 Cart Integration (Critical Finding)
- **Status**: **Broken**.
- **Issue**: The `CartContext` tries to read `data.cart` from the API response, but the backend returns `data.items`. Additionally, the backend returns a "flat" structure (e.g., `product_name`), while the frontend expects a nested object (`item.product.name`).
- **Consequence**: Users will see an empty cart or experience errors when calculating totals.
- **Action Needed**: Update `CartContext.tsx` to correctly map the backend response to the frontend `CartItem` interface.

## 5. ⭐ UserReviews.tsx
- **Status**: **Logic Gap**.
- **Issue**: The `ReviewContext` only fetches *all* reviews if the user is an Admin. For regular customers, it initializes an empty array, meaning `UserReviews` (My Reviews) will appear empty even if the user has written reviews.
- **Action Needed**: Update `ReviewContext` or `UserReviews` to fetch the specific user's reviews from the backend.

---
**Recommended Plan:**
1.  **Refactor `UserAddresses.tsx`** (Highest value, backend ready).
2.  **Fix `CartContext.tsx`** (Critical bug fix).
3.  **Implement Notification System** (Backend + Frontend).
