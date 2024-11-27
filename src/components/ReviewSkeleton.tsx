export default function ReviewSkeleton() {
  return (
    <div>
      <div className="my-2 py-2 animate-pulse">
        <div className="flex justify-between items-center p-2 gap-2">
          <div className="h-10 w-10 rounded-full bg-gray-300"></div>
          <div className="w-40 flex flex-col items-end space-y-2">
            <div className="h-3 rounded bg-gray-300 w-1/2"></div>
            <div className="h-4 rounded bg-gray-300 w-1/3"></div>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full">
          <div className="h-full w-full bg-gray-300"></div>
        </div>
      </div>
      <div className="my-2 py-2 animate-pulse">
        <div className="flex justify-between items-center p-2 gap-2">
          <div className="h-10 w-10 rounded-full bg-gray-300"></div>
          <div className="w-40 flex flex-col items-end space-y-2">
            <div className="h-3 rounded bg-gray-300 w-1/2"></div>
            <div className="h-4 rounded bg-gray-300 w-1/3"></div>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full">
          <div className="h-full w-full bg-gray-300"></div>
        </div>
      </div>
      <div className="my-2 py-2 animate-pulse">
        <div className="flex justify-between items-center p-2 gap-2">
          <div className="h-10 w-10 rounded-full bg-gray-300"></div>
          <div className="w-40 flex flex-col items-end space-y-2">
            <div className="h-3 rounded bg-gray-300 w-1/2"></div>
            <div className="h-4 rounded bg-gray-300 w-1/3"></div>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full">
          <div className="h-full w-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}
