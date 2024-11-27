import TextField from "./shared/TextField";
import EmptySign from "./EmptySign";
import { Place } from "@models/place";

interface Props {
  searchText: string;
  setSearchText: (searchText: string) => void;
  handleSearch: () => void;
  places: Place[];
  setPos: ({ lat, lng }: Place["pos"]) => void;
  setSelectedPlace: (selectedPlace: Place) => void;
}

export default function PlaceSearch({
  searchText,
  setSearchText,
  handleSearch,
  places,
  setPos,
  setSelectedPlace,
}: Props) {
  return (
    <div className="flex flex-col h-full gap-1">
      <div className="flex items-center gap-2">
        <div className="grow">
          <TextField
            placeholder="레스토랑을 찾아보세요"
            value={searchText}
            handleChange={setSearchText}
            handleKeyDown={handleSearch}
          />
        </div>
        <div
          className="border-slate-400 border p-2 rounded-md hover:bg-slate-100 cursor-pointer"
          onClick={handleSearch}
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
      </div>
      <div className="grow p-2 overflow-y-auto min-h-0">
        {places.length === 0 ? (
          <EmptySign label="찾는 레스토랑이 없어요" />
        ) : (
          <>
            {places.map(place => (
              <div
                key={`${place.place_name}${place.pos.lat}${place.pos.lng}`}
                onClick={() => {
                  setPos(place.pos);
                  setSelectedPlace(place);
                }}
                className="cursor-pointer hover:text-blue-500"
              >
                {place.place_name}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
