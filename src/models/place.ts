export interface Place {
  place_name: string;
  category_name: string;
  category_group_name: string;
  address_name: string;
  road_address_name: string;
  pos: {
    lat: number;
    lng: number;
  };
  place_url: string;
}
