const Articles = require('../models/Articles');

// Get all articles (for user)
exports.getAllArticlesUser = async (req, res) => {
    try {
        const articles = await Articles.getAll();
        res.json(articles);
    } catch (error) {
        console.error('Error getting all articles:', error);
        res.status(500).json({
            error: 'Gagal mengambil data artikel',
            message: error.message
        });
    }
};

// Get all articles (for admin)
exports.getAllArticles = async (req, res) => {
    try {
        const articles = await Articles.getAll();
        res.json(articles);
    } catch (error) {
        console.error('Error getting all articles:', error);
        res.status(500).json({
            error: 'Gagal mengambil data artikel',
            message: error.message
        });
    }
};

// Get published articles only (for public)
exports.listPublishedArticles = async (req, res) => {
    try {
        const articles = await Articles.listPublished();
        res.json({
            success: true,
            count: articles.length,
            data: articles
        });
    } catch (error) {
        console.error('Error listing published articles:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal mengambil artikel yang dipublikasi',
            message: error.message
        });
    }
};

// Get article by ID
exports.getArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Articles.getById(id);
        
        if (!article) {
            return res.status(404).json({
                error: 'Artikel tidak ditemukan'
            });
        }
        
        res.json(article);
    } catch (error) {
        console.error('Error getting article by ID:', error);
        res.status(500).json({
            error: 'Gagal mengambil artikel',
            message: error.message
        });
    }
};

exports.getArticleByIdUser = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Articles.getById(id);
        
        if (!article) {
            return res.status(404).json({
                error: 'Artikel tidak ditemukan'
            });
        }
        
        res.json(article);
    } catch (error) {
        console.error('Error getting article by ID:', error);
        res.status(500).json({
            error: 'Gagal mengambil artikel',
            message: error.message
        });
    }
};

// Create new article
exports.createArticle = async (req, res) => {
    try {
        const { title, content, category, status, image, author } = req.body;

        // Validasi
        if (!title || !content || !author) {
            return res.status(400).json({
                error: 'Judul, konten, dan penulis wajib diisi'
            });
        }

        const articleData = {
            title: title.trim(),
            content: content.trim(),
            category: category || 'Pengumuman',
            status: status || 'Draft',
            image: image || '',
            author: author.trim()
        };

        const newArticle = await Articles.create(articleData);
        res.status(201).json(newArticle);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({
            error: 'Gagal membuat artikel',
            message: error.message
        });
    }
};

// Update article
exports.updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, status, image, author } = req.body;

        // Cek apakah artikel ada
        const existingArticle = await Articles.getById(id);
        if (!existingArticle) {
            return res.status(404).json({
                error: 'Artikel tidak ditemukan'
            });
        }

        // Validasi
        if (!title || !content || !author) {
            return res.status(400).json({
                error: 'Judul, konten, dan penulis wajib diisi'
            });
        }

        const articleData = {
            title: title.trim(),
            content: content.trim(),
            category: category || 'Pengumuman',
            status: status || 'Draft',
            image: image || '',
            author: author.trim()
        };

        const updatedArticle = await Articles.update(id, articleData);
        res.json(updatedArticle);
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({
            error: 'Gagal mengupdate artikel',
            message: error.message
        });
    }
};

// Update article status
exports.updateArticleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Cek apakah artikel ada
        const existingArticle = await Articles.getById(id);
        if (!existingArticle) {
            return res.status(404).json({
                error: 'Artikel tidak ditemukan'
            });
        }

        // Validasi status
        if (!['Draft', 'Published'].includes(status)) {
            return res.status(400).json({
                error: 'Status tidak valid. Harus Draft atau Published'
            });
        }

        const updatedArticle = await Articles.updateStatus(id, status);
        res.json(updatedArticle);
    } catch (error) {
        console.error('Error updating article status:', error);
        res.status(500).json({
            error: 'Gagal mengupdate status artikel',
            message: error.message
        });
    }
};

// Delete article
exports.deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        // Cek apakah artikel ada
        const existingArticle = await Articles.getById(id);
        if (!existingArticle) {
            return res.status(404).json({
                error: 'Artikel tidak ditemukan'
            });
        }

        const deleted = await Articles.delete(id);
        
        if (!deleted) {
            return res.status(500).json({
                error: 'Gagal menghapus artikel'
            });
        }

        res.json({
            message: 'Artikel berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({
            error: 'Gagal menghapus artikel',
            message: error.message
        });
    }
};

// Get articles by category
exports.getArticlesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const articles = await Articles.getByCategory(category);
        res.json({
            success: true,
            count: articles.length,
            data: articles
        });
    } catch (error) {
        console.error('Error getting articles by category:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal mengambil artikel berdasarkan kategori',
            message: error.message
        });
    }
};