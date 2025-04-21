// src/context/SearchContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper function to get current context from URL
  const getCurrentContext = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/admin/accounts')) return 'accounts';
    if (path.includes('/admin/trash')) return 'trash';
    if (path.includes('/admin/messages')) return 'messages';
    if (path.includes('/admin/notifications')) return 'notifications';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  }, [location.pathname]);
  
  // Get API endpoint based on context
  const getApiEndpoint = useCallback((query) => {
    const context = getCurrentContext();
    switch (context) {
      case 'accounts':
        return `/users?search=${encodeURIComponent(query)}`;
      case 'trash':
        return `/users/trash?search=${encodeURIComponent(query)}`;
      case 'messages':
        return `/messages?search=${encodeURIComponent(query)}`;
      case 'notifications':
        return `/notifications?search=${encodeURIComponent(query)}`;
      default:
        return `/search?query=${encodeURIComponent(query)}`;
    }
  }, [getCurrentContext]);
  
  // Get placeholder text based on context
  const getPlaceholderText = useCallback(() => {
    const context = getCurrentContext();
    switch (context) {
      case 'accounts':
        return 'Search users by name, email...';
      case 'trash':
        return 'Search deleted items...';
      case 'messages':
        return 'Search messages...';
      case 'notifications':
        return 'Search notifications...';
      case 'settings':
        return 'Search settings...';
      default:
        return 'Search...';
    }
  }, [getCurrentContext]);
  
  // Get no results message based on context
  const getNoResultsMessage = useCallback(() => {
    const context = getCurrentContext();
    switch (context) {
      case 'accounts':
        return 'No users found';
      case 'trash':
        return 'No deleted items found';
      case 'messages':
        return 'No messages found';
      case 'notifications':
        return 'No notifications found';
      default:
        return 'No results found';
    }
  }, [getCurrentContext]);
  
  // Handle search query
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Get the appropriate API endpoint for the current context
      const endpoint = getApiEndpoint(query);
      
      // Create API instance with auth
      const api = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
      });
      
      // Make the request
      const response = await api.get(endpoint);
      
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [getApiEndpoint]);
  
  // Debounced search with timeout
  const debouncedSearch = useCallback((query) => {
    // Clear any existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Set a new timeout
    window.searchTimeout = setTimeout(() => {
      handleSearch(query);
    }, 300);
  }, [handleSearch]);
  
  // Navigate to search result
  const navigateToResult = useCallback((result) => {
    setShowResults(false);
    setSearchQuery('');
    
    const context = getCurrentContext();
    
    if (context === 'accounts' && result._id) {
      navigate(`/admin/accounts/${result._id}`);
    } else if (context === 'trash') {
      // No navigation for trash items
    } else if (context === 'messages' && result._id) {
      navigate(`/admin/messages/${result._id}`);
    } else if (context === 'notifications' && result._id) {
      navigate(`/admin/notifications/${result._id}`);
    } else if (context === 'settings' && result.section) {
      navigate(`/admin/settings/${result.section}`);
    } else {
      // Default navigation based on result type
      if (result.type === 'user' && result._id) {
        navigate(`/admin/accounts/${result._id}`);
      } else if (result.type === 'event' && result._id) {
        navigate(`/admin/events/${result._id}`);
      }
    }
  }, [getCurrentContext, navigate]);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
    
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
  }, []);
  
  // Toggle showing results
  const toggleResults = useCallback((show) => {
    setShowResults(show);
  }, []);
  
  // Value object provided by context
  const contextValue = {
    searchQuery,
    isSearching,
    showResults,
    searchResults,
    handleSearch,
    debouncedSearch,
    navigateToResult,
    clearSearch,
    toggleResults,
    getPlaceholderText,
    getNoResultsMessage,
    getCurrentContext,
  };
  
  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}