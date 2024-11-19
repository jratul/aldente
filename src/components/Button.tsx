interface Props {
  children: React.ReactNode;
  handleClick: () => void;
}

export default function Button({ children, handleClick }: Props) {
  return (
    <div
      className="p-2 rounded bg-blue-500 text-white text-center hover:bg-blue-400 cursor-pointer w-full"
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
