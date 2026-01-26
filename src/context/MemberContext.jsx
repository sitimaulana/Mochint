// src/context/MemberContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { memberAPI } from '../services/api';

const MemberContext = createContext();

export const useMembers = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMembers must be used within a MemberProvider');
  }
  return context;
};

export const MemberProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- LOGIKA DATABASE (DARI ANDA) ---

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await memberAPI.getAll();
      if (response.data.success) {
        setMembers(response.data.data || []);
      } else {
        throw new Error(response.data.error || 'Failed to fetch members');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = async (memberData) => {
    try {
      const response = await memberAPI.create(memberData);
      if (response.data.success) {
        await fetchMembers(); 
        return response.data.data;
      }
    } catch (err) {
      throw err;
    }
  };

  const updateMember = async (id, memberData) => {
    try {
      const response = await memberAPI.update(id, memberData);
      if (response.data.success) {
        await fetchMembers();
        return response.data.data;
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteMember = async (id) => {
    try {
      const response = await memberAPI.delete(id);
      if (response.data.success) {
        await fetchMembers();
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  // --- LOGIKA PENCARIAN & STATISTIK (DARI TEMAN) ---

  const getMemberStats = () => {
    const total = members.length;
    const active = members.filter(m => m.status === 'active').length;
    const totalVisits = members.reduce((sum, m) => sum + (m.totalVisits || 0), 0);
    return { total, active, totalVisits };
  };

  const searchMembers = (searchTerm) => {
    if (!searchTerm) return members;
    const term = searchTerm.toLowerCase();
    return members.filter(m => 
      m.name?.toLowerCase().includes(term) || 
      m.phone?.includes(term)
    );
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <MemberContext.Provider value={{
      members,
      loading,
      error,
      stats: getMemberStats(),
      fetchMembers,
      addMember,
      updateMember,
      deleteMember,
      searchMembers,
      getMemberStats
    }}>
      {children}
    </MemberContext.Provider>
  );
};