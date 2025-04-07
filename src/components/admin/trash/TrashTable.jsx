// src/components/admin/trash/TrashTable.jsx
import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Text,
  IconButton,
  Avatar,
  Badge,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Icon,
  Tag,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiTrash2, 
  FiCalendar, 
  FiChevronLeft, 
  FiChevronRight, 
  FiMoreVertical,
  FiRotateCcw,
  FiTrash
} from 'react-icons/fi';
import StatusBadge from '../../common/ui/StatusBadge';
import { getRoleColorScheme } from '../../../constants/roles';

/**
 * Table component for displaying deleted items in trash
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of deleted items
 * @param {boolean} props.loading - Whether the table is loading
 * @param {Object} props.pagination - Pagination configuration
 * @param {Array} props.selectedItems - Array of selected item IDs
 * @param {boolean} props.isAllSelected - Whether all items are selected
 * @param {Function} props.onItemSelect - Function called when an item is selected
 * @param {Function} props.onSelectAll - Function called when all items are selected
 * @param {Function} props.onChangePage - Function called when page changes
 * @param {Function} props.onItemAction - Function called when an action is performed on an item
 * @param {Object} props.emptyStateProps - Configuration for empty state display
 * @param {boolean} props.showSelectColumn - Whether to show selection checkboxes
 */
const TrashTable = ({
  items = [],
  loading = false,
  pagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  selectedItems = [],
  isAllSelected = false,
  onItemSelect = () => {},
  onSelectAll = () => {},
  onChangePage = () => {},
  onItemAction = () => {},
  emptyStateProps = {
    title: 'Trash is Empty',
    description: 'No items in trash match your current filters.',
    icon: FiTrash2,
    actionButton: null,
  },
  showSelectColumn = true,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString();
  };
  
  // Determine tag color based on days remaining
  const getTimeRemainingColor = (daysRemaining) => {
    if (daysRemaining <= 3) return 'red';
    if (daysRemaining <= 7) return 'orange';
    return 'gray';
  };

  // Display loading state
  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text mt={4}>Loading trashed items...</Text>
      </Box>
    );
  }

  // Display empty state if no items
  if (!loading && items.length === 0) {
    return (
      <Flex 
        direction="column" 
        align="center" 
        justify="center" 
        py={10} 
        px={4}
        textAlign="center"
      >
        <Icon as={emptyStateProps.icon} boxSize={12} color="gray.400" mb={4} />
        <Text fontSize="lg" fontWeight="semibold" mb={2}>{emptyStateProps.title}</Text>
        <Text color="gray.500" maxW="md" mb={4}>
          {emptyStateProps.description}
        </Text>
        {emptyStateProps.actionButton}
      </Flex>
    );
  }

  // Calculate pagination info
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const endIndex = Math.min(startIndex + pagination.itemsPerPage - 1, pagination.totalItems);

  return (
    <Box>
      <Box overflowX="auto" maxWidth="100%">
        <Table size="md" variant="simple">
          <Thead>
            <Tr>
              {showSelectColumn && (
                <Th width="56px" px={3}>
                  <Checkbox
                    isChecked={isAllSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    colorScheme="teal"
                    isIndeterminate={selectedItems.length > 0 && !isAllSelected}
                  />
                </Th>
              )}
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Deleted On</Th>
              <Th>Time Remaining</Th>
              <Th isNumeric>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map((item) => (
              <Tr 
                key={item._id}
                _hover={{ bg: hoverBgColor }}
                bg={selectedItems.includes(item._id) ? useColorModeValue('teal.50', 'rgba(56, 178, 172, 0.1)') : 'transparent'}
              >
                {showSelectColumn && (
                  <Td px={3}>
                    <Checkbox
                      isChecked={selectedItems.includes(item._id)}
                      onChange={() => onItemSelect(item._id)}
                      colorScheme="teal"
                    />
                  </Td>
                )}
                <Td>
                  <Flex align="center">
                    <Avatar 
                      size="sm" 
                      name={item.username || item.name} 
                      src={item.avatar} 
                      mr={3}
                      bg={getRoleColorScheme(item.role) + '.500'}
                    />
                    <Box>
                      <Text fontWeight="medium">{item.username || item.name}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {item.email}
                      </Text>
                    </Box>
                  </Flex>
                </Td>
                <Td>
                  <StatusBadge 
                    status={item.role}
                    customConfig={{
                      colorScheme: getRoleColorScheme(item.role),
                      tooltip: `${item.role} user`
                    }}
                    showIcon={false}
                  />
                </Td>
                <Td>
                  <Flex align="center" fontSize="sm" color="gray.600">
                    <FiCalendar style={{ marginRight: '4px' }} />
                    {formatDate(item.deletedAt)}
                  </Flex>
                </Td>
                <Td>
                  <Tag 
                    colorScheme={getTimeRemainingColor(item.daysRemaining)} 
                    size="sm"
                    borderRadius="full"
                  >
                    {item.daysRemaining} days
                  </Tag>
                </Td>
                <Td isNumeric>
                  <Menu>
                    <MenuButton
                      as={Button}
                      size="sm"
                      variant="ghost"
                      _hover={{ bg: 'transparent' }}
                      rightIcon={<FiMoreVertical />}
                    >
                      Actions
                    </MenuButton>
                    
                    <MenuList minWidth="170px">
                      <MenuItem 
                        icon={<FiRotateCcw />} 
                        onClick={() => onItemAction('restore', item)}
                      >
                        Restore
                      </MenuItem>
                      
                      <MenuItem 
                        icon={<FiTrash />} 
                        color="red.500" 
                        onClick={() => onItemAction('delete', item)}
                      >
                        Delete Permanently
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      
      {/* Pagination */}
      <Flex 
        justify="space-between" 
        align="center" 
        p={4} 
        borderTop="1px" 
        borderColor={borderColor}
      >
        <Text fontSize="sm" color="gray.600">
          Showing {startIndex}-{endIndex} of {pagination.totalItems} items
        </Text>
        <Flex>
          <IconButton
            icon={<FiChevronLeft />}
            size="sm"
            variant="ghost"
            isDisabled={pagination.currentPage === 1}
            onClick={() => onChangePage(pagination.currentPage - 1)}
            aria-label="Previous page"
            mr={2}
          />
          <Text fontSize="sm" alignSelf="center" mx={2}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </Text>
          <IconButton
            icon={<FiChevronRight />}
            size="sm"
            variant="ghost"
            isDisabled={pagination.currentPage === pagination.totalPages}
            onClick={() => onChangePage(pagination.currentPage + 1)}
            aria-label="Next page"
            ml={2}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default TrashTable;