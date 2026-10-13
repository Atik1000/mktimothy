"use client";

import { useAuth } from "@/lib/providers/auth-provider";
import Link from "next/link";
import { FaCheck, FaUser } from "react-icons/fa";
import { TbMessage2Filled } from "react-icons/tb";
import Button from "../globals/Button";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

export default function SignInBox() {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-bgdark rounded-[20px] p-[20px] mb-[60px] relative flex items-center justify-between w-full">
        <div className="flex items-center gap-[10px] md:gap-[20px]">
          <div className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
            <div className="w-6 h-6 bg-gray-500 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-48 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show profile info when user is logged in
  if (user) {
    return (
      <div className="bg-bgdark rounded-[20px] p-4 xsm:p-[20px] mb-[60px] relative flex flex-col xs:flex-row xs:items-center justify-between w-full gap-y-4">
        <div className="flex items-center gap-[10px] md:gap-[20px]">
          {/* Profile Avatar */}
          <div className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] bg-greencolor rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img
                src={proxiedImageUrl(user?.avatar)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUser className="text-white text-lg md:text-xl" />
            )}
          </div>

          {/* Profile Info */}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white aabbss font-bold text-[16px] md:text-[20px]">
                Welcome back, {user.firstName}!
              </p>
              {user.isVerified && (
                <FaCheck className="text-blue-400 text-[14px] md:text-[16px]" />
              )}
            </div>
            <p className="text-gray-400 aabbss text-[12px] md:text-[14px]">
              Ready to connect with businesses
            </p>
          </div>
        </div>

        {/* Profile Button */}
        <Link href={`/profile/${user?.id}`} className="">
          <Button text="Profile" className="w-full xs:w-fit" />
        </Link>
      </div>
    );
  }

  // Show sign in prompt when user is not logged in
  return (
    <div className="bg-bgdark rounded-[20px] p-[20px] mb-[60px] relative flex items-center justify-between w-full">
      <div className="flex items-center gap-[10px] md:gap-[20px]">
        <div className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] bg-greencolor rounded-full flex items-center justify-center flex-shrink-0">
          <TbMessage2Filled className="text-white text-[20px] md:text-[25px]" />
        </div>
        <p className="text-white aabbss font-bold text-[16px] md:text-[20px]">
          Sign in to message business directly.
        </p>
      </div>
      <Button text="Sign in" link="/login" />
    </div>
  );
}
