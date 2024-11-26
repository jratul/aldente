"useClient";

import useAlertStore from "@hooks/useAlertStore";
import Button from "./Button";

export default function Alert() {
  const { open, title, content, buttonLabel, closeAlert } = useAlertStore();

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-20 h-screen w-screen bg-black/30"
      onClick={closeAlert}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md bg-white px-5 py-3 shadow-2xl"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className="mb-4 text-lg font-bold">{title}</div>
        {content && <div className="mb-4 text-sm">{content}</div>}
        <div className="mt-6 flex justify-end">
          <Button handleClick={closeAlert}>{buttonLabel}</Button>
        </div>
      </div>
    </div>
  );
}
