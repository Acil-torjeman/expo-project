// src/constants/industrySectors.js

// Original sectors array for backward compatibility
const industrySectors = [
  {
    name: 'Technology',
    subsectors: [
      'Software Development',
      'Hardware Manufacturing',
      'Artificial Intelligence',
      'Cybersecurity',
      'Cloud Services',
      'Internet of Things',
      'Telecommunications',
    ],
  },
  {
    name: 'Manufacturing',
    subsectors: [
      'Automotive',
      'Aerospace',
      'Electronics',
      'Pharmaceuticals',
      'Textiles',
      'Food Processing',
      'Industrial Equipment',
    ],
  },
  {
    name: 'Healthcare',
    subsectors: [
      'Medical Devices',
      'Pharmaceuticals',
      'Biotechnology',
      'Healthcare Services',
      'Telemedicine',
      'Medical Research',
    ],
  },
  {
    name: 'Financial Services',
    subsectors: [
      'Banking',
      'Insurance',
      'Investment Management',
      'Financial Technology',
      'Asset Management',
      'Credit Services',
    ],
  },
  {
    name: 'Retail & Consumer Goods',
    subsectors: [
      'E-commerce',
      'Apparel & Fashion',
      'Food & Beverages',
      'Home Goods',
      'Electronics Retail',
      'Luxury Goods',
    ],
  },
  {
    name: 'Energy',
    subsectors: [
      'Oil & Gas',
      'Renewable Energy',
      'Nuclear Energy',
      'Energy Storage',
      'Energy Distribution',
      'Energy Efficiency',
    ],
  },
  {
    name: 'Agriculture',
    subsectors: [
      'Crop Production',
      'Livestock Farming',
      'Agricultural Technology',
      'Forestry',
      'Food Processing',
      'Fishery',
    ],
  },
  {
    name: 'Construction & Real Estate',
    subsectors: [
      'Residential Construction',
      'Commercial Construction',
      'Architecture',
      'Civil Engineering',
      'Property Management',
      'Real Estate Development',
    ],
  },
  {
    name: 'Transportation & Logistics',
    subsectors: [
      'Freight & Logistics',
      'Passenger Transportation',
      'Supply Chain Management',
      'Warehousing',
      'Shipping',
      'Aviation',
    ],
  },
  {
    name: 'Education',
    subsectors: [
      'K-12 Education',
      'Higher Education',
      'Professional Training',
      'EdTech',
      'Language Learning',
      'Special Education',
    ],
  },
  {
    name: 'Entertainment & Media',
    subsectors: [
      'Film & Television',
      'Publishing',
      'Gaming',
      'Social Media',
      'Music',
      'Sports & Recreation',
    ],
  },
  {
    name: 'Other',
    subsectors: [
      'Consulting',
      'Non-profit',
      'Government',
      'Research',
      'Hospitality',
      'Tourism',
    ],
  },
];

// Convert the array to an object structure with keys for easier access
export const IndustrySectors = {
  TECHNOLOGY: {
    name: 'Technology',
    subsectors: industrySectors.find(s => s.name === 'Technology')?.subsectors || []
  },
  MANUFACTURING: {
    name: 'Manufacturing',
    subsectors: industrySectors.find(s => s.name === 'Manufacturing')?.subsectors || []
  },
  HEALTHCARE: {
    name: 'Healthcare',
    subsectors: industrySectors.find(s => s.name === 'Healthcare')?.subsectors || []
  },
  FINANCE: {
    name: 'Financial Services',
    subsectors: industrySectors.find(s => s.name === 'Financial Services')?.subsectors || []
  },
  RETAIL: {
    name: 'Retail & Consumer Goods',
    subsectors: industrySectors.find(s => s.name === 'Retail & Consumer Goods')?.subsectors || []
  },
  ENERGY: {
    name: 'Energy',
    subsectors: industrySectors.find(s => s.name === 'Energy')?.subsectors || []
  },
  AGRICULTURE: {
    name: 'Agriculture',
    subsectors: industrySectors.find(s => s.name === 'Agriculture')?.subsectors || []
  },
  CONSTRUCTION: {
    name: 'Construction & Real Estate',
    subsectors: industrySectors.find(s => s.name === 'Construction & Real Estate')?.subsectors || []
  },
  TRANSPORTATION: {
    name: 'Transportation & Logistics',
    subsectors: industrySectors.find(s => s.name === 'Transportation & Logistics')?.subsectors || []
  },
  EDUCATION: {
    name: 'Education',
    subsectors: industrySectors.find(s => s.name === 'Education')?.subsectors || []
  },
  ENTERTAINMENT: {
    name: 'Entertainment & Media',
    subsectors: industrySectors.find(s => s.name === 'Entertainment & Media')?.subsectors || []
  },
  OTHER: {
    name: 'Other',
    subsectors: industrySectors.find(s => s.name === 'Other')?.subsectors || []
  }
};

// Helper function to get all sectors as an array for dropdown menus
export const getAllSectors = () => {
  return Object.entries(IndustrySectors).map(([key, value]) => ({
    id: key,
    name: value.name
  }));
};

// Helper function to get all subsectors for a given sector
export const getSubsectors = (sectorId) => {
  if (sectorId && IndustrySectors[sectorId]) {
    return IndustrySectors[sectorId].subsectors;
  }
  return [];
};

// Export the original array as default for backward compatibility
export default industrySectors;