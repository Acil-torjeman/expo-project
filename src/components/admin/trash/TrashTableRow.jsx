// src/components/admin/trash/TrashTableRow.jsx
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
  Tag,
} from '@chakra-ui/react';
import { FiMoreVertical, FiCalendar, FiRotateCcw, FiTrash } from 'react-icons/fi';
import StatusBadge from '../../common/ui/StatusBadge';
import { getRoleColorScheme } from '../../../constants/roles';

/**
 * Component for rendering a single row in the trash table
 * 
 * @param {Object} props - Component props
 * @param {Object} props.item - Deleted item data object
 * @param {boolean} props.isSelected - Whether the item is selected
 * @param {Function} props.onSelect - Function called when item is selected
 * @param {Function} props.onAction - Function called when action is performed on item
 * @param {boolean} props.showSelectColumn - Whether to show selection checkbox
 */
const TrashTableRow = ({
  item,
  isSelected = false,
  onSelect,
  onAction,
  showSelectColumn = true,
}) => {
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  if (!item) return null;
  
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
            onChange={() => onSelect(item._id)}
            colorScheme="teal"
          />
        </Td>
      )}
      
      {/* User info */}
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
      
      {/* Role */}
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
      
      {/* Deleted date */}
      <Td>
        <Flex align="center" fontSize="sm" color="gray.600">
          <FiCalendar style={{ marginRight: '4px' }} />
          {formatDate(item.deletedAt)}
        </Flex>
      </Td>
      
      {/* Time remaining */}
      <Td>
        <Tag 
          colorScheme={getTimeRemainingColor(item.daysRemaining)} 
          size="sm"
          borderRadius="full"
        >
          {item.daysRemaining} days
        </Tag>
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
            <MenuItem 
              icon={<FiRotateCcw />} 
              onClick={() => onAction('restore', item)}
            >
              Restore
            </MenuItem>
            
            <MenuItem 
              icon={<FiTrash />} 
              color="red.500" 
              onClick={() => onAction('delete', item)}
            >
              Delete Permanently
            </MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
};

export default TrashTableRow;