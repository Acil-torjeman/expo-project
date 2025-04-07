import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Button,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Input,
  useToast,
} from '@chakra-ui/react';

const Settings = () => {
  const toast = useToast();

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading size="lg" mb={4}>Settings</Heading>
        <Text color="gray.600" mb={6}>Manage application settings and preferences</Text>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <Heading size="md">Account Settings</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack spacing={4} align="start">
                <FormControl>
                  <FormLabel>Email Notifications</FormLabel>
                  <Switch colorScheme="teal" defaultChecked />
                </FormControl>
                <FormControl>
                  <FormLabel>Two-Factor Authentication</FormLabel>
                  <Switch colorScheme="teal" />
                </FormControl>
                <FormControl>
                  <FormLabel>Session Timeout (minutes)</FormLabel>
                  <Select defaultValue="30">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </Select>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
          
          {/* System Settings */}
          <Card>
            <CardHeader>
              <Heading size="md">System Settings</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack spacing={4} align="start">
                <FormControl>
                  <FormLabel>Default Language</FormLabel>
                  <Select defaultValue="en">
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Date Format</FormLabel>
                  <Select defaultValue="MM/DD/YYYY">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Items Per Page</FormLabel>
                  <Select defaultValue="10">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Select>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
          
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <Heading size="md">Email Settings</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack spacing={4} align="start">
                <FormControl>
                  <FormLabel>SMTP Server</FormLabel>
                  <Input defaultValue="smtp.example.com" />
                </FormControl>
                <FormControl>
                  <FormLabel>SMTP Port</FormLabel>
                  <Input defaultValue="587" />
                </FormControl>
                <FormControl>
                  <FormLabel>Send Test Email</FormLabel>
                  <Button size="sm" colorScheme="teal">Send Test</Button>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
          
          {/* Backup Settings */}
          <Card>
            <CardHeader>
              <Heading size="md">Backup & Maintenance</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack spacing={4} align="start">
                <FormControl>
                  <FormLabel>Automatic Backups</FormLabel>
                  <Switch colorScheme="teal" defaultChecked />
                </FormControl>
                <FormControl>
                  <FormLabel>Backup Frequency</FormLabel>
                  <Select defaultValue="daily">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Maintenance Mode</FormLabel>
                  <Switch colorScheme="red" />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
        
        <Box mt={6} display="flex" justifyContent="flex-end">
          <Button mr={3} variant="outline">Cancel</Button>
          <Button colorScheme="teal" onClick={handleSave}>Save Settings</Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Settings;