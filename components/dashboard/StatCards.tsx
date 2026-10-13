import { FaUser, FaClock } from "react-icons/fa";
import { MdListAlt } from "react-icons/md";
import { SiBlogger } from "react-icons/si";
import { useDashboardStats } from "./useDashboardStats";
import StatCard from "./ui/StatCard";

const ERROR_CARD = (
  <div className="col-span-full bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
    Failed to load metrics. Please try again.
  </div>
);

/**
 * Top row of metric tiles. All values and deltas come from real data.
 */
export default function StatCards() {
  const { data, loading, error } = useDashboardStats();

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {ERROR_CARD}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
      <StatCard
        label="Total Users"
        icon={FaUser}
        value={data?.totals.users ?? 0}
        delta={data?.deltas.users}
        loading={loading}
      />
      <StatCard
        label="Total Listings"
        icon={MdListAlt}
        value={data?.totals.listings ?? 0}
        delta={data?.deltas.listings}
        loading={loading}
      />
      <StatCard
        label="Blog Posts"
        icon={SiBlogger}
        value={data?.totals.blogs ?? 0}
        delta={data?.deltas.blogs}
        loading={loading}
      />
      <StatCard
        label="Pending Approvals"
        icon={FaClock}
        value={data?.totals.pendingApprovals ?? 0}
        delta={data?.deltas.pendingApprovals}
        loading={loading}
      />
    </div>
  );
}
