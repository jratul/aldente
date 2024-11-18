interface Props {
  title: string;
}

export default function MapOverlay({ title }: Props) {
  return (
    <div className="bg-blue-500 bg-opacity-90 text-white text-xs rounded-lg -translate-y-20 p-3">
      {title}
    </div>
  );
}
