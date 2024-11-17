interface Props {
  label: string;
  value: string;
  handleChange: (value: string) => void;
  placeholder?: string;
}

function TextField({ label, value, handleChange, placeholder = "" }: Props) {
  return (
    <label className="block mb-2">
      <span className="text-gray-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange(e.target.value)
        }
        placeholder={placeholder}
        className="mt-1 block w-80 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-400 focus:ring-opacity-50"
      />
    </label>
  );
}

export default TextField;
