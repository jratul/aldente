export interface Review {
  id: string;
  uid: string;
  date: Date;
  rating: number;
  images: string[];
  imageFiles: File[];
  title: string;
  content: string;
  restaurant: {
    name: string;
    pos: {
      lat: number;
      lng: number;
    };
    address: string;
    roadAddress: string;
    category: string;
    placeUrl: string;
  };
}
