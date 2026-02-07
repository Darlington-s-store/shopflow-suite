# 📋 Category & Sub-Category Workflow Guide

## Overview
The admin should follow this workflow to properly set up the product catalog structure:

```
1. Create Parent Category
        ↓
2. Add Sub-categories to Parent
        ↓
3. Create Brands (with Category + Sub-category)
        ↓
4. Add Products (selecting Category, Sub-category, Brand)
```

---

## Step 1: Create Parent Category

### From Admin Dashboard:
1. Go to **Admin → Categories**
2. Click **"Add Category"** button
3. Fill in the form:
   - **Name**: e.g., "Electronics", "Fashion", "Home & Living"
   - **Slug**: Auto-generated (e.g., "electronics")
   - **Description**: Optional
   - **Icon**: Optional emoji (e.g., 📱)
   - **Display Order**: Number (lower = shows first)
   - **Status**: Toggle to Active
4. Click **"Create Category"**
5. ✅ Parent category is now created and saved to database

### Database Result:
```sql
INSERT INTO categories (name, slug, description, parent_id, status)
VALUES ('Electronics', 'electronics', 'desc...', NULL, 'ACTIVE');
-- parent_id = NULL (it's a parent category, not a sub-category)
```

---

## Step 2: Add Sub-categories to Parent

### From Admin Dashboard:
1. Go to **Admin → Categories**
2. Find your parent category (e.g., "Electronics")
3. Click **"Manage Sub-categories"** button
4. Page opens showing:
   - Parent category name
   - Empty sub-categories list
   - "Add Sub-category" form
5. Click **"Add Sub-category"** (or fill form if visible)
6. Fill in the sub-category details:
   - **Name**: e.g., "Laptops", "Smartphones", "Tablets"
   - **Slug**: Auto-generated
   - **Description**: Optional
   - **Display Order**: Number
   - **Status**: Active
7. Click **"Create"**
8. ✅ Sub-category is created with `parent_id` pointing to parent category

### Database Result:
```sql
INSERT INTO categories (name, slug, description, parent_id, status)
VALUES ('Laptops', 'laptops', 'desc...', 1, 'ACTIVE');
-- parent_id = 1 (ID of parent "Electronics" category)
```

### Repeat for Other Sub-categories:
- Add "Smartphones" (parent_id = 1)
- Add "Tablets" (parent_id = 1)
- Add "Wearables" (parent_id = 1)

---

## Step 3: Create Brands

### From Product Form (When adding a brand):
1. Go to **Admin → Products → Add Product**
2. In the product form:
   - **Category**: Select "Electronics" (parent)
   - **Sub-category**: Dropdown auto-updates with:
     - Laptops ✅
     - Smartphones ✅
     - Tablets ✅
     - Wearables ✅
3. Select a sub-category (e.g., "Smartphones")
4. **Brand**: Create or select brand
5. Fill in other product details
6. Click **"Create Product"**

✅ Product is linked to Category, Sub-category, and Brand

---

## Step 4: Add Products

Products will now properly use the Category → Sub-category → Brand structure.

---

## Data Structure in Database

### Categories Table Structure:
```
id | name        | slug         | parent_id | status | created_at
---+-------------+--------------+-----------+--------+-----
1  | Electronics | electronics  | NULL      | ACTIVE | ...
2  | Laptops     | laptops      | 1         | ACTIVE | ...
3  | Smartphones | smartphones  | 1         | ACTIVE | ...
4  | Tablets     | tablets      | 1         | ACTIVE | ...
5  | Fashion     | fashion      | NULL      | ACTIVE | ...
6  | Men's       | mens         | 5         | ACTIVE | ...
7  | Women's     | womens       | 5         | ACTIVE | ...
```

**Explanation:**
- **Parent Categories** (no parent_id): Electronics, Fashion, etc.
- **Sub-categories** (parent_id set): Laptops, Smartphones, Men's Clothing, etc.

---

## Frontend Logic

### Category Filter (Auto-updates Sub-category dropdown):
```typescript
// Get parent categories only
const parentCategories = categories.filter(c => !c.parentId);

// Get sub-categories for selected parent
const subCategoriesForParent = categories.filter(c => c.parentId === selectedCategoryId);
```

### Display in Sub-category Selector:
```
When you select "Electronics" in product form:
↓
Sub-category dropdown shows:
- Laptops (parentId = Electronics ID)
- Smartphones (parentId = Electronics ID)
- Tablets (parentId = Electronics ID)
```

---

## Key Points to Remember

✅ **Parent categories** have NO parent_id (NULL)  
✅ **Sub-categories** MUST have a parent_id pointing to parent category  
✅ **Frontend validation** prevents duplicate category/sub-category names  
✅ **Backend validation** ensures unique category names across ALL categories  
✅ **Status field** stores "ACTIVE" or "INACTIVE" (mapped to isActive boolean in frontend)

---

## Troubleshooting

### "Category Not Found" error when clicking "Manage Sub-categories"
- Wait for the loading spinner to finish
- Categories take a moment to load from the backend
- If error persists, refresh the page

### Sub-categories not showing up
- Make sure you clicked "Manage Sub-categories" on the PARENT category
- Sub-categories are only shown under their parent
- Check database: sub-category should have parent_id set

### Can't create duplicate category
- ✅ This is intentional! Category names must be unique
- Each category can only exist once in the system
- Try a different name (e.g., "Electronics 2")

### Sub-category shows but products don't filter properly
- Check that product was saved with correct category_id and subcategory_id
- Verify sub-category has parent_id pointing to correct category

---

## API Endpoints Used

### Get All Categories (Active only)
```
GET /api/products/categories
Response: { categories: [...] }
```

### Create Category (Parent or Sub)
```
POST /api/products/categories
Body: { name, description, parentId, isActive, ... }
```

### Update Category
```
PUT /api/products/categories/:id
Body: { name, description, isActive, ... }
```

### Delete Category
```
DELETE /api/products/categories/:id
```

---

## Summary

```
✅ Create Parent Category (e.g., Electronics)
  ↓
✅ Create Sub-categories under it (Laptops, Smartphones, etc.)
  ↓
✅ When creating Brand/Product, select Category + Sub-category
  ↓
✅ System filters and validates all selections
```

**Everything is now properly structured and saved to the database!** 🎉
