export interface Review {
  uid: string;
  date: Date;
  rating: number;
  images: string[];
  content: string;
  restaurant: {
    name: string;
    pos: {
      lat: number;
      lnt: number;
    };
    address: string;
    category: string;
  };
}
