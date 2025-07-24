"use client";

interface BadgeProps {
  label: string;
}

export function Badge({ label }: BadgeProps) {
  return (
    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
      {label}
    </span>
  );
}
