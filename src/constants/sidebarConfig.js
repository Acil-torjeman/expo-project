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
  FiShield
} from 'react-icons/fi';
import { UserRole } from './roles';

/**
 * Configuration pour les éléments de navigation de la sidebar
 * Chaque élément comprend:
 * - path: Chemin URL pour la navigation
 * - icon: Composant d'icône à afficher
 * - label: Texte affiché dans la sidebar
 */
const sidebarConfig = {
  // Éléments de la sidebar pour les administrateurs
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
 


  ],
  
  // Éléments de la sidebar pour les organisateurs
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
  ],
  
  // Éléments de la sidebar pour les exposants
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
    { 
      path: '/exhibitor/payments', 
      icon: FiCreditCard, 
      label: 'Payments',
    },

  ]
};

/**
 * Récupère les éléments du menu pour un rôle spécifique
 * @param {string} role - Rôle de l'utilisateur (admin, organizer, exhibitor)
 * @returns {Array} Tableau d'éléments du menu accessibles
 */
export const getMenuForRole = (role) => {
  // Retourne tous les éléments du menu pour ce rôle
  return sidebarConfig[role] || [];
};

export default sidebarConfig;