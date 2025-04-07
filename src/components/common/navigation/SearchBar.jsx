// src/components/common/navigation/SearchBar.jsx - mise à jour des avatars
import React, { useState, useRef, useEffect } from 'react';
import {
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  Box,
  VStack,
  Text,
  Kbd,
  useColorModeValue,
  List,
  ListItem,
  Avatar,
  Flex,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { FiSearch, FiUser, FiCalendar, FiGrid, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../../../context/SearchContext';
import { getRoleColorScheme } from '../../../constants/roles';
import StatusBadge from '../../common/ui/StatusBadge';

/**
 * Global search component with context-aware results
 */
const SearchBar = () => {
  const {
    searchQuery,
    isSearching,
    showResults,
    searchResults,
    debouncedSearch,
    navigateToResult,
    toggleResults,
    getPlaceholderText,
    getNoResultsMessage,
    getCurrentContext,
  } = useSearch();
  
  const [query, setQuery] = useState(searchQuery);
  const inputRef = useRef(null);
  
  // UI colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  // Handle keyboard shortcut (Ctrl+K/Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Close on escape
      if (e.key === 'Escape' && showResults) {
        toggleResults(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResults, toggleResults]);
  
  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        toggleResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [toggleResults]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      toggleResults(false);
    }
  };
  
  // Get current context for rendering
  const currentContext = getCurrentContext();
  
  // Render result item based on context and result type
  const renderResultItem = (result) => {
    if (currentContext === 'accounts' || (result.role && result.email)) {
      // User result
      return (
        <Flex align="center">
          <Avatar 
            size="sm" 
            name={result.username || result.name} 
            src={result.avatar} 
            mr={3}
            bg={`${getRoleColorScheme(result.role)}.500`}
          />
          <Box ml={3}>
            <Text fontWeight="medium">{result.username || result.name}</Text>
            <Flex align="center" mt={1}>
              <Text fontSize="xs" color="gray.500">{result.email}</Text>
              {result.status && (
                <StatusBadge 
                  status={result.status}
                  ml={2}
                  showIcon={false}
                />
              )}
            </Flex>
          </Box>
        </Flex>
      );
    }
    
    if (currentContext === 'trash') {
      // Deleted item result
      return (
        <Flex align="center">
          <Flex 
            align="center" 
            justify="center" 
            borderRadius="md" 
            bg="red.50" 
            color="red.500" 
            p={2}
          >
            <Icon as={FiTrash2} />
          </Flex>
          <Box ml={3}>
            <Text fontWeight="medium">{result.username || result.name}</Text>
            <Flex align="center" mt={1}>
              <Text fontSize="xs" color="gray.500">{result.deletedAt ? new Date(result.deletedAt).toLocaleDateString() : ''}</Text>
              {result.daysRemaining !== undefined && (
                <Badge 
                  ml={2} 
                  size="sm" 
                  colorScheme={result.daysRemaining <= 7 ? 'red' : 'gray'}
                  fontSize="xx-small"
                  variant="subtle"
                  borderRadius="full"
                >
                  {result.daysRemaining} days left
                </Badge>
              )}
            </Flex>
          </Box>
        </Flex>
      );
    }
    
    // Default rendering for other types
    if (result.type === 'event' || result.startDate) {
      return (
        <Flex align="center">
          <Flex 
            align="center" 
            justify="center" 
            borderRadius="md" 
            bg="teal.50" 
            color="teal.500" 
            p={2}
          >
            <Icon as={FiCalendar} />
          </Flex>
          <Box ml={3}>
            <Text fontWeight="medium">{result.title || result.name}</Text>
            <Text fontSize="xs" color="gray.500">
              {result.startDate ? new Date(result.startDate).toLocaleDateString() : ''}
            </Text>
          </Box>
        </Flex>
      );
    }
    
    // Generic item result
    return (
      <Flex align="center">
        <Flex 
          align="center" 
          justify="center" 
          borderRadius="md" 
          bg="blue.50" 
          color="blue.500" 
          p={2}
        >
          <Icon as={FiGrid} />
        </Flex>
        <Box ml={3}>
          <Text fontWeight="medium">{result.title || result.name}</Text>
          {result.description && (
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {result.description}
            </Text>
          )}
        </Box>
      </Flex>
    );
  };
  
  return (
    <Box position="relative" width="100%" ref={inputRef}>
      <InputGroup size="md">
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color="teal.500" />
        </InputLeftElement>
        <Input
          placeholder={getPlaceholderText()}
          value={query}
          onChange={handleSearchChange}
          onFocus={() => query && toggleResults(true)}
          bg={bgColor}
          borderRadius="full"
          borderColor={borderColor}
          _placeholder={{ color: placeholderColor }}
          _hover={{ borderColor: 'teal.500' }}
          _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)' }}
          pr="4.5rem"
        />
        <Box
          position="absolute"
          right="12px"
          top="50%"
          transform="translateY(-50%)"
          pointerEvents="none"
        >
          <Kbd fontSize="xs" bg="gray.100" color="gray.500">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+K
          </Kbd>
        </Box>
      </InputGroup>
      
      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              position="absolute"
              top="calc(100% + 8px)"
              left="0"
              right="0"
              bg={bgColor}
              borderRadius="md"
              boxShadow="lg"
              borderWidth="1px"
              borderColor={borderColor}
              zIndex="10"
              maxH="350px"
              overflowY="auto"
              py={2}
            >
              {isSearching ? (
                <VStack spacing={2} p={4} align="center">
                  <Spinner size="sm" color="teal.500" />
                  <Text fontSize="sm" color="gray.500">Searching...</Text>
                </VStack>
              ) : searchResults.length > 0 ? (
                <List spacing={1}>
                  {searchResults.map((result, index) => (
                    <ListItem 
                      key={`${result._id || index}`}
                      px={3}
                      py={2}
                      cursor="pointer"
                      borderRadius="md"
                      _hover={{ bg: hoverBgColor }}
                      onClick={() => navigateToResult(result)}
                    >
                      {renderResultItem(result)}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <VStack spacing={2} p={4} align="center">
                  <Text fontSize="sm" color="gray.500">{getNoResultsMessage()}</Text>
                </VStack>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SearchBar;