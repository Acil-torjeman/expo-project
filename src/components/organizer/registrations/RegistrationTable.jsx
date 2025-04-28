// src/components/organizer/registrations/RegistrationTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  HStack,
  Icon,
  Text,
  Box,
  Avatar,
  Flex
} from '@chakra-ui/react';
import { FiMoreVertical, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { getStatusColorScheme, getStatusDisplayText } from '../../../constants/registrationConstants';
import { getCompanyLogoUrl } from '../../../utils/fileUtils';

const RegistrationTable = ({ 
  registrations, 
  onReview, 
  onView,
  isSelectable = false,
  selectedIds = [],
  onToggleSelect
}) => {
  const navigate = useNavigate();
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handle view action - navigate to details page instead of opening modal
  const handleView = (registration) => {
    navigate(`/organizer/registrations/${registration._id}`);
  };

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Company</Th>
            <Th>Event</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {registrations.map((registration) => {
            const exhibitor = registration.exhibitor || {};
            const company = exhibitor.company || {};
            const event = registration.event || {};
            
            return (
              <Tr key={registration._id}>
                <Td>
                  <Flex align="center">
                    <Avatar 
                      size="sm" 
                      name={company.companyName || "Unknown"} 
                      src={getCompanyLogoUrl(company.companyLogoPath)}
                      mr={2}
                    />
                    <Box>
                      <Text fontWeight="medium">{company.companyName || 'Unknown Company'}</Text>
                      <Text fontSize="xs" color="gray.500">{company.sector || 'Unknown Sector'}</Text>
                    </Box>
                  </Flex>
                </Td>
                <Td>{event.name || 'Unknown Event'}</Td>
                <Td>{formatDate(registration.createdAt)}</Td>
                <Td>
                  <Badge colorScheme={getStatusColorScheme(registration.status)}>
                    {getStatusDisplayText(registration.status)}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="View details"
                      icon={<FiEye />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={() => handleView(registration)}
                    />
                    
                    {registration.status === 'pending' && (
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<FiCheck />} 
                            onClick={() => onReview(registration, true)}
                          >
                            Approve
                          </MenuItem>
                          <MenuItem 
                            icon={<FiX />} 
                            onClick={() => onReview(registration, false)}
                          >
                            Reject
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )}
                  </HStack>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default RegistrationTable;