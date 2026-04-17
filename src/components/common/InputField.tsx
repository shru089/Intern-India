import React, { TextareaHTMLAttributes, InputHTMLAttributes } from 'react';

type InputVariant = 'light' | 'dark';

interface BaseProps {
  id: string;
  label: string;
  variant?: InputVariant;
  className?: string;
}

interface InputProps extends BaseProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  as?: 'input';
}

interface TextareaProps extends BaseProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  as: 'textarea';
}

type InputFieldProps = InputProps | TextareaProps;

const InputField = ({ id, label, variant = 'light', className = '', as: Tag = 'input', ...rest }: InputFieldProps) => {
  const baseClasses = "peer w-full px-4 py-3 border-2 rounded-lg placeholder-transparent focus:outline-none transition-colors disabled:opacity-50";

  const variants: Record<InputVariant, string> = {
    light: "bg-slate-100 border-slate-200 text-slate-800 focus:border-primary",
    dark: "bg-neutral-800/50 border-neutral-700 text-white focus:border-primary",
  };

  const labelBaseClasses = "absolute left-4 px-1 transition-all peer-placeholder-shown:text-base peer-focus:text-sm";

  const labelVariants: Record<InputVariant, string> = {
    light: "bg-slate-100 text-slate-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-primary",
    dark: "bg-neutral-800 text-neutral-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-primary",
  };

  const fieldClassName = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <div className="relative">
      {Tag === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          className={`${fieldClassName} min-h-[120px]`}
          placeholder={label}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={(rest as TextareaHTMLAttributes<HTMLTextAreaElement>).rows ?? 4}
        />
      ) : (
        <input
          id={id}
          name={id}
          className={fieldClassName}
          placeholder={(rest as InputProps).placeholder ?? label}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      <label htmlFor={id} className={`${labelBaseClasses} ${labelVariants[variant]}`}>
        {label}
      </label>
    </div>
  );
};

export default InputField;