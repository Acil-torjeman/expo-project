// src/components/admin/users/UserTable.jsx
import React from 'react';
import {
  Box,
  Spinner,
  Flex,
  Text,
  Icon,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Avatar,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiUsers, 
  FiMoreVertical, 
  FiChevronLeft, 
  FiChevronRight,
  FiEye,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiLock,
  FiUnlock,
  FiCheck,
  FiX
} from 'react-icons/fi';
import StatusBadge from '../../common/ui/StatusBadge';
import { UserStatus, getRoleColorScheme } from "../../../constants/roles";

/**
 * Reusable user table component with pagination
 * 
 * @param {Object} props - Component props
 * @param {Array} props.users - Array of user objects to display
 * @param {boolean} props.loading - Whether the table is loading
 * @param {Object} props.pagination - Pagination configuration
 * @param {Array} props.selectedUsers - Array of selected user IDs
 * @param {boolean} props.isAllSelected - Whether all users are selected
 * @param {Function} props.onUserSelect - Function called when a user is selected
 * @param {Function} props.onSelectAll - Function called when all users are selected
 * @param {Function} props.onChangePage - Function called when page changes
 * @param {Function} props.onUserAction - Function called when an action is performed on a user
 * @param {Object} props.emptyStateProps - Configuration for empty state display
 * @param {boolean} props.showSelectColumn - Whether to show selection checkboxes
 */
const UserTable = ({
  users = [],
  loading = false,
  pagination = {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    itemsPerPage: 10,
  },
  selectedUsers = [],
  isAllSelected = false,
  onUserSelect = () => {},
  onSelectAll = () => {},
  onChangePage = () => {},
  onUserAction = () => {},
  emptyStateProps = {
    title: 'No Users Found',
    description: 'No users match your current filters.',
    icon: FiUsers,
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

  // Display loading state
  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text mt={4}>Loading users...</Text>
      </Box>
    );
  }

  // Display empty state if no users
  if (!loading && users.length === 0) {
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
  const endIndex = Math.min(startIndex + pagination.itemsPerPage - 1, pagination.totalUsers);

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
                    isIndeterminate={selectedUsers.length > 0 && !isAllSelected}
                  />
                </Th>
              )}
              <Th>User</Th>
              <Th display={{ base: 'none', md: 'table-cell' }}>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th display={{ base: 'none', lg: 'table-cell' }}>Created</Th>
              <Th isNumeric>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
  {users.map((user) => (
    <Tr 
      key={user._id}
      _hover={{ bg: hoverBgColor }}
      bg={selectedUsers.includes(user._id) ? useColorModeValue('teal.50', 'rgba(56, 178, 172, 0.1)') : 'transparent'}
    >
      {showSelectColumn && (
        <Td px={3}>
          <Checkbox
            isChecked={selectedUsers.includes(user._id)}
            onChange={() => onUserSelect(user._id)}
            colorScheme="teal"
          />
        </Td>
      )}
      <Td>
        <Flex align="center">
          <Avatar 
            size="sm" 
            name={user.username} 
            src={user.avatar} 
            mr={3}
            bg={`${getRoleColorScheme(user.role)}.500`}
          />
          <Box>
            <Text fontWeight="medium">{user.username}</Text>
            <Text fontSize="xs" color="gray.500" display={{ base: 'block', md: 'none' }}>
              {user.email}
            </Text>
          </Box>
        </Flex>
      </Td>
      <Td display={{ base: 'none', md: 'table-cell' }}>
        <Text fontSize="sm">{user.email}</Text>
      </Td>
      <Td>
        <StatusBadge 
          status={user.role}
          customConfig={{
            colorScheme: getRoleColorScheme(user.role),
            tooltip: `${user.role} user`
          }}
          showIcon={false}
        />
      </Td>
      <Td>
        <StatusBadge status={user.status} />
      </Td>
      <Td display={{ base: 'none', lg: 'table-cell' }}>
        <Flex align="center" fontSize="sm" color="gray.600">
          <FiCalendar style={{ marginRight: '4px' }} />
          {formatDate(user.createdAt)}
        </Flex>
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
            
            {user.status === UserStatus.ACTIVE ? (
              <MenuItem 
                icon={<FiLock />} 
                onClick={() => onUserAction('status', { ...user, newStatus: UserStatus.INACTIVE })}
              >
                Deactivate
              </MenuItem>
            ) : user.status === UserStatus.INACTIVE ? (
              <MenuItem 
                icon={<FiUnlock />} 
                onClick={() => onUserAction('status', { ...user, newStatus: UserStatus.ACTIVE })}
              >
                Activate
              </MenuItem>
            ) : user.status === UserStatus.PENDING ? (
              <>
                <MenuItem 
                  icon={<FiCheck />} 
                  onClick={() => onUserAction('status', { ...user, newStatus: UserStatus.ACTIVE })}
                >
                  Approve
                </MenuItem>
                <MenuItem 
                  icon={<FiX />} 
                  onClick={() => onUserAction('status', { ...user, newStatus: UserStatus.REJECTED })}
                >
                  Reject
                </MenuItem>
              </>
            ) : null}
            
            <MenuItem 
              icon={<FiTrash2 />} 
              color="red.500" 
              onClick={() => onUserAction('delete', user)}
            >
              Move to Trash
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
          Showing {startIndex}-{endIndex} of {pagination.totalUsers} users
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

export default UserTable;