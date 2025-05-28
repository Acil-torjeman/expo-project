// src/constants/sidebarConfig.js
import { 
  FiHome, 
  FiUsers, 
  FiTrash2, 
  FiMessageCircle, 
  FiBell, 
  FiSettings,
  FiGrid,
  FiCalendar,
  FiBox,
  FiMap,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiBarChart2,
  FiHelpCircle,
  FiShield,
  FiUser
} from 'react-icons/fi';
import { UserRole } from './roles';

/**
 * Configuration for sidebar navigation elements
 * Each item includes:
 * - path: URL path for navigation
 * - icon: Icon component to display
 * - label: Text displayed in the sidebar
 */
const sidebarConfig = {
  // Admin sidebar items
  [UserRole.ADMIN]: [
    { 
      path: '/admin/dashboard', 
      icon: FiHome, 
      label: 'Home',
    },
    { 
      path: '/admin/accounts', 
      icon: FiUsers, 
      label: 'Accounts',
    },
    { 
      path: '/admin/trash', 
      icon: FiTrash2, 
      label: 'Trash',
    },
    // Common items (shared across all roles)
    { 
      path: '/profile', 
      icon: FiUser, 
      label: 'My Profile',
    },
  ],
  
  // Organizer sidebar items
  [UserRole.ORGANIZER]: [
    { 
      path: '/organizer/dashboard', 
      icon: FiHome, 
      label: 'Home',
    },
    { 
      path: '/organizer/events', 
      icon: FiCalendar, 
      label: 'Events',
    },
    { 
      path: '/organizer/plans', 
      icon: FiMap, 
      label: 'Floor Plans',
    },
    { 
      path: '/organizer/equipment', 
      icon: FiBox, 
      label: 'Equipment',
    },
    { 
      path: '/organizer/registrations', 
      icon: FiClipboard, 
      label: 'Registrations',
    },
    { 
      path: '/organizer/invoices', 
      icon: FiFileText, 
      label: 'Invoices',
    },
    { 
      path: '/organizer/analytics', 
      icon: FiBarChart2, 
      label: 'Analytics',
    },
    // Common items
    { 
      path: '/profile', 
      icon: FiUser, 
      label: 'My Profile',
    },
  ],
  
  // Exhibitor sidebar items
  [UserRole.EXHIBITOR]: [
    { 
      path: '/exhibitor/dashboard', 
      icon: FiHome, 
      label: 'Home',
    },
    { 
      path: '/exhibitor/events', 
      icon: FiCalendar, 
      label: 'Events',
    },
    { 
      path: '/exhibitor/registrations', 
      icon: FiClipboard, 
      label: 'My Registrations',
    },
    { 
      path: '/exhibitor/invoices', 
      icon: FiFileText, 
      label: 'Invoices',
    },

    // Common items
    { 
      path: '/profile', 
      icon: FiUser, 
      label: 'My Profile',
    },
  ]
};

/**
 * Get menu items for a specific role
 * @param {string} role - User role (admin, organizer, exhibitor)
 * @returns {Array} Menu items for the role
 */
export const getMenuForRole = (role) => {
  // Return all menu items for the role
  return sidebarConfig[role] || [];
};

export default sidebarConfig;