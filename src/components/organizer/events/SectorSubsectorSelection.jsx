// src/components/organizer/events/SectorSubsectorSelection.jsx
import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Stack,
  Button,
  Divider,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { IndustrySectors, getAllSectors, getSubsectors } from '../../../constants/industrySectors';

const SectorSubsectorSelection = ({ 
  selectedSectors, 
  selectedSubsectors, 
  onSectorsChange, 
  onSubsectorsChange,
  errors 
}) => {
  // Colors
  const sectorBg = useColorModeValue('gray.100', 'gray.700');
  const sectorActiveBg = useColorModeValue('teal.50', 'teal.900');
  const sectorActiveBorder = useColorModeValue('teal.500', 'teal.200');
  
  // Toggle sector selection
  const handleSectorToggle = (sectorId) => {
    const newSectors = [...selectedSectors];
    const sectorIndex = newSectors.indexOf(sectorId);
    
    if (sectorIndex === -1) {
      // Add sector if not in array
      newSectors.push(sectorId);
    } else {
      // Remove sector if already in array
      newSectors.splice(sectorIndex, 1);
    }
    
    onSectorsChange(newSectors);
    
    // Also update subsectors accordingly
    updateSubsectorsAfterSectorChange(newSectors);
  };
  
  // Update subsectors when sectors change
  const updateSubsectorsAfterSectorChange = (newSectors) => {
    // Remove subsectors that are no longer valid based on sector selection
    const newSubsectors = selectedSubsectors.filter(subsector => {
      // Check if this subsector belongs to any of the selected sectors
      for (const sectorId of newSectors) {
        const sectorSubsectors = getSubsectors(sectorId);
        if (sectorSubsectors.includes(subsector)) {
          return true;
        }
      }
      return false;
    });
    
    onSubsectorsChange(newSubsectors);
  };
  
  // Toggle subsector selection
  const handleSubsectorToggle = (subsector) => {
    const newSubsectors = [...selectedSubsectors];
    const subsectorIndex = newSubsectors.indexOf(subsector);
    
    if (subsectorIndex === -1) {
      // Add subsector if not in array
      newSubsectors.push(subsector);
    } else {
      // Remove subsector if already in array
      newSubsectors.splice(subsectorIndex, 1);
    }
    
    onSubsectorsChange(newSubsectors);
  };
  
  // Get all sectors
  const allSectors = getAllSectors();

  return (
    <Stack spacing={6}>
      {/* Industry Sectors */}
      <FormControl isRequired isInvalid={!!errors?.allowedSectors}>
        <FormLabel>Industry Sectors</FormLabel>
        <Box mb={2}>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Select all sectors that apply to this event:
          </Text>
          <Stack direction="row" spacing={2} wrap="wrap">
            {allSectors.map(sector => {
              const isSelected = selectedSectors.includes(sector.id);
              return (
                <Button
                  key={sector.id}
                  size="sm"
                  variant={isSelected ? "solid" : "outline"}
                  colorScheme="teal"
                  mb={2}
                  onClick={() => handleSectorToggle(sector.id)}
                >
                  {sector.name}
                </Button>
              );
            })}
          </Stack>
        </Box>
        <Box mt={2}>
          <Text fontWeight="medium" fontSize="sm">Selected sectors:</Text>
          {selectedSectors.length === 0 ? (
            <Text fontSize="sm" color="gray.500">No sectors selected</Text>
          ) : (
            <Stack direction="row" spacing={2} wrap="wrap" mt={1}>
              {selectedSectors.map(sectorId => (
                <Badge key={sectorId} colorScheme="blue" p={1}>
                  {IndustrySectors[sectorId]?.name || sectorId}
                </Badge>
              ))}
            </Stack>
          )}
        </Box>
        <FormErrorMessage>{errors?.allowedSectors}</FormErrorMessage>
      </FormControl>
      
      <Divider />
      
      {/* Subsectors */}
      <FormControl isRequired isInvalid={!!errors?.allowedSubsectors}>
        <FormLabel>Subsectors</FormLabel>
        {selectedSectors.length === 0 ? (
          <Text color="gray.500" fontSize="sm">Please select industry sectors first</Text>
        ) : (
          <Stack direction="column" spacing={4}>
            {selectedSectors.map(sectorId => (
              <Box key={sectorId} mb={2}>
                <Text fontWeight="bold" mb={2}>{IndustrySectors[sectorId]?.name}</Text>
                <Stack direction="row" spacing={2} wrap="wrap" ml={2}>
                  {getSubsectors(sectorId).map(subsector => {
                    const isSelected = selectedSubsectors.includes(subsector);
                    return (
                      <Button
                        key={subsector}
                        size="sm"
                        variant={isSelected ? "solid" : "outline"}
                        colorScheme="teal"
                        mb={1}
                        onClick={() => handleSubsectorToggle(subsector)}
                      >
                        {subsector}
                      </Button>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
        <Box mt={4}>
          <Text fontWeight="medium" fontSize="sm">Selected subsectors:</Text>
          {selectedSubsectors.length === 0 ? (
            <Text fontSize="sm" color="gray.500">No subsectors selected</Text>
          ) : (
            <Stack direction="row" spacing={2} wrap="wrap" mt={1}>
              {selectedSubsectors.map(subsector => (
                <Badge key={subsector} colorScheme="green" p={1}>
                  {subsector}
                </Badge>
              ))}
            </Stack>
          )}
        </Box>
        <FormErrorMessage>{errors?.allowedSubsectors}</FormErrorMessage>
      </FormControl>
    </Stack>
  );
};

export default SectorSubsectorSelection;