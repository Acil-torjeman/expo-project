// src/pages/organizer/RegistrationDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, 
  Button, 
  Flex, 
  Heading, 
  Text, 
  SimpleGrid, 
  Card, 
  CardBody, 
  CardHeader, 
  Badge, 
  HStack, 
  VStack, 
  Divider, 
  Spinner, 
  Alert,
  AlertIcon,
  Avatar,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  useDisclosure,
  Link,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Image,
  useBreakpointValue
} from '@chakra-ui/react';
import { 
  FiUser, 
  FiBriefcase, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiInfo, 
  FiFileText, 
  FiCheck, 
  FiX, 
  FiRefreshCw,
  FiClock,
  FiDownload,
  FiExternalLink,
  FiChevronRight,
  FiShoppingCart,
  FiMonitor,
  FiCalendar,
  FiDollarSign,
  FiGlobe
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import ConfirmDialog from '../../components/common/ui/ConfirmDialog';
import EventInfo from '../../components/organizer/registrations/EventInfo';
import { getStatusColorScheme, getStatusDisplayText } from '../../constants/registrationConstants';
import registrationService from '../../services/registration.service';
import invoiceService from '../../services/invoice.service';
import ReviewRegistrationModal from '../../components/organizer/registrations/ReviewRegistrationModal';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Fonction simple pour obtenir l'URL d'un fichier
const getFileUrl = (filename, path = '/uploads/exhibitor-documents') => {
  if (!filename) return null;
  return `${import.meta.env.VITE_API_BASE_URL}/files${path}/${filename}`;
};




// Composant pour l'élément de timeline
const TimelineItem = ({ 
  icon, 
  title, 
  date, 
  isActive = true, 
  isLast = false, 
  color = "blue.500" 
}) => (
  <MotionFlex 
    align="center" 
    mb={isLast ? 0 : 4}
    opacity={isActive ? 1 : 0.5}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: isActive ? 1 : 0.5, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Box
      position="relative"
      zIndex="1"
    >
      <Flex
        w="40px"
        h="40px"
        borderRadius="full"
        justify="center"
        align="center"
        bg={isActive ? `${color}` : "gray.200"}
        color={isActive ? "white" : "gray.500"}
        boxShadow={isActive ? "0 0 15px" : "none"}
        shadowcolor={`${color}40`}
      >
        <Icon as={icon} boxSize={5} />
      </Flex>
      
      {!isLast && (
        <Box
          position="absolute"
          left="19px"
          top="40px"
          width="2px"
          height="40px"
          bgGradient={isActive ? `linear(to-b, ${color}, gray.200)` : "gray.200"}
          zIndex="-1"
        />
      )}
    </Box>
    
    <Box ml={4}>
      <Text fontWeight="bold">{title}</Text>
      <Text fontSize="sm" color="gray.500">{date}</Text>
    </Box>
  </MotionFlex>
);

const RegistrationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // State
  const [registration, setRegistration] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Disclosure for modals
  const { 
    isOpen: isReviewOpen, 
    onOpen: onReviewOpen, 
    onClose: onReviewClose 
  } = useDisclosure();
  
  const { 
    isOpen: isCancelOpen, 
    onOpen: onCancelOpen, 
    onClose: onCancelClose 
  } = useDisclosure();
  
  // Fetch registration data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch registration details
        const regData = await registrationService.getRegistrationById(id);
        console.log("Registration data:", regData); // Debug
        
        if (regData.exhibitor && regData.exhibitor.company) {
          console.log("Company data:", regData.exhibitor.company);
        }
        
        setRegistration(regData);
        
        // Try to fetch invoice if registration is completed
        if (regData.status === 'completed') {
          try {
            const invoiceData = await invoiceService.getInvoiceByRegistration(regData._id);
            setInvoice(invoiceData);
          } catch (invError) {
            console.log('Invoice not available yet:', invError);
          }
        }
      } catch (error) {
        setError(error.message || 'Failed to load registration details');
        toast({
          title: 'Error',
          description: error.message || 'Failed to load registration details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, toast]);
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format phone with country code
  const formatPhone = (phoneCode, phone) => {
    if (!phone) return 'N/A';
    return `${phoneCode || ''} ${phone}`;
  };
  
  // Check if invoice is paid
  const isInvoicePaid = () => {
    return invoice?.status === 'paid';
  };
  
  // Handle approve action
  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await registrationService.reviewRegistration(id, { status: 'approved' });
      
      toast({
        title: 'Registration Approved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the data
      const updatedRegistration = await registrationService.getRegistrationById(id);
      setRegistration(updatedRegistration);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
      onReviewClose();
    }
  };
  
  // Handle reject action
  const handleReject = async (reason) => {
    setSubmitting(true);
    try {
      await registrationService.reviewRegistration(id, {
        status: 'rejected',
        reason
      });
      
      toast({
        title: 'Registration Rejected',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the data
      const updatedRegistration = await registrationService.getRegistrationById(id);
      setRegistration(updatedRegistration);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
      onReviewClose();
    }
  };
  
  // Handle cancel action
  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await registrationService.cancelRegistration(id);
      
      toast({
        title: 'Registration Cancelled',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the data
      const updatedRegistration = await registrationService.getRegistrationById(id);
      setRegistration(updatedRegistration);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
      onCancelClose();
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <Flex justify="center" align="center" minH="600px">
          <Spinner size="xl" thickness="4px" color="teal.500" />
        </Flex>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <Box p={6}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>Failed to load registration details: {error}</Text>
          </Alert>
          <Button mt={4} onClick={() => navigate('/organizer/registrations')}>
            Back to Registrations
          </Button>
        </Box>
      </DashboardLayout>
    );
  }
  
  // If no registration found
  if (!registration) {
    return (
      <DashboardLayout>
        <Box p={6}>
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Text>Registration not found</Text>
          </Alert>
          <Button mt={4} onClick={() => navigate('/organizer/registrations')}>
            Back to Registrations
          </Button>
        </Box>
      </DashboardLayout>
    );
  }
  
  // Extract data safely with proper cascading fallbacks
  const exhibitor = registration.exhibitor || {};
  const company = exhibitor.company || {};
  const user = exhibitor.user || {};
  const event = registration.event || {};
  const status = registration.status;
  const isPending = status === 'pending';
  const isApproved = status === 'approved';
  const isCompleted = status === 'completed';
  const isRejected = status === 'rejected';
  const isCancelled = status === 'cancelled';
  
  return (
    <DashboardLayout title="Registration Details">
      <Box p={4}>
        {/* Breadcrumb navigation */}
        <Breadcrumb 
          separator={<Icon as={FiChevronRight} color="gray.500" />} 
          mb={4}
          fontSize="sm"
        >
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/organizer/dashboard')}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/organizer/registrations')}>
              Registrations
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Registration Details</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        {/* Header with status */}
        <Flex 
          justify="space-between" 
          align="center" 
          mb={6}
          wrap={{ base: "wrap", md: "nowrap" }}
          gap={2}
        >
          <Heading size="lg">Registration #{registration._id.substring(0, 6)}</Heading>
          <HStack>
            <Badge 
              colorScheme={getStatusColorScheme(status)} 
              fontSize="md" 
              py={1} 
              px={3} 
              borderRadius="full"
            >
              {getStatusDisplayText(status)}
            </Badge>
            {isPending && (
              <Button 
                colorScheme="teal" 
                size="sm"
                leftIcon={<FiCheck />}
                onClick={onReviewOpen}
                isLoading={submitting}
              >
                Review
              </Button>
            )}
            {isApproved && !isInvoicePaid() && (
              <Button 
                colorScheme="red" 
                size="sm"
                variant="outline"
                leftIcon={<FiX />}
                onClick={onCancelOpen}
                isLoading={submitting}
              >
                Cancel
              </Button>
            )}
          </HStack>
        </Flex>
        
        {/* Registration Overview */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">Registration Details</Heading>
            </CardHeader>
            <CardBody>
              <HStack align="flex-start" spacing={4} mb={4}>
                <Box>
                  <Text fontWeight="bold">Status:</Text>
                  <Badge colorScheme={getStatusColorScheme(status)}>
                    {getStatusDisplayText(status)}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">Created:</Text>
                  <Text>{formatDate(registration.createdAt)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Updated:</Text>
                  <Text>{formatDate(registration.updatedAt)}</Text>
                </Box>
              </HStack>
              
              {isApproved && (
                <Box mb={4}>
                  <Text fontWeight="bold">Approved Date:</Text>
                  <Text>{formatDate(registration.approvalDate)}</Text>
                </Box>
              )}
              
              {isRejected && (
                <Box mb={4}>
                  <Text fontWeight="bold">Rejection Date:</Text>
                  <Text>{formatDate(registration.rejectionDate)}</Text>
                  
                  {registration.rejectionReason && (
                    <>
                      <Text fontWeight="bold" mt={2}>Rejection Reason:</Text>
                      <Alert status="error" mt={1} borderRadius="md">
                        <AlertIcon />
                        <Text>{registration.rejectionReason}</Text>
                      </Alert>
                    </>
                  )}
                </Box>
              )}
              
              {isCancelled && (
                <Box mb={4}>
                  <Text fontWeight="bold">Cancellation Date:</Text>
                  <Text>{formatDate(registration.cancellationDate)}</Text>
                </Box>
              )}
              
              {registration.participationNote && (
                <Box mt={4}>
                  <Text fontWeight="bold">Participation Note:</Text>
                  <Text>{registration.participationNote}</Text>
                </Box>
              )}
            </CardBody>
          </Card>
          
          <EventInfo event={event} />
        </SimpleGrid>
        
        {/* Company/Exhibitor Information */}
        <Card mb={6}>
          <CardHeader>
            <Heading size="md">Exhibitor Information</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Company Information */}
              <Box>
                <Flex align="center" mb={4}>
                  {company.companyLogoPath ? (
                    <Box mr={4} borderRadius="md" overflow="hidden" width="70px" height="70px">
                      <Image 
                        src={getFileUrl(company.companyLogoPath)}
                        alt={company.companyName || "Company logo"}
                        objectFit="cover"
                        width="100%"
                        height="100%"
                        fallback={
                          <Avatar 
                            size="lg"
                            name={company.companyName || "Unknown"}
                          />
                        }
                      />
                    </Box>
                  ) : (
                    <Avatar 
                      size="lg"
                      name={company.companyName || "Unknown"}
                      mr={4}
                    />
                  )}
                  <Box>
                    <Heading size="md">{company.companyName || 'Unknown Company'}</Heading>
                    <HStack mt={1}>
                      <Icon as={FiMapPin} color="gray.500" />
                      <Text color="gray.500">{company.country || 'Unknown Location'}</Text>
                    </HStack>
                  </Box>
                </Flex>
                
                <SimpleGrid columns={2} spacing={4} mt={4}>
                  <VStack align="start">
                    <Text fontWeight="bold">Registration Number:</Text>
                    <Text>{company.registrationNumber || 'N/A'}</Text>
                  </VStack>
                  
                  <VStack align="start">
                    <Text fontWeight="bold">Trade Name:</Text>
                    <Text>{company.tradeName || 'N/A'}</Text>
                  </VStack>
                  
                  <VStack align="start">
                    <Text fontWeight="bold">Sector:</Text>
                    <Text>{company.sector || 'N/A'}</Text>
                  </VStack>
                  
                  <VStack align="start">
                    <Text fontWeight="bold">Subsector:</Text>
                    <Text>{company.subsector || 'N/A'}</Text>
                  </VStack>
                  
                  <VStack align="start">
                    <Text fontWeight="bold">Company Size:</Text>
                    <Text>{company.companySize || 'N/A'}</Text>
                  </VStack>
                  
                  <VStack align="start">
                    <Text fontWeight="bold">Contact Phone:</Text>
                    <Text>{formatPhone(company.contactPhoneCode, company.contactPhone)}</Text>
                  </VStack>
                </SimpleGrid>
                
                <VStack align="start" mt={4}>
                  <Text fontWeight="bold">Address:</Text>
                  <Text>{company.companyAddress || 'N/A'}, {company.postalCity || ''}, {company.country || ''}</Text>
                </VStack>
                
                {company.website && (
                  <VStack align="start" mt={4}>
                    <Text fontWeight="bold">Website:</Text>
                    <Link href={company.website.startsWith('http') ? company.website : `https://${company.website}`} isExternal color="teal.500">
                      <Flex align="center">
                        <Icon as={FiGlobe} mr={1} />
                        {company.website}

                      </Flex>
                    </Link>
                  </VStack>
                )}
                
                {company.companyDescription && (
                  <VStack align="start" mt={4}>
                    <Text fontWeight="bold">Company Description:</Text>
                    <Text>{company.companyDescription}</Text>
                  </VStack>
                )}
              </Box>
              
              {/* Document Downloads and Contact Person */}
              <Box>
                <Heading size="sm" mb={4}>Documents</Heading>
                
                {/* Business Registration */}
                <Button 
                  mb={3}
                  width="full"
                  leftIcon={<FiFileText />}
                  rightIcon={<FiDownload />}
                  isDisabled={!company.kbisDocumentPath}
                  onClick={() => window.open(getFileUrl(company.kbisDocumentPath), '_blank')}
                >
                  Business Registration
                </Button>
                
                {/* Insurance Certificate */}
                <Button 
                  mb={5}
                  width="full"
                  leftIcon={<FiFileText />}
                  rightIcon={<FiDownload />}
                  isDisabled={!company.insuranceCertificatePath}
                  onClick={() => window.open(getFileUrl(company.insuranceCertificatePath), '_blank')}
                >
                  Insurance Certificate
                </Button>
                
                <Divider my={4} />
                
                <Heading size="sm" mb={4}>Contact Person</Heading>
                <SimpleGrid columns={1} spacing={4}>
                  <HStack>
                    <Icon as={FiUser} color="teal.500" />
                    <Text fontWeight="bold">Representative:</Text>
                    <Text>{user.username || 'N/A'}</Text>
                  </HStack>
                  
                  <HStack>
                    <Icon as={FiMail} color="teal.500" />
                    <Text fontWeight="bold">Email:</Text>
                    <Text>{user.email || 'N/A'}</Text>
                  </HStack>
                  
                  <HStack>
                    <Icon as={FiBriefcase} color="teal.500" />
                    <Text fontWeight="bold">Function:</Text>
                    <Text>{exhibitor.representativeFunction || 'N/A'}</Text>
                  </HStack>
                  
                  <HStack>
                    <Icon as={FiPhone} color="teal.500" />
                    <Text fontWeight="bold">Phone:</Text>
                    <Text>{formatPhone(exhibitor.personalPhoneCode, exhibitor.personalPhone)}</Text>
                  </HStack>
                </SimpleGrid>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
        
        {/* Tabs for Stands, Equipment, and Invoice */}
        <Tabs colorScheme="teal" mb={6}>
          <TabList>
            <Tab><Icon as={FiMonitor} mr={2} /> Stands</Tab>
            <Tab><Icon as={FiShoppingCart} mr={2} /> Equipment</Tab>
            <Tab><Icon as={FiFileText} mr={2} /> Invoice</Tab>
          </TabList>
          
          <TabPanels>
            {/* Stands Panel */}
            <TabPanel>
              {registration.stands && registration.stands.length > 0 ? (
                <Card variant="outline">
                  <CardHeader pb={0}>
                    <Heading size="md">Selected Stands</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Stand Number</Th>
                            <Th>Type</Th>
                            <Th>Area (m²)</Th>
                            <Th isNumeric>Base Price</Th>
                            <Th>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {registration.stands.map((stand) => (
                            <Tr key={stand._id}>
                              <Td>#{stand.number}</Td>
                              <Td>{stand.type || 'Standard'}</Td>
                              <Td>{stand.area} m²</Td>
                              <Td isNumeric>${stand.basePrice?.toFixed(2) || '0.00'}</Td>
                              <Td>
                                <Badge colorScheme={stand.status === 'reserved' ? 'orange' : 'green'}>
                                  {stand.status}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                    
                    <HStack mt={4}>
                      <Icon as={FiInfo} color="blue.500" />
                      <Text color="blue.600" fontSize="sm">
                        {registration.standSelectionCompleted 
                          ? 'Stand selection has been completed by the exhibitor.' 
                          : 'Exhibitor has not completed their stand selection.'}
                      </Text>
                    </HStack>
                  </CardBody>
                </Card>
              ) : (
                <Flex 
                  direction="column" 
                  align="center" 
                  justify="center" 
                  p={8} 
                  bg="gray.50" 
                  borderRadius="md"
                >
                  <Icon as={FiMonitor} boxSize={10} color="gray.400" mb={4} />
                  <Text fontWeight="medium" mb={2}>No Stands Selected</Text>
                  <Text color="gray.500">
                    {isApproved 
                      ? 'The exhibitor has not selected any stands yet.' 
                      : 'Stands can be selected after the registration is approved.'}
                  </Text>
                </Flex>
              )}
            </TabPanel>
            
            {/* Equipment Panel */}
            <TabPanel>
              {registration.equipment && registration.equipment.length > 0 ? (
                <Card variant="outline">
                  <CardHeader pb={0}>
                    <Heading size="md">Selected Equipment</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>ID</Th>
                            <Th>Equipment</Th>
                            <Th>Description</Th>
                            <Th isNumeric>Quantity</Th>
                            <Th isNumeric>Price</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {registration.equipment.map((equipment) => {
                            // Find quantity if available
                            const quantityItem = registration.equipmentQuantities?.find(eq => 
                              String(eq.equipment) === String(equipment._id));
                            const quantity = quantityItem ? quantityItem.quantity : 1;
                            
                            return (
                              <Tr key={equipment._id}>
                                <Td>{equipment._id.substring(0, 6)}</Td>
                                <Td>{equipment.name}</Td>
                                <Td maxW="200px" isTruncated>{equipment.description || 'N/A'}</Td>
                                <Td isNumeric>{quantity}</Td>
                                <Td isNumeric>${equipment.price?.toFixed(2) || '0.00'}</Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                    
                    <HStack mt={4}>
                      <Icon as={FiInfo} color="blue.500" />
                      <Text color="blue.600" fontSize="sm">
                        {registration.equipmentSelectionCompleted 
                          ? 'Equipment selection has been completed by the exhibitor.' 
                          : 'Exhibitor has not completed their equipment selection.'}
                      </Text>
                    </HStack>
                  </CardBody>
                </Card>
              ) : (
                <Flex 
                  direction="column" 
                  align="center" 
                  justify="center" 
                  p={8} 
                  bg="gray.50" 
                  borderRadius="md"
                >
                  <Icon as={FiShoppingCart} boxSize={10} color="gray.400" mb={4} />
                  <Text fontWeight="medium" mb={2}>No Equipment Selected</Text>
                  <Text color="gray.500">
                    {isApproved 
                      ? 'The exhibitor has not selected any equipment yet.' 
                      : 'Equipment can be selected after the registration is approved.'}
                  </Text>
                </Flex>
              )}
            </TabPanel>
            
            {/* Invoice Panel */}
            <TabPanel>
              {isCompleted ? (
                <Card variant="outline">
                  <CardHeader>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                      <Heading size="md">Invoice</Heading>
                      {invoice && (
                        <HStack>
                          <Badge colorScheme={invoice.status === 'paid' ? 'green' : 'yellow'}>
                            {invoice.status.toUpperCase()}
                          </Badge>
                          <Button
                            size="sm"
                            leftIcon={<FiExternalLink />}
                            onClick={() => {
                              if (invoice.pdfPath) {
                                window.open(getFileUrl(invoice.pdfPath, '/uploads/invoices'), '_blank');
                              }
                            }}
                            isDisabled={!invoice.pdfPath}
                          >
                            View PDF
                          </Button>
                        </HStack>
                      )}
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    {invoice ? (
                      <Box>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                          <Box>
                            <VStack align="start" spacing={3}>
                              <HStack>
                                <Icon as={FiFileText} color="teal.500" />
                                <Text fontWeight="medium">Invoice Number:</Text>
                                <Text>{invoice.invoiceNumber}</Text>
                              </HStack>
                              
                              <HStack>
                                <Icon as={FiCalendar} color="teal.500" />
                                <Text fontWeight="medium">Date:</Text>
                                <Text>{formatDate(invoice.createdAt)}</Text>
                              </HStack>
                              
                              <HStack>
                                <Icon as={FiBriefcase} color="teal.500" />
                                <Text fontWeight="medium">Company:</Text>
                                <Text>{company.companyName || 'N/A'}</Text>
                              </HStack>
                            </VStack>
                          </Box>
                          
                          <Box>
                            <VStack align="start" spacing={3}>
                              <HStack>
                                <Icon as={FiDollarSign} color="teal.500" />
                                <Text fontWeight="medium">Subtotal:</Text>
                                <Text>${invoice.subtotal?.toFixed(2) || '0.00'}</Text>
                              </HStack>
                              
                              <HStack>
                                <Icon as={FiDollarSign} color="teal.500" />
                                <Text fontWeight="medium">Tax ({invoice.taxRate * 100}%):</Text>
                                <Text>${invoice.taxAmount?.toFixed(2) || '0.00'}</Text>
                              </HStack>
                              
                              <HStack>
                                <Icon as={FiDollarSign} color="teal.500" />
                                <Text fontWeight="bold">Total:</Text>
                                <Text fontWeight="bold">${invoice.total?.toFixed(2) || '0.00'}</Text>
                              </HStack>
                            </VStack>
                          </Box>
                        </SimpleGrid>
                        
                        {invoice.pdfPath && (
                          <Box 
                            border="1px" 
                            borderColor="gray.200" 
                            borderRadius="md" 
                            h="800px" 
                            overflow="hidden"
                          >
                            <iframe
                              src={getFileUrl(invoice.pdfPath, '/uploads/invoices')}
                              style={{
                                width: '100%',
                                height: '100vh',
                                border: 'none',
                                display: 'block'
                              }}
                              title="Invoice PDF"
                            />
                              
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Flex 
                        direction="column" 
                        align="center" 
                        justify="center" 
                        p={8} 
                        bg="gray.50" 
                        borderRadius="md"
                      >
                        <Icon as={FiFileText} boxSize={10} color="gray.400" mb={4} />
                        <Text fontWeight="medium" mb={2}>Generating Invoice...</Text>
                        <Text color="gray.500" textAlign="center" mb={4}>
                          An invoice is being generated for this completed registration. It will be available soon.
                        </Text>
                        <Button
                          colorScheme="teal"
                          leftIcon={<FiRefreshCw />}
                          onClick={async () => {
                            try {
                              const invoiceData = await invoiceService.getInvoiceByRegistration(registration._id);
                              setInvoice(invoiceData);
                              toast({
                                title: 'Success',
                                description: 'Invoice data loaded successfully',
                                status: 'success',
                                duration: 2000
                              });
                            } catch (err) {
                              toast({
                                title: 'Invoice not ready',
                                description: 'The invoice is still being processed',
                                status: 'info',
                                duration: 3000
                              });
                            }
                          }}
                        >
                          Check Invoice Status
                        </Button>
                      </Flex>
                    )}
                  </CardBody>
                </Card>
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="medium">Invoice Not Available</Text>
                    <Text fontSize="sm">
                      {isPending ? 'The registration must be approved before an invoice can be generated.' :
                       isApproved ? 'The exhibitor must complete their stand selection before an invoice is generated.' :
                       isRejected ? 'No invoice will be generated for rejected registrations.' :
                       isCancelled ? 'This registration has been cancelled and no invoice will be generated.' :
                       'Invoice information is not available.'}
                    </Text>
                  </Box>
                </Alert>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        {/* Modern Timeline */}
        <Card mb={6} overflow="hidden">
          <CardHeader bg="teal.500" color="white">
            <Heading size="md">Registration Timeline</Heading>
          </CardHeader>
          <CardBody 
            bg="gray.50" 
            py={6}
            px={8}
          >
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <TimelineItem 
                icon={FiClock} 
                title="Registration Submitted"
                date={formatDate(registration.createdAt)}
                color="blue.500"
                isActive={true}
              />
              
              <TimelineItem 
                icon={isRejected ? FiX : FiCheck} 
                title={isRejected ? "Registration Rejected" : "Registration Approved"}
                date={isRejected && registration.rejectionDate ? formatDate(registration.rejectionDate) :
                     isApproved && registration.approvalDate ? formatDate(registration.approvalDate) :
                     'Pending'}
                color={isRejected ? "red.500" : "green.500"}
                isActive={isApproved || isRejected || isCompleted || isCancelled}
              />
              
              <TimelineItem 
                icon={isCancelled ? FiX : FiMonitor} 
                title={isCancelled ? "Registration Cancelled" : "Stands Selection"}
                date={isCancelled && registration.cancellationDate ? formatDate(registration.cancellationDate) :
                     registration.standSelectionCompleted ? 'Completed' : 'Pending'}
                color={isCancelled ? "red.500" : "orange.500"}
                isActive={isCompleted || isCancelled || registration.standSelectionCompleted}
              />
              
              <TimelineItem 
                icon={FiFileText} 
                title="Invoice Generated"
                date={invoice ? formatDate(invoice.createdAt) : 'Pending'}
                color="purple.500"
                isActive={isCompleted && invoice}
              />
              
              <TimelineItem 
                icon={FiDollarSign} 
                title="Payment Completed"
                date={invoice?.status === 'paid' ? formatDate(invoice.updatedAt) : 'Pending'}
                color="green.500"
                isActive={invoice?.status === 'paid'}
                isLast={true}
              />
            </MotionBox>
          </CardBody>
        </Card>
        
        {/* Action Buttons */}
        <Flex 
          justify="center" 
          mb={6}
          wrap="wrap"
          gap={3}
        >
          <Button 
            mr={{ base: 0, md: 4 }}
            onClick={() => navigate('/organizer/registrations')}
          >
            Back to Registrations
          </Button>
          
          {isPending && (
            <>
              <Button 
                colorScheme="red" 
                variant="outline" 
                mr={{ base: 0, md: 4 }}
                onClick={onReviewOpen}
                isLoading={submitting}
              >
                Reject
              </Button>
              <Button 
                colorScheme="green" 
                onClick={onReviewOpen}
                isLoading={submitting}
              >
                Approve
              </Button>
            </>
          )}
          
          {isApproved && !isInvoicePaid() && (
            <Button 
              colorScheme="red" 
              variant="outline"
              onClick={onCancelOpen}
              isLoading={submitting}
            >
              Cancel Registration
            </Button>
          )}
          
          {isCompleted && invoice && (
            <Button
              colorScheme="blue"
              leftIcon={<FiExternalLink />}
              onClick={() => {
                if (invoice.pdfPath) {
                  window.open(getFileUrl(invoice.pdfPath, '/uploads/invoices'), '_blank');
                }
              }}
              isDisabled={!invoice.pdfPath}
            >
              View Invoice PDF
            </Button>
          )}
        </Flex>
      </Box>
      
      {/* Review Registration Modal */}
      {isPending && (
        <ReviewRegistrationModal
          isOpen={isReviewOpen}
          onClose={onReviewClose}
          registration={registration}
          onApprove={handleApprove}
          onReject={handleReject}
          isSubmitting={submitting}
        />
      )}
      
      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={onCancelClose}
        title="Cancel Registration"
        body="Are you sure you want to cancel this registration? This action will release any reserved stands and cannot be undone."
        confirmText="Yes, Cancel Registration"
        cancelText="No, Keep Registration"
        onConfirm={handleCancel}
        confirmColorScheme="red"
      />
    </DashboardLayout>
  );
};

export default RegistrationDetails;