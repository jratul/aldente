"use client";
import { useState } from "react";

const MAX_IMAGE_COUNT = 10;

export default function ImageUpload() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalFiles = files.length + selectedFiles.length;

      setFiles(prevFiles => [
        ...prevFiles,
        ...selectedFiles.slice(0, MAX_IMAGE_COUNT - prevFiles.length),
      ]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleClearFiles = () => {
    setFiles([]);
  };

  return (
    <div className="p-4 h-96">
      <div className="flex justify-between mb-2">
        <span>10장까지 사진을 올릴 수 있어요</span>
        <button onClick={handleClearFiles}>전체 삭제</button>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {files.map((file, index) => (
          <div
            key={index}
            className="relative w-full h-32 overflow-hidden rounded border"
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`미리보기 ${index + 1}`}
              className="object-cover"
            />
            <button
              onClick={() => handleRemoveFile(index)}
              className="absolute top-1 right-1 bg-blue-500 text-white text-base rounded-full w-6 h-6 align-middle hover:bg-blue-400"
            >
              &times;
            </button>
          </div>
        ))}
        {files.length < 10 && (
          <div className="w-full h-32 border border-dashed flex items-center justify-center text-gray-500 rounded border-gray-500">
            <label className="w-full h-full flex justify-center items-center cursor-pointer">
              +
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
