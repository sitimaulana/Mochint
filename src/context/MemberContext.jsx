// src/context/MemberContext.jsx - SIMPLIFIED
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

  // Fetch all members from database
  const fetchMembers = useCallback(async () => {
    console.log('🔄 Fetching members...');
    setLoading(true);
    setError(null);
    try {
      const response = await memberAPI.getAll();
      console.log('📡 API Response:', response);
      
      if (response.data.success) {
        setMembers(response.data.data || []);
        console.log(`✅ Loaded ${response.data.data?.length || 0} members`);
      } else {
        throw new Error(response.data.error || 'Failed to fetch members');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch members');
      console.error('❌ Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new member
  const addMember = async (memberData) => {
    setLoading(true);
    try {
      const response = await memberAPI.create(memberData);
      if (response.data.success) {
        await fetchMembers(); // Refresh
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to add member');
      }
    } catch (err) {
      console.error('Error adding member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update member
  const updateMember = async (id, memberData) => {
    setLoading(true);
    try {
      const response = await memberAPI.update(id, memberData);
      if (response.data.success) {
        await fetchMembers(); // Refresh
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to update member');
      }
    } catch (err) {
      console.error('Error updating member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete member
  const deleteMember = async (id) => {
    setLoading(true);
    try {
      const response = await memberAPI.delete(id);
      if (response.data.success) {
        await fetchMembers(); // Refresh
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to delete member');
      }
    } catch (err) {
      console.error('Error deleting member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch on initial load
  useEffect(() => {
    console.log('🚀 Initializing MemberContext...');
    fetchMembers();
  }, [fetchMembers]);

  return (
    <MemberContext.Provider value={{
      members,
      loading,
      error,
      fetchMembers,
      addMember,
      updateMember,
      deleteMember,
    }}>
      {children}
    </MemberContext.Provider>
  );
};