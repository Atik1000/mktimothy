import { User } from "@/lib/config/database";

/**
 * Shared helpers for the internal chat system.
 *
 * Rooms store their participant list as a JSON array on the `ChatRoom` row
 * (mirrored from the live User table at message time) so the UI can render
 * names/avatars without an extra join for every message.
 */

export interface RoomParticipant {
  id: string;
  role: string;
  name: string;
  avatar?: string | null;
}

/** Build a snapshot of a user suitable for storing in `ChatRoom.participants`. */
export function toParticipant(user: {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}): RoomParticipant {
  return {
    id: user.id,
    role: user.role,
    name: `${user.firstName} ${user.lastName}`.trim(),
    avatar: user.avatar ?? null,
  };
}

/** Stable id for a DIRECT room between two users (order-independent). */
export function directRoomKey(a: string, b: string): string {
  return [a, b].sort().join("__");
}

/** True if `userId` is a participant of the room (by id match). */
export function isParticipant(participants: unknown, userId: string): boolean {
  if (!Array.isArray(participants)) return false;
  return participants.some(
    (p) => (p as RoomParticipant)?.id === userId
  );
}

/** Returns the "other" participant in a DIRECT room relative to `viewerId`. */
export function otherParticipant(
  participants: unknown,
  viewerId: string
): RoomParticipant | null {
  if (!Array.isArray(participants)) return null;
  const others = (participants as RoomParticipant[]).filter(
    (p) => p.id !== viewerId
  );
  return others[0] ?? null;
}

/**
 * Permission model:
 *  - ADMIN can read + post in ANY room (monitoring).
 *  - Other roles can only read/post in rooms where they are a participant.
 */
export function canAccessRoom(
  user: Pick<User, "id" | "role">,
  participants: unknown
): boolean {
  if (user.role === "ADMIN") return true;
  return isParticipant(participants, user.id);
}
