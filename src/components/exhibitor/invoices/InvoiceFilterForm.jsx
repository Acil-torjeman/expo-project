// src/components/exhibitor/invoices/InvoiceFilterForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Select,
  VStack,
  Heading,
  Input,
  Divider,
} from '@chakra-ui/react';
import eventService from '../../../services/event.service';

const InvoiceFilterForm = ({ filters, setFilters }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch events for dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await eventService.getPublicEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Handle filter changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <Box>
      <VStack spacing={5} align="start" width="100%">
        <Heading size="sm">Invoice Filters</Heading>
        
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select 
            name="status" 
            value={filters.status || ''} 
            onChange={handleChange}
            placeholder="All Statuses"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Event</FormLabel>
          <Select 
            name="event" 
            value={filters.event || ''} 
            onChange={handleChange}
            placeholder="All Events"
            isDisabled={loading || events.length === 0}
          >
            {events.map(event => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </Select>
        </FormControl>
        
        <Divider />
        
        <Heading size="sm">Date Range</Heading>
        
        <FormControl>
          <FormLabel>From Date</FormLabel>
          <Input
            type="date"
            name="startDate"
            value={filters.startDate || ''}
            onChange={handleChange}
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>To Date</FormLabel>
          <Input
            type="date"
            name="endDate"
            value={filters.endDate || ''}
            onChange={handleChange}
          />
        </FormControl>
      </VStack>
    </Box>
  );
};

export default InvoiceFilterForm;