import Link from "next/link";
import React from "react";

export type ButtonVariant =
  | "gradient"
  | "outline"
  | "primary"
  | "text"
  | "secondary"
  | "ghost";
export type ButtonSize = "small" | "medium" | "large";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
}

interface ButtonAsButton
  extends BaseButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  as?: "button";
  href?: never;
  external?: never;
}

interface ButtonAsLink extends BaseButtonProps {
  as: "link";
  href: string;
  external?: boolean;
  onClick?: () => void;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

// Shared styles function - can be used externally too
export const getButtonStyles = (
  variant: ButtonVariant = "primary",
  size: ButtonSize = "medium",
  className: string = "",
) => {
  const baseStyles =
    "group relative flex w-fit font-semibold uppercase tracking-wider transition-all duration-200 ease-out rounded-md overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center";

  const variantStyles: Record<ButtonVariant, string> = {
    gradient:
      "bg-gradient-to-r from-[#e4c273] via-[#c89f4a] to-[#d8bb71] text-white border border-transparent hover:shadow-[4px_4px_0_0_#c89f4a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0_0_#c89f4a] active:translate-x-0 active:translate-y-0",
    outline:
      "bg-transparent text-white border border-white/60 hover:shadow-[4px_4px_0_0_#c89f4a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0_0_#c89f4a] active:translate-x-0 active:translate-y-0",
    primary:
      "bg-white text-black-900 border-0 hover:shadow-[4px_4px_0_0_#c89f4a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0_0_#c89f4a] active:translate-x-0 active:translate-y-0",
    text: "bg-transparent text-white/80 border-0 hover:text-white relative after:absolute after:bottom-2 after:left-3 after:right-3 after:h-[2px] after:bg-white after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100",
    secondary:
      "bg-white text-black border-0 hover:shadow-[4px_4px_0_0_#c89f4a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0_0_#c89f4a] active:translate-x-0 active:translate-y-0",
    ghost:
      "bg-transparent text-white border-0 hover:bg-white/10 hover:shadow-[2px_2px_0_0_#c89f4a]",
  };


  const sizeStyles: Record<ButtonSize, string> = {
    small: "px-4 py-2 text-xs",
    medium: "px-5 py-3 text-sm",
    large: "px-8 py-4 text-base",
  };

  return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`
    .replace(/\s+/g, " ")
    .trim();
};

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      size = "medium",
      children,
      className = "",
      ...props
    },
    ref,
  ) => {
    const combinedClassName = getButtonStyles(variant, size, className);

    // Link variant
    if (props.as === "link") {
      const { as, href, external, onClick, ...rest } = props;

      if (external) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={combinedClassName}
            onClick={onClick}
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
          onClick={onClick}
        >
          {children}
        </Link>
      );
    }

    // Button variant (default)
    const { as, ...buttonProps } = props as ButtonAsButton;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={combinedClassName}
        {...buttonProps}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
