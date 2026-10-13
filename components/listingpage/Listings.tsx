import Image from "next/image";
import Link from "next/link";
import { HiPlusSm } from "react-icons/hi";
import {proxiedImageUrl} from "@/lib/utils/proxied-image"
const Listings = () => {
  const listings = [
    {
      id: 1,
      image: "/images/L1.png",
      title: "Scenery",
      description: "Scenery is a beautiful thing to look at",
      limited: true,
    },
    {
      id: 2,
      image: "/images/L2.png",
      title: "Scenery",
      description: "Scenery is a beautiful thing to look at",
      limited: false,
    },
    {
      id: 3,
      image: "/images/L3.png",
      title: "Scenery",
      description: "Scenery is a beautiful thing to look at",
      limited: false,
    },
    {
      id: 4,
      image: "/images/L4.png",
      title: "Scenery",
      description: "Scenery is a beautiful thing to look at",
      limited: false,
    },
    {
      id: 5,
      image: "/images/L5.png",
      title: "Scenery",
      description: "Scenery is a beautiful thing to look at",
      limited: false,
    },
    {
      id: 6,
      image: "/images/L6.png",
      title: "Scenery",
      description: "Scenery is a beautiful thing to look at",
      limited: false,
    },
    {
      id: 7,
      image: "/images/L7.png",
      title: "Scenery",
      description: "Scenery is a beautiful thing to look at",
      limited: false,
    },
    {
      id: 8,
      image: "/images/L8.png",
      title: "Scenery",
      description: "Scenery is a beautiful thing to look at",
      limited: false,
    },

    {
      id: 9,
      image: "/images/L9.png",
      title: "Scenery",
      description: "Scenery is a beautiful thing to look at",
      limited: false,
    },
    {
      id: 10,
      image: "/images/L10.png",
      title: "Scenery",
      description: "Scenery is a beautiful thing to look at",
      limited: false,
    },
  ];

  return (
    <div className="space-y-10">
      {listings.map((listing) => (
        <Link
          href={`/project/${listing.id}`}
          key={listing.id}
          className="relative bg-bglight rounded-[20px] w-full"
        >
          {/* Limited Badge */}
          <div
            className={` left-[10px] top-[10px] bg-black/60 backdrop-blur-sm rounded-[10px] px-[10px] py-[8px] z-10 ${
              listing.limited ? "absolute" : "hidden"
            } `}
          >
            <span className="text-white aabbuu font-semibold text-[16px] ">
              Limited
            </span>
          </div>

          {/* Main Listing Image */}
          <div className="flex xsm:items-center justify-between">
            <div className="flex flex-col xsm:flex-row xsm:items-center gap-5 md:gap-10">
              <Image
                src={proxiedImageUrl(listing.image)}
                alt="Property image"
                width={150}
                height={150}
                className="xsm:w-[150px] xlg:w-[250px] xsm:h-[100px] xlg:h-[150px] rounded-[15px] object-cover"
              />
              {/* Content Area */}
              <div>
                <h3 className="text-white aabbss font-semibold text-xl md:text-[24px] xlg:text-[32px] ">
                  {listing.title}
                </h3>
                <p className="text-white aabbss font-medium text-sm md:text-[16px] xlg:text-[20px]  mt-[5px]">
                  {listing.description}
                </p>
              </div>
            </div>

            <HiPlusSm className="text-4xl text-white cursor-pointer" />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Listings;
