// src/components/common/ui/Table.jsx
import {
  Box,
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Text,
  IconButton,
  HStack,
  Icon,
  useColorModeValue,
  Checkbox,
  Spinner,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiClock, FiCheck, FiX } from 'react-icons/fi';

/**
 * Reusable table component with pagination, selection, and loading states
 * @param {Object} props - Component props
 * @param {Array} props.columns - Table column configuration
 * @param {Array} props.data - Table data to display
 * @param {boolean} props.loading - Whether the table is loading data
 * @param {Object} props.pagination - Pagination configuration
 * @param {Function} props.onChangePage - Function called when page changes
 * @param {Array} props.selectedItems - Array of selected item IDs
 * @param {boolean} props.isAllSelected - Whether all items are selected
 * @param {Function} props.onSelectItem - Function called when an item is selected
 * @param {Function} props.onSelectAll - Function called when all items are selected
 * @param {Object} props.emptyState - Configuration for empty state display
 * @param {boolean} props.showSelection - Whether to show selection checkboxes
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  pagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  },
  onChangePage = () => {},
  selectedItems = [],
  isAllSelected = false,
  onSelectItem = () => {},
  onSelectAll = () => {},
  emptyState = {
    title: 'No Data Found',
    description: 'No data available for the current filters.',
    icon: null,
    actionButton: null,
  },
  showSelection = true,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Function to render a table cell
  const renderCell = (column, item) => {
    if (column.render) {
      return column.render(item);
    }
    
    return item[column.accessor];
  };
  
  // Display loading state
  if (loading) {
    return (
      <Box overflowX="auto">
        <ChakraTable>
          <Thead>
            <Tr>
              {showSelection && <Th width="40px"></Th>}
              {columns.map(column => (
                <Th key={column.accessor}>{column.header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td colSpan={columns.length + (showSelection ? 1 : 0)} textAlign="center" py={10}>
                <Flex direction="column" align="center" justify="center">
                  <Spinner size="lg" color="teal.500" mb={4} />
                  <Text>Loading...</Text>
                </Flex>
              </Td>
            </Tr>
          </Tbody>
        </ChakraTable>
      </Box>
    );
  }
  
  // Display empty state
  if (!loading && data.length === 0) {
    return (
      <Box overflowX="auto">
        <ChakraTable>
          <Thead>
            <Tr>
              {showSelection && <Th width="40px"></Th>}
              {columns.map(column => (
                <Th key={column.accessor}>{column.header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td colSpan={columns.length + (showSelection ? 1 : 0)} textAlign="center" py={10}>
                <Flex direction="column" align="center" justify="center">
                  {emptyState.icon && <Icon as={emptyState.icon} boxSize={12} color="gray.400" mb={4} />}
                  <Text fontSize="lg" fontWeight="semibold" mb={2}>{emptyState.title}</Text>
                  <Text color="gray.500" maxW="md" mb={4}>{emptyState.description}</Text>
                  {emptyState.actionButton}
                </Flex>
              </Td>
            </Tr>
          </Tbody>
        </ChakraTable>
      </Box>
    );
  }
  
  // Calculate pagination info
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const endIndex = Math.min(startIndex + pagination.itemsPerPage - 1, pagination.totalItems);
  
  return (
    <Box>
      <Box overflowX="auto" maxWidth="100%">
        <ChakraTable size="md" variant="simple">
          <Thead>
            <Tr>
              {showSelection && (
                <Th width="56px" px={3}>
                  <Checkbox
                    isChecked={isAllSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    colorScheme="teal"
                    isIndeterminate={selectedItems.length > 0 && !isAllSelected}
                  />
                </Th>
              )}
              {columns.map(column => (
                <Th 
                  key={column.accessor} 
                  display={column.responsive ? { base: column.responsive.base, [column.responsive.breakpoint]: 'table-cell' } : undefined}
                  isNumeric={column.isNumeric}
                  width={column.width}
                >
                  {column.header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item) => (
              <Tr key={item._id || item.id}>
                {showSelection && (
                  <Td px={3}>
                    <Checkbox
                      isChecked={selectedItems.includes(item._id || item.id)}
                      onChange={() => onSelectItem(item._id || item.id)}
                      colorScheme="teal"
                    />
                  </Td>
                )}
                {columns.map(column => (
                  <Td 
                    key={`${item._id || item.id}-${column.accessor}`}
                    display={column.responsive ? { base: column.responsive.base, [column.responsive.breakpoint]: 'table-cell' } : undefined}
                    isNumeric={column.isNumeric}
                  >
                    {renderCell(column, item)}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </ChakraTable>
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
        <HStack>
          <IconButton
            icon={<FiChevronLeft />}
            size="sm"
            variant="ghost"
            isDisabled={pagination.currentPage === 1}
            onClick={() => onChangePage(pagination.currentPage - 1)}
            aria-label="Previous page"
          />
          <Text fontSize="sm">
            Page {pagination.currentPage} of {pagination.totalPages}
          </Text>
          <IconButton
            icon={<FiChevronRight />}
            size="sm"
            variant="ghost"
            isDisabled={pagination.currentPage === pagination.totalPages}
            onClick={() => onChangePage(pagination.currentPage + 1)}
            aria-label="Next page"
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Table;