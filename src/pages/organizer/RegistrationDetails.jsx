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
  Tag,
  Link,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
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
  FiAlertTriangle,
  FiClock,
  FiDownload,
  FiExternalLink,
  FiChevronRight,
  FiShoppingCart,
  FiMonitor,
  FiCalendar,
  FiDollarSign,
  FiList
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import ConfirmDialog from '../../components/common/ui/ConfirmDialog';
import EventInfo from '../../components/organizer/registrations/EventInfo';
import { getStatusColorScheme, getStatusDisplayText } from '../../constants/registrationConstants';
import { getFileUrl } from '../../utils/fileUtils';
import registrationService from '../../services/registration.service';
import ReviewRegistrationModal from '../../components/organizer/registrations/ReviewRegistrationModal';
import apiConfig from '../../config/api.config';

const RegistrationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  // State
  const [registration, setRegistration] = useState(null);
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
    const fetchRegistration = async () => {
      setLoading(true);
      try {
        const data = await registrationService.getRegistrationById(id);
        setRegistration(data);
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
    
    fetchRegistration();
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
    return registration?.invoice?.status === 'paid';
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
                  <Avatar 
                    size="lg"
                    name={company.companyName}
                    src={company.companyLogoPath ? getFileUrl(`${apiConfig.UPLOADS.LOGOS}/${company.companyLogoPath}`) : ''}
                    mr={4}
                  />
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
                      {company.website} <Icon as={FiExternalLink} mx="2px" />
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
                  onClick={() => window.open(getFileUrl(`/uploads/exhibitor-documents/${company.kbisDocumentPath}`), '_blank')}
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
                  onClick={() => window.open(getFileUrl(`/uploads/exhibitor-documents/${company.insuranceCertificatePath}`), '_blank')}
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
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Equipment</Th>
                          <Th>Description</Th>
                          <Th>Unit</Th>
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
                              <Td>{equipment.name}</Td>
                              <Td maxW="200px" isTruncated>{equipment.description || 'N/A'}</Td>
                              <Td>{equipment.unit || 'Item'}</Td>
                              <Td isNumeric>{quantity}</Td>
                              <Td isNumeric>${equipment.price?.toFixed(2) || '0.00'}</Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                    
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
                    <Flex justify="space-between" align="center">
                      <Heading size="md">Invoice</Heading>
                      {registration.invoice && (
                        <HStack>
                          <Badge colorScheme={registration.invoice.status === 'paid' ? 'green' : 'yellow'}>
                            {registration.invoice.status.toUpperCase()}
                          </Badge>
                          <Button
                            size="sm"
                            leftIcon={<FiExternalLink />}
                            onClick={() => {
                              if (registration.invoice.pdfPath) {
                                window.open(getFileUrl(`/uploads/invoices/${registration.invoice.pdfPath}`), '_blank');
                              }
                            }}
                            isDisabled={!registration.invoice.pdfPath}
                          >
                            View PDF
                          </Button>
                        </HStack>
                      )}
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    {registration.invoice ? (
                      <Box>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                          <Box>
                            <VStack align="start" spacing={3}>
                              <HStack>
                                <Icon as={FiFileText} color="teal.500" />
                                <Text fontWeight="medium">Invoice Number:</Text>
                                <Text>{registration.invoice.invoiceNumber}</Text>
                              </HStack>
                              
                              <HStack>
                                <Icon as={FiCalendar} color="teal.500" />
                                <Text fontWeight="medium">Date:</Text>
                                <Text>{formatDate(registration.invoice.createdAt)}</Text>
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
                                <Text>${registration.invoice.subtotal?.toFixed(2) || '0.00'}</Text>
                              </HStack>
                              
                              <HStack>
                                <Icon as={FiDollarSign} color="teal.500" />
                                <Text fontWeight="medium">Tax ({registration.invoice.taxRate * 100}%):</Text>
                                <Text>${registration.invoice.taxAmount?.toFixed(2) || '0.00'}</Text>
                              </HStack>
                              
                              <HStack>
                                <Icon as={FiDollarSign} color="teal.500" />
                                <Text fontWeight="bold">Total:</Text>
                                <Text fontWeight="bold">${registration.invoice.total?.toFixed(2) || '0.00'}</Text>
                              </HStack>
                            </VStack>
                          </Box>
                        </SimpleGrid>
                        
                        {registration.invoice.pdfPath && (
                          <Box 
                            border="1px" 
                            borderColor="gray.200" 
                            borderRadius="md" 
                            h="300px" 
                            overflow="hidden"
                          >
                            <iframe
                              src={getFileUrl(`/uploads/invoices/${registration.invoice.pdfPath}#toolbar=1`)}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
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
                        <Text fontWeight="medium" mb={2}>No Invoice Generated</Text>
                        <Text color="gray.500" textAlign="center" mb={4}>
                          An invoice will be generated when the registration is completed with stands selection.
                        </Text>
                        <Link
                          color="teal.500"
                          onClick={() => navigate('/organizer/invoices')}
                        >
                          <HStack>
                            <Icon as={FiList} />
                            <Text>View All Invoices</Text>
                          </HStack>
                        </Link>
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
        
        {/* Status Timeline */}
        <Card mb={6}>
          <CardHeader>
            <Heading size="md">Registration Timeline</Heading>
          </CardHeader>
          <CardBody>
            <Flex direction="column">
              <HStack mb={4} opacity={1}>
                <Icon as={FiClock} color="blue.500" boxSize={5} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Registration Submitted</Text>
                  <Text fontSize="sm" color="gray.500">{formatDate(registration.createdAt)}</Text>
                </VStack>
              </HStack>
              
              <HStack mb={4} opacity={isApproved || isRejected || isCompleted || isCancelled ? 1 : 0.5}>
                <Icon 
                  as={isRejected ? FiX : FiCheck} 
                  color={isRejected ? "red.500" : "green.500"} 
                  boxSize={5} 
                />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">
                    {isRejected ? 'Registration Rejected' : 'Registration Approved'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {isRejected && registration.rejectionDate ? formatDate(registration.rejectionDate) :
                     isApproved && registration.approvalDate ? formatDate(registration.approvalDate) :
                     'Pending'}
                  </Text>
                </VStack>
              </HStack>
              
              <HStack mb={4} opacity={isCompleted || isCancelled ? 1 : 0.5}>
                <Icon 
                  as={isCancelled ? FiX : FiMonitor} 
                  color={isCancelled ? "red.500" : "orange.500"} 
                  boxSize={5} 
                />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">
                    {isCancelled ? 'Registration Cancelled' : 'Stands Selection'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {isCancelled && registration.cancellationDate ? formatDate(registration.cancellationDate) :
                     registration.standSelectionCompleted ? 'Completed' : 'Pending'}
                  </Text>
                </VStack>
              </HStack>
              
              <HStack mb={4} opacity={isCompleted ? 1 : 0.5}>
                <Icon as={FiFileText} color="purple.500" boxSize={5} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Invoice Generated</Text>
                  <Text fontSize="sm" color="gray.500">
                    {registration.invoice ? formatDate(registration.invoice.createdAt) : 'Pending'}
                  </Text>
                </VStack>
              </HStack>
              
              <HStack opacity={registration.invoice?.status === 'paid' ? 1 : 0.5}>
                <Icon as={FiDollarSign} color="green.500" boxSize={5} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Payment Completed</Text>
                  <Text fontSize="sm" color="gray.500">
                    {registration.invoice?.status === 'paid' 
                      ? formatDate(registration.invoice.updatedAt) 
                      : 'Pending'}
                  </Text>
                </VStack>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
        
        {/* Action Buttons */}
        <Flex justify="center" mb={6}>
          <Button 
            mr={4} 
            onClick={() => navigate('/organizer/registrations')}
          >
            Back to Registrations
          </Button>
          
          {isPending && (
            <>
              <Button 
                colorScheme="red" 
                variant="outline" 
                mr={4}
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
          
          {isCompleted && registration.invoice && (
            <Button
              colorScheme="blue"
              leftIcon={<FiExternalLink />}
              onClick={() => {
                if (registration.invoice.pdfPath) {
                  window.open(getFileUrl(`/uploads/invoices/${registration.invoice.pdfPath}`), '_blank');
                }
              }}
              isDisabled={!registration.invoice.pdfPath}
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