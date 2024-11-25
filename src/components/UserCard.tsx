import { format } from "date-fns";

interface Props {
  photoURL: string;
  displayName: string;
  date: Date;
}

export default function UserCard({ photoURL, displayName, date }: Props) {
  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-2">
        <img
          src={
            photoURL ??
            "https://cdn4.iconfinder.com/data/icons/music-ui-solid-24px/24/user_account_profile-2-64.png"
          }
          alt="userImage"
          className="h-8 w-8 md:h-12 md:w-12 rounded-full"
        />
        <div>{displayName}</div>
      </div>
      <div className="flex items-center">
        <div className="flex flex-col items-end text-xs md:text-sm text-gray-500">
          <div>최근 방문일</div>
          <div>{format(date, "yyyy.MM.dd")}</div>
        </div>
      </div>
    </div>
  );
}
