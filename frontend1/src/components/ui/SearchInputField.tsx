// components/InputField.tsx
"use client";
import { ReactNode } from "react";

interface InputFieldProps {
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  placeholder?: string;
  label?: string;
  icon?: ReactNode;
  options?: { value: string; label: string }[];
}

export default function InputField({
  type = "text",
  value,
  onChange,
  placeholder,
  label,
  icon,
  options,
}: InputFieldProps) {
  return (
    <div className={`space-y-2 `}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {type === "select" ? (
          <select
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        )}
        {icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
