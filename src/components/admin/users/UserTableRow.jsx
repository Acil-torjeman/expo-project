// src/components/admin/users/UserTableRow.jsx
import React from 'react';
import {
  Tr,
  Td,
  Avatar,
  Text,
  Checkbox,
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiMoreVertical, 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiCalendar, 
  FiCheck, 
  FiX,
  FiLock,
  FiUnlock
} from 'react-icons/fi';
import StatusBadge from '../../common/ui/StatusBadge';
import { UserStatus, getRoleColorScheme } from "../../../constants/roles";

/**
 * Component for rendering a single user row in user management tables
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @param {boolean} props.isSelected - Whether the user is selected
 * @param {Function} props.onSelect - Function called when user is selected
 * @param {Function} props.onAction - Function called when action is performed on user
 * @param {boolean} props.showSelectColumn - Whether to show selection checkbox
 * @param {boolean} props.showEmail - Whether to show email column
 */
const UserTableRow = ({ 
  user, 
  isSelected = false, 
  onSelect, 
  onAction,
  showSelectColumn = true,
  showEmail = true
}) => {
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  if (!user) return null;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString();
  };
  
  return (
    <Tr 
      _hover={{ bg: hoverBgColor }}
      bg={isSelected ? useColorModeValue('teal.50', 'rgba(56, 178, 172, 0.1)') : 'transparent'}
    >
      {/* Selection checkbox */}
      {showSelectColumn && (
        <Td px={3}>
          <Checkbox
            isChecked={isSelected}
            onChange={() => onSelect(user._id)}
            colorScheme="teal"
          />
        </Td>
      )}
      
      {/* User name and avatar */}
      <Td>
        <Flex align="center">
          <Avatar 
            size="sm" 
            name={user.username} 
            src={user.avatar} 
            mr={3}
            bg={getRoleColorScheme(user.role) + '.500'}
          />
          <Box>
            <Text fontWeight="medium">{user.username}</Text>
            <Text fontSize="xs" color="gray.500" display={{ base: 'block', md: 'none' }}>
              {user.email}
            </Text>
          </Box>
        </Flex>
      </Td>
      
      {/* Email address */}
      {showEmail && (
        <Td display={{ base: 'none', md: 'table-cell' }}>
          <Text fontSize="sm">{user.email}</Text>
        </Td>
      )}
      
      {/* User role */}
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
      
      {/* User status */}
      <Td>
        <StatusBadge status={user.status} />
      </Td>
      
      {/* Created date */}
      <Td display={{ base: 'none', lg: 'table-cell' }}>
        <Flex align="center" fontSize="sm" color="gray.600">
          <FiCalendar style={{ marginRight: '4px' }} />
          {formatDate(user.createdAt)}
        </Flex>
      </Td>
      
      {/* Actions */}
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
            <MenuItem icon={<FiEye />} onClick={() => onAction('view', user)}>
              View Details
            </MenuItem>
            
            <MenuItem icon={<FiEdit />} onClick={() => onAction('edit', user)}>
              Edit
            </MenuItem>
            
            {user.status === UserStatus.ACTIVE ? (
              <MenuItem 
                icon={<FiLock />} 
                onClick={() => onAction('status', { ...user, newStatus: UserStatus.INACTIVE })}
              >
                Deactivate
              </MenuItem>
            ) : user.status === UserStatus.INACTIVE ? (
              <MenuItem 
                icon={<FiUnlock />} 
                onClick={() => onAction('status', { ...user, newStatus: UserStatus.ACTIVE })}
              >
                Activate
              </MenuItem>
            ) : user.status === UserStatus.PENDING ? (
              <>
                <MenuItem 
                  icon={<FiCheck />} 
                  onClick={() => onAction('status', { ...user, newStatus: UserStatus.ACTIVE })}
                >
                  Approve
                </MenuItem>
                <MenuItem 
                  icon={<FiX />} 
                  onClick={() => onAction('status', { ...user, newStatus: UserStatus.REJECTED })}
                >
                  Reject
                </MenuItem>
              </>
            ) : null}
            
            <MenuItem 
              icon={<FiTrash2 />} 
              color="red.500" 
              onClick={() => onAction('delete', user)}
            >
              Move to Trash
            </MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
};

export default UserTableRow;