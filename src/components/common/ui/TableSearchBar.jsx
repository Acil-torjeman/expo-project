// src/components/common/ui/TableSearchBar.jsx
import React, { useState, useEffect } from 'react';
import {
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';

/**
 * Simple search component for filtering tables
 * @param {Object} props
 * @param {string} props.placeholder - Placeholder text for the search input
 * @param {function} props.onSearch - Function to call when search value changes
 * @param {string} props.value - Current search value
 */
const TableSearchBar = ({ placeholder = "Search...", onSearch, value = "" }) => {
  const [searchText, setSearchText] = useState(value);
  
  // UI colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  
  // Sync internal state with external value
  useEffect(() => {
    setSearchText(value);
  }, [value]);
  
  // Handle search input change with 300ms debounce
  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchText(newValue);
    
    // Clear any existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Set a new debounce timeout
    window.searchTimeout = setTimeout(() => {
      onSearch(newValue);
    }, 300);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchText("");
    onSearch("");
    
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
  };

  return (
    <InputGroup size="md">
      <InputLeftElement pointerEvents="none">
        <Icon as={FiSearch} color="gray.500" />
      </InputLeftElement>
      <Input
        placeholder={placeholder}
        value={searchText}
        onChange={handleSearchChange}
        bg={bgColor}
        borderRadius="md"
        borderColor={borderColor}
        _placeholder={{ color: placeholderColor }}
        _hover={{ borderColor: 'teal.500' }}
        _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)' }}
        pr={searchText ? "2.5rem" : "1rem"}
      />
      {searchText && (
        <InputGroup>
          <Input
            position="absolute"
            right="8px"
            top="50%"
            transform="translateY(-50%)"
            as={Icon}
            aria-label="Clear search"
            icon={FiX}
            h="1.5rem"
            w="1.5rem"
            cursor="pointer"
            zIndex="1"
            onClick={clearSearch}
            bg="transparent"
            border="none"
            _hover={{ color: 'teal.500' }}
          />
        </InputGroup>
      )}
    </InputGroup>
  );
};

export default TableSearchBar;