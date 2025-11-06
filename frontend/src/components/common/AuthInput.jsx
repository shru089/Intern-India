// src/components/common/AuthInput.jsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const AuthInput = ({ id, type, placeholder, icon, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (isPasswordVisible ? 'text' : 'password') : type;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const handleInputChange = (e) => {
    // Pass the id and value up to the parent form handler
    onChange(id, e.target.value);
  };

  return (
    <motion.div className="relative mb-4" variants={itemVariants}>
      <label
        htmlFor={id}
        className={`absolute left-10 transition-all duration-300 pointer-events-none ${
          isFocused || value
            ? 'top-1 text-xs text-primary-light'
            : 'top-1/2 -translate-y-1/2 text-slate-400'
        }`}
      >
        {placeholder}
      </label>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </div>
      <input
        id={id}
        type={inputType}
        className="w-full bg-slate-900/50 text-white placeholder-transparent p-3 pl-10 rounded-lg border-2 border-transparent focus:border-primary focus:outline-none transition-all"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={handleInputChange} // Use the new handler
        value={value} // Value is now controlled by props
        autoComplete="off"
        required
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </motion.div>
  );
};

export default AuthInput;