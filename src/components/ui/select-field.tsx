"use client";

import { cn } from "cn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export function SelectField({
    value,
    onValueChange,
    options,
    placeholder = "Select an option",
    className,
    name,
    ariaLabel,
    size = "default",
}: {
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    name?: string;
    ariaLabel?: string;
    size?: "sm" | "default";
}) {
    return (
        <Select
            name={name}
            value={value}
            onValueChange={(nextValue) => {
                if (nextValue !== null) onValueChange(String(nextValue));
            }}
        >
            <SelectTrigger
                aria-label={ariaLabel}
                className={cn("w-full bg-white", className)}
                size={size}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent align="start">
                {options.map((option) => (
                    <SelectItem
                        disabled={option.disabled}
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
