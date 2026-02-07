import pool from '../db/pool.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const saveBase64Image = (base64String, filename) => {
  try {
    // Check if it's a data URL
    if (base64String.startsWith('data:')) {
      const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) throw new Error('Invalid base64 format');
      const buffer = Buffer.from(matches[2], 'base64');
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, buffer);
      return `/uploads/${filename}`;
    }
    return base64String; // Return as-is if it's already a URL
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, categoryId, brandId, shortDescription, fullDescription, basePrice, discountPrice, taxEnabled, stockTracking, status, variants, images } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const result = await pool.query(
      `INSERT INTO products (name, slug, category_id, brand_id, short_description, full_description, base_price, discount_price, tax_enabled, stock_tracking, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [name, slug, categoryId, brandId, shortDescription, fullDescription, basePrice, discountPrice, taxEnabled, stockTracking, status || 'ACTIVE', req.user.id]
    );

    const product = result.rows[0];

    // Add variants if provided
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await pool.query(
          `INSERT INTO product_variants (product_id, sku, color, storage, price, stock)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [product.id, variant.sku, variant.color, variant.storage, variant.price, variant.stock || 0]
        );
      }
    }

    // Add images if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        const filename = `${product.id}-${Date.now()}-${i}.jpg`;
        const imageUrl = saveBase64Image(imageData, filename);
        
        if (imageUrl) {
          await pool.query(
            `INSERT INTO product_images (product_id, image_url, sort_order, is_featured)
             VALUES ($1, $2, $3, $4)`,
            [product.id, imageUrl, i, i === 0]
          );
        }
      }
    }

    // Fetch complete product with images and variants
    const completeProduct = await pool.query('SELECT * FROM products WHERE id = $1', [product.id]);
    const variantsResult = await pool.query('SELECT * FROM product_variants WHERE product_id = $1', [product.id]);
    const imagesResult = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order', [product.id]);
    
    const productWithDetails = completeProduct.rows[0];
    productWithDetails.variants = variantsResult.rows;
    productWithDetails.images = imagesResult.rows;

    res.status(201).json({ success: true, product: productWithDetails });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, error: 'Failed to create product' });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { category, brand, search, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM products WHERE status IN ($1, $2)';
    let params = ['ACTIVE', 'PUBLISHED'];
    let paramIndex = 3;

    if (category) {
      query += ` AND category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (brand) {
      query += ` AND brand_id = $${paramIndex}`;
      params.push(brand);
      paramIndex++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR short_description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Fetch images and variants for each product
    const productsWithDetails = await Promise.all(
      result.rows.map(async (product) => {
        const imagesResult = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order', [product.id]);
        const variantsResult = await pool.query('SELECT * FROM product_variants WHERE product_id = $1', [product.id]);
        
        return {
          ...product,
          images: imagesResult.rows,
          variants: variantsResult.rows
        };
      })
    );

    res.json({ success: true, products: productsWithDetails, count: productsWithDetails.length });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const product = productResult.rows[0];

    // Get variants
    const variantsResult = await pool.query('SELECT * FROM product_variants WHERE product_id = $1', [id]);
    product.variants = variantsResult.rows;

    // Get images
    const imagesResult = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order', [id]);
    product.images = imagesResult.rows;

    res.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, brandId, shortDescription, fullDescription, basePrice, discountPrice, taxEnabled, status } = req.body;

    const result = await pool.query(
      `UPDATE products SET name = COALESCE($1, name), category_id = COALESCE($2, category_id), brand_id = COALESCE($3, brand_id),
       short_description = COALESCE($4, short_description), full_description = COALESCE($5, full_description),
       base_price = COALESCE($6, base_price), discount_price = COALESCE($7, discount_price),
       tax_enabled = COALESCE($8, tax_enabled), status = COALESCE($9, status),
       updated_at = CURRENT_TIMESTAMP WHERE id = $10 RETURNING *`,
      [name, categoryId, brandId, shortDescription, fullDescription, basePrice, discountPrice, taxEnabled, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, product: result.rows[0] });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
};

// Categories
export const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE status = $1 ORDER BY name', ['ACTIVE']);
    res.json({ success: true, categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req, res) => {
  try {
    // Extract the fields we need
    const { name, description, parent_id, parentId, image_url, image, isActive, displayOrder, sortOrder } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const actualParentId = parent_id || parentId;
    const actualImageUrl = image_url || image;
    const status = isActive === false ? 'INACTIVE' : 'ACTIVE';

    const result = await pool.query(
      'INSERT INTO categories (name, slug, description, image_url, parent_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name.trim(), slug, description?.trim() || null, actualImageUrl || null, actualParentId || null, status]
    );

    res.status(201).json({ success: true, category: result.rows[0] });
  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle duplicate category name
    if (error.code === '23505' && error.constraint === 'categories_name_key') {
      return res.status(409).json({ success: false, error: 'A category with this name already exists' });
    }
    
    res.status(500).json({ success: false, error: 'Failed to create category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, status, isActive } = req.body;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }
    if (name !== undefined) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      updateFields.push(`slug = $${paramCount}`);
      updateValues.push(slug);
      paramCount++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
      paramCount++;
    }
    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramCount}`);
      updateValues.push(image_url);
      paramCount++;
    }
    // Handle both 'status' and 'isActive' - convert boolean isActive to status string
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount}`);
      updateValues.push(status);
      paramCount++;
    } else if (isActive !== undefined) {
      const statusValue = isActive ? 'ACTIVE' : 'INACTIVE';
      updateFields.push(`status = $${paramCount}`);
      updateValues.push(statusValue);
      paramCount++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const result = await pool.query(
      `UPDATE categories SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      [...updateValues, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true, category: result.rows[0] });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has subcategories
    const subCategoryCount = await pool.query('SELECT COUNT(*) FROM categories WHERE parent_id = $1', [id]);
    if (parseInt(subCategoryCount.rows[0].count) > 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete category with subcategories' });
    }

    // Check if category has products
    const productCount = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id]);
    if (parseInt(productCount.rows[0].count) > 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete category with products' });
    }

    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
};

// Brands
export const getAllBrands = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM brands WHERE status = $1 ORDER BY name', ['ACTIVE']);
    res.json({ success: true, brands: result.rows });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch brands' });
  }
};

export const createBrand = async (req, res) => {
  try {
    const { name, logo_url, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const result = await pool.query(
      'INSERT INTO brands (name, slug, logo_url, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, slug, logo_url, description]
    );

    res.status(201).json({ success: true, brand: result.rows[0] });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ success: false, error: 'Failed to create brand' });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, isActive, logo_url } = req.body;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      updateFields.push(`slug = $${paramCount}`);
      updateValues.push(slug);
      paramCount++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
      paramCount++;
    }

    if (logo_url !== undefined) {
      updateFields.push(`logo_url = $${paramCount}`);
      updateValues.push(logo_url);
      paramCount++;
    }

    // Handle both 'status' and 'isActive' - convert boolean isActive to status string
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount}`);
      updateValues.push(status);
      paramCount++;
    } else if (isActive !== undefined) {
      const statusValue = isActive ? 'ACTIVE' : 'INACTIVE';
      updateFields.push(`status = $${paramCount}`);
      updateValues.push(statusValue);
      paramCount++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const result = await pool.query(
      `UPDATE brands SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      [...updateValues, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    res.json({ success: true, brand: result.rows[0] });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ success: false, error: 'Failed to update brand' });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM brands WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete brand' });
  }
};
