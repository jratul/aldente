"use client";

import { useRef } from "react";

const MAX_IMAGE_COUNT = 10;

interface Props {
  files: File[];
  setFilesAction: (files: File[]) => void;
}

export default function ImageUpload({
  files,
  setFilesAction: setFiles,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files);
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      setFiles([
        ...files,
        ...selectedFiles.slice(0, MAX_IMAGE_COUNT - files.length),
      ]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleClearFiles = () => {
    setFiles([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 border border-1 rounded m-2">
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
              className="object-cover w-full h-32"
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
                ref={inputRef}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
