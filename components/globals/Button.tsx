import Link from "next/link";

interface ButtonProps {
  text: string;
  className?: string;
  link?: string;
  secondary?: boolean;
  simple?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

const Button = ({
  text,
  className,
  link,
  secondary,
  simple,
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) => {
  const baseClasses =
    "aabbtt text-[12px] sm:text-[14px] leading-[20px] transition-colors whitespace-nowrap";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  const buttonContent =
    link && !disabled ? <Link href={link}>{text}</Link> : text;

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  if (secondary) {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={handleClick}
        className={`text-white underline hover:text-white/90 sm:px-[30px] sm:py-[12px] px-[20px] py-[10px] rounded-[6px] ${baseClasses} ${disabledClasses} ${className}`}
      >
        {buttonContent}
      </button>
    );
  }

  if (simple) {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={handleClick}
        className={`text-white hover:text-white/90 ${baseClasses} ${disabledClasses} ${className}`}
      >
        {buttonContent}
      </button>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`bg-greencolor text-white font-bold hover:bg-greencolor/80 sm:px-[30px] sm:py-[12px] px-[16px] py-[10px] rounded-[6px] ${baseClasses} ${disabledClasses} ${className}`}
    >
      {buttonContent}
    </button>
  );
};

export default Button;
