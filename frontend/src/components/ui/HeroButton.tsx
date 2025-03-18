import Link from "next/link";
import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
};

export default function HeroButton({ children, href }: ButtonProps) {
  const roomClass =
    "bg-white/10 text-white border border-white/30 backdrop-blur-sm px-8 py-3 rounded-lg font-medium hover:bg-white/20 transition-all";

  const buttonClass =
    "bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all";

  if (href === "/rooms") {
    return (
      <Link href={href} className={roomClass}>
        {children}
      </Link>
    );
  }

  return <button className={buttonClass}>{children}</button>;
}
