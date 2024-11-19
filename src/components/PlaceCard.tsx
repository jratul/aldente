import { Place } from "@models/place";

interface Props {
  place: Place;
}

export default function PlaceCard({ place }: Props) {
  return (
    <div className="mx-2 rounded shadow p-4">
      <div className="flex gap-2 items-center">
        <div className="text-xl font-bold">{place.place_name}</div>
        <div className="text-blue-600">{place.category_name}</div>
      </div>
      <div className="text-sm text-slate-500">{place.address_name}</div>
      <div className="text-sm text-slate-500">{place.road_address_name}</div>
    </div>
  );
}
