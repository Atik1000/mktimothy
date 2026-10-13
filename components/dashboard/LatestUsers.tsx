import Image from "next/image";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import SectionCard from "./ui/SectionCard";

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  createdAt: string;
}

const LatestUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestUsers = async () => {
      try {
        const response = await fetch("/api/admin/latest-users");
        if (!response.ok) {
          throw new Error("Failed to fetch latest users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestUsers();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const createdAt = new Date(dateString);
    const diffInMs = now.getTime() - createdAt.getTime();

    const minutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} mins ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  const UserAvatar = ({ user }: { user: User }) => {
    const [imageError, setImageError] = useState(false);

    if (
      !user.image ||
      user.image.includes("default-user-icon.png") ||
      imageError
    ) {
      return (
        <div className="w-9 h-9 rounded-full bg-greencolor/15 border border-greencolor/20 flex items-center justify-center flex-shrink-0">
          <FaUser className="text-greencolor text-sm" />
        </div>
      );
    }

    return (
      <Image
        width={36}
        height={36}
        src={proxiedImageUrl(user.image)}
        alt={user.name}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        onError={() => setImageError(true)}
      />
    );
  };

  const header = (
    <a
      href="/users"
      className="text-greencolor hover:text-greencolor/80 text-xs font-semibold transition-colors"
    >
      View all
    </a>
  );

  if (loading) {
    return (
      <SectionCard title="Latest Users" action={header} className="xl:col-span-2">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Latest Users" action={header} className="xl:col-span-2">
        <div className="flex items-center justify-center h-32">
          <p className="text-red-400 text-sm">Error: {error}</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Latest Users" action={header} className="xl:col-span-2">
      <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-hide -mx-2 px-2">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <UserAvatar user={user} />
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm truncate">
                  {user.name}
                </p>
                <p className="text-lighttext/50 text-xs truncate">
                  {user.email}
                </p>
              </div>
              <span className="text-lighttext/40 text-xs whitespace-nowrap flex-shrink-0">
                {formatTimeAgo(user.createdAt)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-lighttext/40 text-sm">No users found</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default LatestUsers;
