export default function Loading() {
  return (
    <div className="w-full h-[500px] flex justify-center items-center flex-col gap-4">
      <div>
        <span className="loader border-red-500 border-4" />
      </div>
      <div className="text-blue-500 font-bold text-xl">
        잠시만 기다려 주세요
      </div>
    </div>
  );
}
