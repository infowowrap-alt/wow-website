import type { AnchorHTMLAttributes, ReactNode } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "ghost";
  icon?: ReactNode;
  children: ReactNode;
};

// Bottone-link nei colori del mondo in cui si trova (token --cta-bg / --cta-text).
// Interior: angoli appena smussati, testo in tondo. Garage: angolo tagliato da HUD.
export function Button({ href, variant = "primary", icon, children, className = "", ...rest }: Props) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
      className={`wow-button wow-button--${variant} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </a>
  );
}
