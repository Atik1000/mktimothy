"use client";
import Image from "next/image";
import { useAuth } from "@/lib/providers/auth-provider";
import Link from "next/link";

export default function PrivateStays() {
  const { user } = useAuth();

  const sectors = [
    {
      img: "/images/sectors/tourism.png",
      link:"/all-listings?sector=cmqfgpfq7000092blv2ip6fyd",
      title: "Tourism & Hospitality",
      listings: 4,
    },
    {
      img: "/images/sectors/agriculture.png",
      link: "/all-listings?sector=cmqfgpfxt000192blty7xatby",
      title: "Agriculture & Agribusiness",
      listings: 4,
    },
    {
      img: "/images/sectors/manufacturing.png",
      link: "/all-listings?sector=cmqfgpg5j000392bl90be57tg",
      title: "Manufacturing",
    },
  ];
  return (
    <section className="mb-[80px] overflow-hidden">
      {/* Dark rounded container card */}

      <div className="flex flex-col xmd:flex-row xmd:items-center gap-[20px] md:gap-[60px] mb-[60px] border border-lightgray rounded-[30px] p-[16px] md:p-[40px] overflow-hidden">
        <div className="w-[240px] md:w-[250px] flex-shrink-0">
          <h2 className="text-white aabbss font-bold text-[24px] md:text-[32px] mb-[20px] md:mb-[30px]">
            Popular Sectors
          </h2>
          <p className="text-white aabbss text-[16px] md:text-[20px] leading-[27px]">
            Explore high-growth opportunities across various industries tailored for success.
          </p>
        </div>

        {/* Property images grid - 2 top, 1 bottom spanning 2 columns */}
        <div className="flex items-center overflow-x-auto scrollbar-hide gap-[15px]">
          {/* Top row - 2 images */}
          {sectors.map((item) => (
            <Link
              href={item.link}
              key={item.img}
              className="h-[260px] relative rounded-[20px] overflow-hidden flex-shrink-0 w-full max-w-[400px]"
            >
              <Image
                src={item.img}
                alt={item.title}
                width={400}
                height={260}
                className="w-full h-full object-cover"
              />

              {item.listings && (
                <div className="absolute top-[15px] right-[15px] bg-black text-white aabbss font-bold text-[12px] px-[10px] py-[5px] rounded-[6px]">
                  {item.listings} listings
                </div>
              )}

              <p className="text-white aabbss font-bold text-[16px] leading-[22px] absolute bottom-[15px] left-[15px] bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
      {/* Feature icons */}
      <div className="flex gap-[20px] md:gap-[40px] overflow-x-auto scrollbar-hide">
        {[
          {
            icon: "/images/icon1.png",
            title: "Peace Of Mind",
            desc: "Enjoy a hassle-free experience with verified listings and secure transactions.",
          },
          {
            icon: "/images/icon2.png",
            title: "More Quality Time",
            desc: "Spend less time searching and more time enjoying your perfect stay with our curated selections.",
          },
          {
            icon: "/images/icon3.png",
            title: "Total Privacy",
            desc: "Experience the comfort and absolute privacy of a true home away from home.",
          },
          {
            icon: "/images/icon4.png",
            title: "Exclusive Perks",
            desc: "Discover unique amenities and premium benefits tailored to elevate your lifestyle.",
          },
        ].map((item, index) => (
          <div key={index} className="flex-shrink-0 w-full max-w-[300px]">
            <div className="w-[30px] h-[30px] rounded-[15px] flex items-center justify-center mb-[20px]">
              <Image src={item.icon} alt={item.title} width={28} height={28} />
            </div>
            <p className="text-white aabbss font-bold text-[16px] md:text-[18px] leading-[25px] mb-[15px]">
              {item.title}
            </p>
            <p className="text-white aabbss text-[13px] md:text-[14px] leading-[20px]">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Box with Calendar */}
      <div className="relative rounded-[20px] overflow-hidden mt-[40px] p-5 md:p-10 min-h-[350px] flex items-center">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          ref={(el) => {
            if (el) el.playbackRate = 0.5;
          }}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/construction.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/70 z-0" />

        {/* CTA Card */}
        <div className="bg-white rounded-[20px] p-5 md:p-[30px] max-w-[400px] relative shadow-2xl">
          <h3 className="text-bglight aabbss font-extrabold text-[24px] md:text-[32px] mb-[10px] md:mb-[20px]">
            Ready to list your property?
          </h3>
          <p className="text-bglight aabbss text-[16px] md:text-[20px] mb-[20px] md:mb-[30px]">
            Join thousands of property owners who are already reaching a global audience of eager renters and buyers.
          </p>
          
          
        </div>
      </div>
    </section>
  );
}
