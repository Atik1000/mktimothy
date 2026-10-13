import Image from "next/image";
import React from "react";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

interface AuthorProfileProps {
  authorName: string;
  authorImage: string;
  email: string;
  phone: string;
  location: string;
  listingId: string;
}

const AuthorProfile: React.FC<AuthorProfileProps> = ({
  authorName,
  authorImage,
  email,
  phone,
  location,
  listingId,
}) => {
  return (
    <div className="border border-lightgray rounded-[20px] p-5 mb-8">
      <div className="">
        <h3 className="text-white text-center aabbss text-[18px] font-bold mb-4">
          Blog Posted By
        </h3>
        <div className="h-[1px] bg-lightgray mb-5" />
        <div className="flex items-center gap-2 justify-start">
          <Image
            src={proxiedImageUrl(authorImage)}
            alt="Author"
            width={80}
            height={91}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full "
          />
          <div className="text-left">
            <h4 className="text-white aabbss text-base sm:text-xl font-bold mb-2">
              {authorName}
            </h4>
            <p className="text-greencolor aabbss text-sm">{location}</p>
          </div>
        </div>
        {/* <div className="w-full h-px bg-lightgray mb-4"></div> */}
      </div>
      {/* <div className="space-y-4 ">
        <div className="flex items-center gap-2">
          <FaEnvelope className="text-greencolor w-6 h-6 flex-shrink-0" />
          <span className="text-white aabbss text-sm">{email}</span>
        </div>
        {phone !== "" && (
          <div className="flex items-center  gap-2">
            <FaPhone className="text-greencolor w-6 h-6 flex-shrink-0" />
            <span className="text-white aabbss text-sm">{phone}</span>
          </div>
        )}
        <p className="text-white aabbss text-sm font-semibold">{listingId}</p>
      </div> */}
    </div>
  );
};

export default AuthorProfile;
