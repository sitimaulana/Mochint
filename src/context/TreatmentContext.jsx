// src/context/TreatmentContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const TreatmentContext = createContext();

export const useTreatments = () => {
  const context = useContext(TreatmentContext);
  if (!context) {
    throw new Error('useTreatments must be used within a TreatmentProvider');
  }
  return context;
};

export const TreatmentProvider = ({ children }) => {
  const [treatments, setTreatments] = useState([
    {
      id: 'T001',
      name: 'Facial Treatment',
      category: 'Facial',
      duration: '60 min',
      price: 'Rp 250.000',
      description: 'Deep cleansing facial treatment for glowing skin',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop'
    },
    {
      id: 'T002',
      name: 'Body Massage',
      category: 'Massage',
      duration: '90 min',
      price: 'Rp 350.000',
      description: 'Relaxing full body massage with essential oils',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop'
    },
    {
      id: 'T003',
      name: 'Hair Treatment',
      category: 'Hair Care',
      duration: '45 min',
      price: 'Rp 200.000',
      description: 'Nourishing hair treatment for damaged hair',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop'
    },
    {
      id: 'T004',
      name: 'Aromatherapy',
      category: 'Spa',
      duration: '90 min',
      price: 'Rp 400.000',
      description: 'Relaxing aromatherapy session with essential oils',
      image: ''
    },
    {
      id: 'T005',
      name: 'Reflexology',
      category: 'Massage',
      duration: '60 min',
      price: 'Rp 280.000',
      description: 'Foot reflexology for stress relief',
      image: ''
    },
    {
      id: 'T006',
      name: 'Hot Stone Massage',
      category: 'Massage',
      duration: '75 min',
      price: 'Rp 350.000',
      description: 'Therapeutic hot stone massage',
      image: ''
    }
  ]);

  // Format Rupiah helper
  const formatRupiah = (number) => {
    if (!number && number !== 0) return 'Rp 0';
    
    const num = typeof number === 'string' 
      ? parseInt(number.replace(/\D/g, '')) || 0 
      : number;
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Parse Rupiah helper
  const parseRupiah = (formattedString) => {
    if (!formattedString) return 0;
    const numString = formattedString.replace(/[^0-9]/g, '');
    return parseInt(numString) || 0;
  };

  // Add new treatment
  const addTreatment = (treatmentData) => {
    const newId = `T${String(treatments.length + 1).padStart(3, '0')}`;
    const priceValue = parseRupiah(treatmentData.price);
    const formattedPrice = formatRupiah(priceValue);
    
    const newTreatment = {
      id: newId,
      image: '',
      category: treatmentData.category || 'General',
      duration: treatmentData.duration || '60 min',
      ...treatmentData,
      price: formattedPrice
    };
    
    setTreatments(prev => [...prev, newTreatment]);
    return newId;
  };

  // Update treatment
  const updateTreatment = (id, updatedData) => {
    setTreatments(prev =>
      prev.map(treatment => {
        if (treatment.id === id) {
          // Format price if it's being updated
          if (updatedData.price !== undefined) {
            const priceValue = parseRupiah(updatedData.price);
            updatedData.price = formatRupiah(priceValue);
          }
          return { ...treatment, ...updatedData };
        }
        return treatment;
      })
    );
  };

  // Delete treatment
  const deleteTreatment = (id) => {
    setTreatments(prev => prev.filter(treatment => treatment.id !== id));
  };

  // Get treatment by ID
  const getTreatmentById = (id) => {
    return treatments.find(treatment => treatment.id === id);
  };

  // Get treatment by name
  const getTreatmentByName = (name) => {
    return treatments.find(treatment => treatment.name === name);
  };

  // Get treatments by category
  const getTreatmentsByCategory = (category) => {
    if (category === 'all') return treatments;
    return treatments.filter(treatment => treatment.category === category);
  };

  // Search treatments
  const searchTreatments = (searchTerm) => {
    if (!searchTerm) return treatments;
    
    const term = searchTerm.toLowerCase();
    return treatments.filter(treatment => 
      treatment.name.toLowerCase().includes(term) ||
      treatment.category.toLowerCase().includes(term) ||
      treatment.description.toLowerCase().includes(term)
    );
  };

  // Get treatment statistics
  const getTreatmentStats = () => {
    const total = treatments.length;
    const categories = {};
    
    treatments.forEach(treatment => {
      categories[treatment.category] = (categories[treatment.category] || 0) + 1;
    });
    
    return {
      total,
      categories,
      byDuration: treatments.reduce((acc, treatment) => {
        acc[treatment.duration] = (acc[treatment.duration] || 0) + 1;
        return acc;
      }, {})
    };
  };

  // Get all categories
  const getAllCategories = () => {
    const categories = new Set();
    treatments.forEach(treatment => {
      categories.add(treatment.category);
    });
    return Array.from(categories);
  };

  // Get price range
  const getPriceRange = () => {
    if (treatments.length === 0) return { min: 0, max: 0 };
    
    const prices = treatments.map(treatment => parseRupiah(treatment.price));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  return (
    <TreatmentContext.Provider value={{
      // State
      treatments,
      
      // CRUD Operations
      addTreatment,
      updateTreatment,
      deleteTreatment,
      
      // Get Operations
      getTreatmentById,
      getTreatmentByName,
      getTreatmentsByCategory,
      searchTreatments,
      getAllCategories,
      getPriceRange,
      
      // Helper Functions
      formatRupiah,
      parseRupiah,
      getTreatmentStats
    }}>
      {children}
    </TreatmentContext.Provider>
  );
};

export default TreatmentContext;