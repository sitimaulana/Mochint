import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowRight } from 'lucide-react';
import axios from 'axios';

// Import komponen detail
import ProductDetail from './ProductDetail';

const Product = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Default tab 'All Products' agar menampilkan semua di awal
  const [activeTab, setActiveTab] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Urutan kategori yang diinginkan
  const categories = ['All Products', 'Acne', 'Brightening', 'Best Seller', 'Other'];

  const API_URL = 'http://localhost:5000/api/products';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        setProducts(response.data);
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleShowDetail = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // LOGIKA FILTER OTOMATIS
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Jika tab 'All Products' aktif, tampilkan SEMUA produk yang cocok dengan pencarian
    if (activeTab === 'All Products') {
      return matchesSearch;
    }
    
    // Jika tab kategori lain diklik, tampilkan yang kategorinya COCOK + cocok dengan pencarian
    return product.category === activeTab && matchesSearch;
  });

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans font-bold text-[#8D6E63]">
      Mempersiapkan Produk Kecantikan...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 font-sans text-[#3E2723]">
      <div className="container mx-auto px-6 pt-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <nav className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#8D6E63] font-sans">
            <button onClick={() => navigate('/')} className="hover:text-[#5D4037] transition-colors">
              <Home size={18} />
            </button>
            <span className="text-gray-300">/</span>
            <span>Skincare</span>
          </nav>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari produk kecantikan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-[#8D6E63]/20 focus:border-[#8D6E63] shadow-sm font-sans text-sm transition-all"
            />
            <Search className="absolute right-4 top-4 text-[#8D6E63]" size={18} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-12 overflow-x-auto no-scrollbar bg-white/50 rounded-t-2xl px-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex-1 min-w-fit py-5 text-sm font-display font-bold transition-all px-8 border-b-4 tracking-tight ${
                activeTab === cat 
                  ? 'text-[#5D4037] border-[#8D6E63]' 
                  : 'text-gray-400 border-transparent hover:text-[#8D6E63]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product._id || product.id} className="bg-white rounded-[35px] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-[0_20px_50px_rgba(141,110,99,0.15)] transition-all duration-500">
                <div className="aspect-[4/5] bg-[#FDFBF7] flex items-center justify-center p-8 relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-h-full w-auto object-contain group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-tighter text-[#8D6E63] font-sans">{product.category}</p>
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="text-[#3E2723] font-display font-bold text-base mb-6 h-12 leading-tight overflow-hidden tracking-tight">
                    {product.name}
                  </h3>
                  
                  <button 
                    onClick={() => handleShowDetail(product)}
                    className="w-full flex items-center justify-between bg-white border-2 border-[#8D6E63] text-[#8D6E63] rounded-2xl px-5 py-3 hover:bg-[#8D6E63] hover:text-white transition-all duration-300 group/btn shadow-sm"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[10px] font-black uppercase opacity-60 font-sans tracking-widest leading-none mb-1">Harga</span>
                      <span className="text-sm font-display font-bold">
                        Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                      </span>
                    </div>
                    <div className="bg-[#8D6E63] group-hover:bg-white p-2 rounded-xl transition-colors">
                        <ArrowRight size={18} className="text-white group-hover:text-[#8D6E63] transition-transform group-hover/btn:translate-x-1" />
                    </div>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="font-sans text-gray-400 italic">Produk tidak ditemukan di kategori ini...</p>
            </div>
          )}
        </div>
      </div>

      <ProductDetail 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  );
};

export default Product;