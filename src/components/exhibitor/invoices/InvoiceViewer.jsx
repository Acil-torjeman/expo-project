import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiDownload, FiExternalLink } from 'react-icons/fi';
import { getInvoicePdfUrl } from '../../../utils/fileUtils';

const InvoiceViewer = ({ invoiceId, pdfPath }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Create PDF URL using the file path
  const pdfUrl = pdfPath ? getInvoicePdfUrl(pdfPath) : '';
  
  // Handle downloads
  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };
  
  // Check if PDF exists
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [pdfPath]);
  
  if (!pdfPath) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>Invoice PDF not found</Text>
      </Alert>
    );
  }
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      {/* Toolbar */}
      <Flex 
        p={3} 
        borderBottomWidth="1px" 
        borderColor={borderColor}
        justify="space-between"
        align="center"
        bg={useColorModeValue('gray.50', 'gray.800')}
      >
        <Text fontWeight="medium">Invoice PDF Viewer</Text>
        <Flex>

          <Button
            size="sm"
            leftIcon={<Icon as={FiExternalLink} />}
            onClick={handleDownload}
            colorScheme="blue"
          >
            Open in New Tab
          </Button>
        </Flex>
      </Flex>
      
      {/* PDF Viewer */}
      <Box flex="1" position="relative">
        {loading ? (
          <Flex justify="center" align="center" height="100%">
            <Spinner size="xl" thickness="4px" color="teal.500" />
          </Flex>
        ) : error ? (
          <Flex direction="column" justify="center" align="center" height="100%" p={4}>
            <Alert status="error" borderRadius="md" mb={4}>
              <AlertIcon />
              <Text>Failed to load the invoice PDF.</Text>
            </Alert>
            <Button 
              colorScheme="blue"
              onClick={handleDownload}
              leftIcon={<Icon as={FiExternalLink} />}
            >
              Try Opening in New Tab
            </Button>
          </Flex>
        ) : (
                <iframe
                src={`${pdfUrl}#toolbar=1`}
                style={{
                    width: '100%',
                    height: '80vh', // 80% de la hauteur de la fenêtre du navigateur
                    border: 'none',
                    display: 'block',
                }}
                title="Invoice PDF"
                onError={() => setError(true)}
                />
        )}
      </Box>
    </Box>
  );
};

export default InvoiceViewer;