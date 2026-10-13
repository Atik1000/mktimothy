import { useState, useEffect, useCallback } from "react";

export function useBlockedUsers() {
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [blockedByIds, setBlockedByIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlocked = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/block");
      const data = await res.json();
      if (data.success) {
        setBlockedIds(data.blockedIds || []);
        setBlockedByIds(data.blockedByIds || []);
      }
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  const toggleBlock = useCallback(async (userId: string, block: boolean) => {
    try {
      const res = await fetch("/api/chat/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, block }),
      });
      const data = await res.json();
      if (data.success) {
        setBlockedIds((prev) =>
          block ? [...prev, userId] : prev.filter((id) => id !== userId)
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return { blockedIds, blockedByIds, isLoading, toggleBlock };
}
