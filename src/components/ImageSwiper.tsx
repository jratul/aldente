"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Props {
  images: string[];
  restaurantName: string;
}

export default function ImageSwiper({ images, restaurantName }: Props) {
  return (
    <Swiper
      slidesPerView={1}
      modules={[Navigation, Pagination]}
      loop
      navigation
      pagination={{ clickable: true }}
      className="h-[600px]"
    >
      {images.map((img, idx) => (
        <SwiperSlide key={idx}>
          <Image
            width={800}
            height={600}
            src={img}
            alt={`${restaurantName}${idx}`}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
