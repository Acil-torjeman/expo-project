// src/components/common/ui/ThemeToggleButton.jsx
import React from 'react';
import { IconButton, useColorMode, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * A button component that toggles between light and dark themes
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {string} props.variant - Button variant (ghost, outline, solid)
 */
const ThemeToggleButton = ({ size = 'md', variant = 'ghost', ...rest }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const SwitchIcon = useColorModeValue(FiMoon, FiSun);
  const tooltipLabel = useColorModeValue('Switch to dark theme', 'Switch to light theme');

  return (
    <Tooltip label={tooltipLabel} hasArrow>
      <IconButton
        aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} theme`}
        icon={<SwitchIcon />}
        onClick={toggleColorMode}
        variant={variant}
        size={size}
        colorScheme="teal"
        // Add subtle animation for a more polished feel
        transition="all 0.2s"
        _hover={{ transform: 'scale(1.05)' }}
        _active={{ transform: 'scale(0.95)' }}
        {...rest}
      />
    </Tooltip>
  );
};

export default ThemeToggleButton;