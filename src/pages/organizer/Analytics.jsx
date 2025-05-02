// src/pages/organizer/Analytics.jsx
import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Skeleton,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react';
import { 
  FiClock, 
  FiDollarSign, 
  FiCalendar, 
  FiUsers, 
  FiGrid,
  FiRefreshCw 
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import useAnalytics from '../../hooks/useAnalytics';
import AnalyticsFilters from '../../components/organizer/analytics/AnalyticsFilters';
import KpiCard from '../../components/organizer/analytics/KpiCard';
import ChartContainer from '../../components/organizer/analytics/ChartContainer';
import TimeProcessingChart from '../../components/organizer/analytics/TimeProcessingChart';
import PaymentTimeChart from '../../components/organizer/analytics/PaymentTimeChart';
import ValidationChart from '../../components/organizer/analytics/ValidationChart';
import StandsOccupationChart from '../../components/organizer/analytics/StandsOccupationChart';
import PendingRequestsChart from '../../components/organizer/analytics/PendingRequestsChart';
import GaugeChart from '../../components/organizer/analytics/GaugeChart';

const Analytics = () => {
  const {
    loading,
    error,
    analyticsData,
    events,
    filters,
    updateFilters,
    refreshData
  } = useAnalytics();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  // Helper function to render skeleton or content
  const renderWithSkeleton = (content) => {
    if (loading) {
      return <Skeleton height="100%" borderRadius="lg" />;
    }
    return content;
  };

  // Log data for debugging
  useEffect(() => {
    if (analyticsData) {
      console.log('Analytics data in component:', analyticsData);
    }
  }, [analyticsData]);

  return (
    <DashboardLayout title="Analytics Dashboard">
      <Box p={4} maxW="7xl" mx="auto">
        {/* Header */}
        <Heading size="lg" mb={2}>Analytics Dashboard</Heading>
        <Text color="gray.500" mb={6}>
          Monitor event performance and operational efficiency metrics
        </Text>
        
        {/* Filters */}
        <AnalyticsFilters 
          events={events}
          filters={filters}
          updateFilters={updateFilters}
          refreshData={refreshData}
        />
        
        {/* Display error if any */}
        {error && (
          <Alert status="error" mb={6} borderRadius="lg">
            <AlertIcon />
            <AlertTitle mr={2}>Error loading data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button ml={4} size="sm" colorScheme="red" leftIcon={<FiRefreshCw />} onClick={refreshData}>
              Retry
            </Button>
          </Alert>
        )}
        
        {/* No Data Alert */}
        {!loading && !error && (!analyticsData || !analyticsData.kpis) && (
          <Alert status="info" mb={6} borderRadius="lg">
            <AlertIcon />
            <AlertTitle mr={2}>No analytics data available</AlertTitle>
            <AlertDescription>
              There is no data available for the selected filters. Please try selecting a different event or time period.
            </AlertDescription>
          </Alert>
        )}
        
        {/* KPI Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
          {renderWithSkeleton(
            <KpiCard
              title="Avg. Processing Time"
              value={analyticsData?.kpis?.processingTime?.value || 0}
              unit="hours"
              trend={analyticsData?.kpis?.processingTime?.trend || 0}
              icon={FiClock}
              color="teal"
            />
          )}
          
          {renderWithSkeleton(
            <KpiCard
              title="Avg. Payment Time"
              value={analyticsData?.kpis?.paymentTime?.value || 0}
              unit="hours"
              trend={analyticsData?.kpis?.paymentTime?.trend || 0}
              icon={FiDollarSign}
              color="blue"
            />
          )}
          
          {renderWithSkeleton(
            <KpiCard
              title="Validated Before Deadline"
              value={analyticsData?.kpis?.validatedBeforeDeadline?.value || 0}
              unit="percent"
              trend={analyticsData?.kpis?.validatedBeforeDeadline?.trend || 0}
              icon={FiCalendar}
              color="green"
            />
          )}
          
          {renderWithSkeleton(
            <KpiCard
              title="Pending Requests"
              value={analyticsData?.kpis?.pendingRequests?.value || 0}
              unit="count"
              trend={analyticsData?.kpis?.pendingRequests?.trend || 0}
              icon={FiUsers}
              color="orange"
            />
          )}
        </SimpleGrid>
        
        {/* Main Charts Section */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={6}>
          {/* Processing Time Chart */}
          {renderWithSkeleton(
            <ChartContainer 
              title="Registration Processing Time" 
              description="Average time taken to process registration requests"
            >
              <TimeProcessingChart data={analyticsData} />
            </ChartContainer>
          )}
          
          {/* Gauge Charts */}
          <ChartContainer title="Key Metrics">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {renderWithSkeleton(
                <Box>
                  <Text fontWeight="medium" mb={2} textAlign="center">Processing Efficiency</Text>
                  <GaugeChart 
                    value={analyticsData?.kpis?.processingTime?.value || 0}
                    maxValue={24} // 24 hours as target
                    label="hrs"
                    colorScheme={['#38A169', '#ECC94B', '#E53E3E']}
                    inverse={true} // Lower is better for processing time
                  />
                </Box>
              )}
              
              {renderWithSkeleton(
                <Box>
                  <Text fontWeight="medium" mb={2} textAlign="center">Stand Occupancy</Text>
                  <GaugeChart 
                    value={analyticsData?.kpis?.standsOccupation?.occupancyRate || 0}
                    maxValue={100}
                    label="%"
                    colorScheme={['#38A169', '#ECC94B', '#E53E3E']} // Standard color scheme (green is good)
                  />
                </Box>
              )}
            </SimpleGrid>
          </ChartContainer>
        </Grid>
        
        {/* Secondary Charts */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={6}>
          {/* Payment Time Chart */}
          {renderWithSkeleton(
            <ChartContainer title="Payment Timing Distribution">
              <PaymentTimeChart data={analyticsData} />
            </ChartContainer>
          )}
          
          {/* Validated Before Deadline Chart */}
          {renderWithSkeleton(
            <ChartContainer title="Validations Before Deadline">
              <ValidationChart data={analyticsData} />
            </ChartContainer>
          )}
          
          {/* Stands Occupation Chart */}
          {renderWithSkeleton(
            <ChartContainer title="Stands Occupation">
              <StandsOccupationChart data={analyticsData} />
            </ChartContainer>
          )}
        </SimpleGrid>
        
        {/* Pending Requests Chart - Full Width */}
        {renderWithSkeleton(
          <ChartContainer 
            title="Pending Registration Requests" 
            description="Number of pending registration requests over time"
            mb={6}
          >
            <PendingRequestsChart data={analyticsData} />
          </ChartContainer>
        )}
        
        {/* Stands Reserved Before Event - Highlight Metric */}
        {renderWithSkeleton(
          <ChartContainer 
            title={`Stands Reserved ${analyticsData?.kpis?.standsBeforeEvent?.daysBeforeEvent || 30} Days Before Event`}
            description="Percentage of stands reserved before the event start date"
          >
            <Flex height="100px" align="center" justify="center">
              <Text fontSize="5xl" fontWeight="bold" color={useColorModeValue('purple.500', 'purple.300')}>
                {analyticsData?.kpis?.standsBeforeEvent?.value || 0}%
              </Text>
            </Flex>
          </ChartContainer>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Analytics;