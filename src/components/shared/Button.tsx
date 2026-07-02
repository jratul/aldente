import clsx from "clsx";

interface Props {
  children: React.ReactNode;
  handleClick: () => void;
  disabled?: boolean;
}

export default function Button({
  children,
  handleClick,
  disabled = false,
}: Props) {
  return (
    <button
      type="button"
      className={clsx(
        "p-2 rounded text-center w-full",
        disabled
          ? "bg-gray-300 text-gray-500"
          : "bg-blue-500 text-white hover:bg-blue-400 cursor-pointer",
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
