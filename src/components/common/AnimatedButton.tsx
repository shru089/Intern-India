import React, { ElementType } from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  className?: string;
  icon?: ElementType | null;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const AnimatedButton = ({
  children,
  onClick,
  className = '',
  icon: Icon,
  disabled = false,
  type = 'button',
}: AnimatedButtonProps) => (
  <motion.button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn-primary ${className}`}
    whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
    whileTap={!disabled ? { scale: 0.98, y: 0 } : {}}
  >
    {Icon && (
      <span className="relative z-10">
        <Icon size={20} />
      </span>
    )}
    <span className="relative z-10">{children}</span>
  </motion.button>
);

export default AnimatedButton;