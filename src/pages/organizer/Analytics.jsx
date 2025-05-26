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
  FiUsers, 
  FiPackage,
  FiRefreshCw 
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import useAnalytics from '../../hooks/useAnalytics';
import AnalyticsFilters from '../../components/organizer/analytics/AnalyticsFilters';
import KpiCard from '../../components/organizer/analytics/KpiCard';
import ChartContainer from '../../components/organizer/analytics/ChartContainer';
import TimeProcessingChart from '../../components/organizer/analytics/TimeProcessingChart';
import PaymentTimeChart from '../../components/organizer/analytics/PaymentTimeChart';
import EquipmentReservedChart from '../../components/organizer/analytics/EquipmentReservedChart';
import RevenueChart from '../../components/organizer/analytics/RevenueChart';
import PendingRequestsChart from '../../components/organizer/analytics/PendingRequestsChart';

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
          Monitor event performance and revenue metrics
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
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mb={6}>
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
              icon={FiClock}
              color="blue"
            />
          )}
          
          {renderWithSkeleton(
            <KpiCard
              title="Equipment Reserved"
              value={analyticsData?.kpis?.equipmentReserved?.value || 0}
              unit="count"
              trend={analyticsData?.kpis?.equipmentReserved?.trend || 0}
              icon={FiPackage}
              color="green"
            />
          )}
          
          {renderWithSkeleton(
            <KpiCard
              title="Total Revenue"
              value={analyticsData?.kpis?.totalRevenue?.value || 0}
              unit="currency"
              trend={analyticsData?.kpis?.totalRevenue?.trend || 0}
              icon={FiDollarSign}
              color="purple"
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
        
        {/* Charts Section */}
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
          
          {/* Revenue Chart */}
          {renderWithSkeleton(
            <ChartContainer 
              title="Revenue Overview"
              description="Total revenue from paid invoices"
            >
              <RevenueChart data={analyticsData} />
            </ChartContainer>
          )}
        </Grid>
        
        {/* Secondary Charts */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={6}>
          {/* Payment Time Chart */}
          {renderWithSkeleton(
            <ChartContainer title="Payment Timing Distribution">
              <PaymentTimeChart data={analyticsData} />
            </ChartContainer>
          )}
          
          {/* Equipment Reserved Chart */}
          {renderWithSkeleton(
            <ChartContainer title="Equipment Reserved">
              <EquipmentReservedChart data={analyticsData} />
            </ChartContainer>
          )}
          
          {/* Pending Requests Chart */}
          {renderWithSkeleton(
            <ChartContainer title="Pending Requests">
              <PendingRequestsChart data={analyticsData} />
            </ChartContainer>
          )}
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  );
};

export default Analytics;