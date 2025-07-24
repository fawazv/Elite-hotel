"use client";

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: SortOption[];
}

export function SortSelect({
  value,
  onChange,
  options = [
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "rating-desc", label: "Rating: High to Low" },
    { value: "recommended", label: "Recommended" },
  ],
}: SortSelectProps) {
  return (
    <select
      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      aria-label="Sort results"
      value={value}
      onChange={onChange}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
