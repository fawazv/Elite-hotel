// components/ui/Button.tsx
import React from "react";
import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  customClass?: string;
  open?: boolean;
  scrolled?: boolean;
  href?: string;
  onClick?: () => void;
};

export default function Button({
  children,
  customClass = "",
  open,
  scrolled,
  href,
  onClick,
}: ButtonProps) {
  const linkClass = `${
    open
      ? "text-gray-800 hover:text-primary transition-colors"
      : `${
          scrolled
            ? "text-gray-800 hover:text-primary"
            : "text-white hover:text-white/80"
        } font-medium transition-colors`
  }  `;

  const buttonClass = `${
    open ? "w-full py-3" : "px-6 py-2"
  } bg-primary text-white  rounded-lg font-medium hover:bg-primary/90 transition-colors`;

  if (href) {
    return (
      <Link href={href} className={linkClass} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
}
