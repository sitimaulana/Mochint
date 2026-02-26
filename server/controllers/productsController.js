const Products = require("../models/Products");

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Products.list();
        
        // Parse marketplace_links JSON string ke object
        const productsWithParsedLinks = products.map(product => ({
            ...product,
            marketplaceLinks: product.marketplace_links 
                ? JSON.parse(product.marketplace_links) 
                : {}
        }));
        
        res.json(productsWithParsedLinks);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({
            error: 'Gagal mengambil data produk',
            message: error.message
        });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Products.getById(id);
        
        if (!product) {
            return res.status(404).json({
                error: 'Produk tidak ditemukan'
            });
        }

        // Parse marketplace_links
        product.marketplaceLinks = product.marketplace_links 
            ? JSON.parse(product.marketplace_links) 
            : {};
        
        res.json(product);
    } catch (error) {
        console.error('Error getting product by ID:', error);
        res.status(500).json({
            error: 'Gagal mengambil produk',
            message: error.message
        });
    }
};

// Create new product
exports.createProduct = async (req, res) => {
    try {
        const { name, category, price, weight, description, image, marketplaceLinks, discountPercentage, promoStartDate, promoEndDate } = req.body;

        // Validasi
        if (!name || !category || !price) {
            return res.status(400).json({
                error: 'Nama, kategori, dan harga wajib diisi'
            });
        }

        const productData = {
            name: name.trim(),
            category,
            price: parseInt(price),
            weight: parseInt(weight) || 0,
            description: description?.trim() || '',
            image: image || '',
            marketplaceLinks: marketplaceLinks || {},
            discountPercentage: parseInt(discountPercentage) || 0,
            promoStartDate: promoStartDate || null,
            promoEndDate: promoEndDate || null
        };

        const newProduct = await Products.create(productData);
        
        // Parse marketplace_links
        newProduct.marketplaceLinks = newProduct.marketplace_links 
            ? JSON.parse(newProduct.marketplace_links) 
            : {};

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            error: 'Gagal membuat produk',
            message: error.message
        });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, weight, description, image, marketplaceLinks, discountPercentage, promoStartDate, promoEndDate } = req.body;

        // Cek apakah produk ada
        const existingProduct = await Products.getById(id);
        if (!existingProduct) {
            return res.status(404).json({
                error: 'Produk tidak ditemukan'
            });
        }

        // Validasi
        if (!name || !category || !price) {
            return res.status(400).json({
                error: 'Nama, kategori, dan harga wajib diisi'
            });
        }

        const productData = {
            name: name.trim(),
            category,
            price: parseInt(price),
            weight: parseInt(weight) || 0,
            description: description?.trim() || '',
            image: image || '',
            marketplaceLinks: marketplaceLinks || {},
            discountPercentage: parseInt(discountPercentage) || 0,
            promoStartDate: promoStartDate || null,
            promoEndDate: promoEndDate || null
        };

        const updatedProduct = await Products.update(id, productData);
        
        // Parse marketplace_links
        updatedProduct.marketplaceLinks = updatedProduct.marketplace_links 
            ? JSON.parse(updatedProduct.marketplace_links) 
            : {};

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            error: 'Gagal mengupdate produk',
            message: error.message
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Cek apakah produk ada
        const existingProduct = await Products.getById(id);
        if (!existingProduct) {
            return res.status(404).json({
                error: 'Produk tidak ditemukan'
            });
        }

        const deleted = await Products.delete(id);
        
        if (!deleted) {
            return res.status(500).json({
                error: 'Gagal menghapus produk'
            });
        }

        res.json({
            message: 'Produk berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            error: 'Gagal menghapus produk',
            message: error.message
        });
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Products.getByCategory(category);
        
        // Parse marketplace_links
        const productsWithParsedLinks = products.map(product => ({
            ...product,
            marketplaceLinks: product.marketplace_links 
                ? JSON.parse(product.marketplace_links) 
                : {}
        }));
        
        res.json({
            success: true,
            count: productsWithParsedLinks.length,
            data: productsWithParsedLinks
        });
    } catch (error) {
        console.error('Error getting products by category:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal mengambil produk berdasarkan kategori',
            message: error.message
        });
    }
};