"use client"

import * as React from "react"
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

// Interface compatible avec l'ancien composant Select
export interface CustomSelectProps {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (e: { target: { name?: string; value: string } }) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  name?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  label,
  className,
  name,
}: CustomSelectProps) {
  const handleValueChange = (newValue: string) => {
    // Simuler un événement d'input pour rester compatible avec l'API existante
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className={className}>
      {label && <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>}
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {label && <SelectLabel>{label}</SelectLabel>}
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
