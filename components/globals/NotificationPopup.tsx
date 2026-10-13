"use client";
import { SectionLoader } from "@/components/ui/Loader";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  IoAlert,
  IoCheckmarkDone,
  IoClose,
  IoInformationCircle,
  IoTime,
} from "react-icons/io5";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "SYSTEM" | "USER_ACTION" | "MARKETING" | "SECURITY" | "REMINDER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  createdAt: string;
  data?: any;
}

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
      toast.success("Notification marked as read");
    }

    if (notification.actionUrl) {
      window.open(notification.actionUrl, "_blank");
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
    toast.success(`All (${unreadCount}) notifications marked as read`);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string, priority: string) => {
    const baseClass = "w-4 h-4";

    switch (type) {
      case "SECURITY":
        return <IoAlert className={`${baseClass} text-red-400`} />;
      case "USER_ACTION":
        return <IoCheckmarkDone className={`${baseClass} text-green-400`} />;
      case "SYSTEM":
        return <IoInformationCircle className={`${baseClass} text-blue-400`} />;
      default:
        return <IoInformationCircle className={`${baseClass} text-gray-400`} />;
    }
  };

  // Get time ago string
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-16 -right-10 xsm:right-0 w-72 xsm:w-96 max-w-[90vw] bg-bgdark border border-white/20 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-bglight">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full xsm:hidden ml-auto hover:bg-white/10 flex justify-end"
          >
            <IoClose className="w-5 h-5" />
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white aabbss font-bold text-lg">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-gray-400 text-sm">
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-greencolor text-sm hover:text-green-300 transition-colors"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 hidden xsm:block rounded-full hover:bg-white/10"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4">
              <SectionLoader height="h-24" message="Loading notifications..." />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <IoInformationCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <div className="text-gray-400">No notifications yet</div>
              <p className="text-gray-500 text-sm mt-1">
                You'll see important updates here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                    !notification.isRead ? "bg-greencolor/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(
                        notification.type,
                        notification.priority,
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-medium text-sm ${
                            notification.isRead ? "text-gray-300" : "text-white"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-greencolor rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p
                        className={`text-sm leading-relaxed ${
                          notification.isRead
                            ? "text-gray-400"
                            : "text-gray-300"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: notification.message,
                        }}
                      ></p>
                      <div className="flex items-center gap-2 mt-2">
                        <IoTime className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        {notification.priority === "URGENT" && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                            Urgent
                          </span>
                        )}
                        {notification.priority === "HIGH" && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                            High
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPopup;

