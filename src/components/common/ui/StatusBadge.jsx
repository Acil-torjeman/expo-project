// src/components/common/ui/StatusBadge.jsx
import React from 'react';
import { Badge, Flex, Icon, Tooltip } from '@chakra-ui/react';
import { 
  FiCheck, 
  FiClock, 
  FiX, 
  FiAlertCircle, 
  FiLock, 
  FiTrash2,
  FiAlertTriangle
} from 'react-icons/fi';
import { getStatusColorScheme } from '../../../constants/roles';

/**
 * A customizable status badge component with icons and tooltips
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - The status value (active, pending, inactive, rejected, deleted)
 * @param {boolean} props.showIcon - Whether to show the status icon
 * @param {boolean} props.showTooltip - Whether to show a tooltip on hover
 * @param {Object} props.customConfig - Custom configuration for status display
 * @param {string} props.customTooltip - Custom tooltip text (overrides default)
 * @param {Object} props.badgeProps - Additional props for the Badge component
 */
const StatusBadge = ({ 
  status, 
  showIcon = true,
  showTooltip = true,
  customConfig = null,
  customTooltip = null,
  ...badgeProps 
}) => {
  // Status configuration with color scheme, icon, and tooltip message
  const defaultStatusConfig = {
    active: {
      colorScheme: 'green',
      icon: FiCheck,
      tooltip: 'Active account',
      variant: 'subtle',
    },
    pending: {
      colorScheme: 'yellow',
      icon: FiClock,
      tooltip: 'Pending approval',
      variant: 'subtle',
    },
    inactive: {
      colorScheme: 'gray',
      icon: FiLock,
      tooltip: 'Account temporarily deactivated',
      variant: 'subtle',
    },
    rejected: {
      colorScheme: 'red',
      icon: FiX,
      tooltip: 'Account rejected',
      variant: 'subtle',
    },
    deleted: {
      colorScheme: 'red',
      variant: 'outline',
      icon: FiTrash2,
      tooltip: 'Account deleted (temporarily in trash)',
    },
    expiring: {
      colorScheme: 'orange',
      icon: FiAlertTriangle,
      tooltip: 'Account expiring soon',
      variant: 'subtle',
    },
    suspended: {
      colorScheme: 'red',
      icon: FiAlertCircle,
      tooltip: 'Account suspended due to violations',
      variant: 'subtle',
    },
    // Ajout des rôles avec une variante claire
    admin: {
      colorScheme: 'purple',
      icon: null,
      tooltip: 'Administrator',
      variant: 'subtle',
    },
    organizer: {
      colorScheme: 'blue',
      icon: null,
      tooltip: 'Event Organizer',
      variant: 'subtle',
    },
    exhibitor: {
      colorScheme: 'orange',
      icon: null,
      tooltip: 'Exhibitor',
      variant: 'subtle',
    },
  };

  // Default config if status not found
  const defaultConfig = {
    colorScheme: 'gray',
    icon: null,
    tooltip: status || 'Unknown status',
    variant: 'subtle',
  };

  // Get config for the current status (or default)
  let config = defaultStatusConfig[status?.toLowerCase()] || defaultConfig;
  
  // Override with custom config if provided
  if (customConfig) {
    config = { ...config, ...customConfig };
  }
  
  // Get tooltip text (custom or from config)
  const tooltipText = customTooltip || config.tooltip;

  // Render the badge with or without tooltip
  const badge = (
    <Badge
      colorScheme={config.colorScheme}
      variant={config.variant || 'subtle'}
      borderRadius="full"
      px={2}
      py={0.5}
      fontSize="xs"
      textTransform="capitalize"
      {...badgeProps}
    >
      <Flex align="center">
        {showIcon && config.icon && (
          <Icon 
            as={config.icon} 
            boxSize={3} 
            mr={1}
          />
        )}
        {status || 'Unknown'}
      </Flex>
    </Badge>
  );

  // Wrap with tooltip if showTooltip is true
  if (showTooltip) {
    return (
      <Tooltip 
        label={tooltipText}
        hasArrow
        placement="top"
      >
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

export default StatusBadge;