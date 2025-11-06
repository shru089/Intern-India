import React from 'react';

const InputField = ({ id, label, type, value, onChange, disabled, placeholder, variant = 'light', className = '', as = 'input' }) => {
  const baseClasses = "peer w-full px-4 py-3 border-2 rounded-lg placeholder-transparent focus:outline-none transition-colors disabled:opacity-50";
  
  const variants = {
    light: "bg-slate-100 border-slate-200 text-slate-800 focus:border-primary",
    dark: "bg-neutral-800/50 border-neutral-700 text-white focus:border-primary"
  };

  const labelBaseClasses = "absolute left-4 px-1 transition-all peer-placeholder-shown:text-base peer-focus:text-sm";
  
  const labelVariants = {
    light: "bg-slate-100 text-slate-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-primary",
    dark: "bg-neutral-800 text-neutral-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-primary"
  };

  const commonProps = {
    id,
    name: id,
    required: true,
    value,
    onChange,
    disabled,
    placeholder: placeholder || label,
    className: `${baseClasses} ${variants[variant]} ${className}`
  };

  return (
    <div className="relative">
      {as === 'textarea' ? (
        <textarea {...commonProps} rows="4" className={`${commonProps.className} min-h-[120px]`}></textarea>
      ) : (
        <input {...commonProps} type={type} />
      )}
      <label
        htmlFor={id}
        className={`${labelBaseClasses} ${labelVariants[variant]}`}
      >
        {label}
      </label>
    </div>
  );
};

export default InputField;