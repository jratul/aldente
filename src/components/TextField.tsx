interface Props {
  value: string;
  label?: string;
  placeholder?: string;
  handleChange: (value: string) => void;
  handleKeyDown: () => void;
}

function TextField({
  label,
  value,
  placeholder = "",
  handleChange,
  handleKeyDown,
}: Props) {
  const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleKeyDown();
    }
  };

  return (
    <div className="w-full">
      {label && <span className="text-gray-700 mb-1">{label}</span>}
      <input
        type="text"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange(e.target.value)
        }
        onKeyDown={handleEnter}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-400 focus:ring-opacity-50"
      />
    </div>
  );
}

export default TextField;
