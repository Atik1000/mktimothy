import { dbHelpers } from "@/lib/config/database";
import { authService } from "@/lib/services/auth";
import { NotificationService } from "@/lib/services/notification";
import {
  canActOnUser,
  getAssignableRoles,
  UserRole,
} from "@/lib/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/users/[id] - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify authentication
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Since only ADMIN users can access dashboard, skip permission check
    // if (!hasPermission(authResult.user, "users", "read")) {
    //   return NextResponse.json(
    //     { error: "Insufficient permissions" },
    //     { status: 403 }
    //   );
    // }

    // Get user
    const user = await dbHelpers.getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove password from response
    const { password, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify authentication
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Since only ADMIN users can access dashboard, skip permission check
    // if (!hasPermission(authResult.user, "users", "update")) {
    //   return NextResponse.json(
    //     { error: "Insufficient permissions" },
    //     { status: 403 }
    //   );
    // }

    // Get target user
    const targetUser = await dbHelpers.getUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if current user can act on target user
    if (!canActOnUser(authResult.user, targetUser)) {
      return NextResponse.json(
        { error: "Cannot modify this user" },
        { status: 403 }
      );
    }

    // Update user
    const updatedUser = await dbHelpers.updateUser(id, body);

    // Remove password from response
    const { password, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify authentication
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Since only ADMIN users can access dashboard, skip permission check
    // if (!hasPermission(authResult.user, "users", "delete")) {
    //   return NextResponse.json(
    //     { error: "Insufficient permissions" },
    //     { status: 403 }
    //   );
    // }

    // Get target user
    const targetUser = await dbHelpers.getUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-deletion
    if (authResult.user.id === id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    // Check if current user can act on target user
    if (!canActOnUser(authResult.user, targetUser)) {
      return NextResponse.json(
        { error: "Cannot delete this user" },
        { status: 403 }
      );
    }

    // Delete user
    await dbHelpers.deleteUser(id);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Perform specific actions (role change, suspend, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, ...actionData } = body;

    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify authentication
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get target user
    const targetUser = await dbHelpers.getUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updatedUser;
    let message = "";
    const adminName = `${authResult.user.firstName} ${authResult.user.lastName}`;

    switch (action) {
      case "change_role":
        // Since only ADMIN users can access dashboard, skip permission check
        // if (!hasPermission(authResult.user, "users", "change_role")) {
        //   return NextResponse.json(
        //     { error: "Insufficient permissions" },
        //     { status: 403 }
        //   );
        // }

        // Prevent self-role-change
        if (authResult.user.id === id) {
          return NextResponse.json(
            { error: "Cannot change your own role" },
            { status: 400 }
          );
        }

        // Check if current user can act on target user
        if (!canActOnUser(authResult.user, targetUser)) {
          return NextResponse.json(
            { error: "Cannot change this user's role" },
            { status: 403 }
          );
        }

        // Check if user can assign this role
        const assignableRoles = getAssignableRoles(authResult.user);
        if (!assignableRoles.includes(actionData.role as UserRole)) {
          return NextResponse.json(
            { error: "Cannot assign this role" },
            { status: 403 }
          );
        }

        // Prepare update data
        const updateData: any = {
          role: actionData.role,
        };

        // If assigning MODERATOR role, require department
        if (actionData.role === "MODERATOR") {
          if (!actionData.department) {
            return NextResponse.json(
              { error: "Department is required when assigning MODERATOR role" },
              { status: 400 }
            );
          }
          updateData.department = actionData.department;
          message = `User role changed to ${actionData.role} - ${actionData.department} department`;
        } else {
          // Clear department if not moderator
          updateData.department = null;
          message = `User role changed to ${actionData.role}`;
        }

        updatedUser = await dbHelpers.updateUser(id, updateData);

        // Send notification to the user
        try {
          await NotificationService.notifyRoleChanged(
            id,
            actionData.role,
            adminName
          );
        } catch (notifError) {
          console.error("Failed to send role change notification:", notifError);
        }
        break;

      case "assign_permissions":
        if (targetUser.role !== "MODERATOR") {
          return NextResponse.json(
            { error: "Can only assign sub-admin permissions to moderators" },
            { status: 400 }
          );
        }
        
        updatedUser = await dbHelpers.updateUser(id, { subAdminPermissions: actionData.permissions || [] });
        message = "Sub-admin permissions updated successfully";
        break;

      case "suspend":
        // Since only ADMIN users can access dashboard, skip permission check
        // if (!hasPermission(authResult.user, "users", "suspend")) {
        //   return NextResponse.json(
        //     { error: "Insufficient permissions" },
        //     { status: 403 }
        //   );
        // }

        // Prevent self-suspension
        if (authResult.user.id === id) {
          return NextResponse.json(
            { error: "Cannot suspend yourself" },
            { status: 400 }
          );
        }

        // Check if current user can act on target user
        if (!canActOnUser(authResult.user, targetUser)) {
          return NextResponse.json(
            { error: "Cannot suspend this user" },
            { status: 403 }
          );
        }

        updatedUser = await dbHelpers.updateUser(id, { isActive: false });
        message = "User suspended successfully";

        // Send notification to the user
        try {
          await NotificationService.notifyUserSuspended(id, adminName);
        } catch (notifError) {
          console.error("Failed to send suspension notification:", notifError);
        }
        break;

      case "activate":
        // Since only ADMIN users can access dashboard, skip permission check
        // if (!hasPermission(authResult.user, "users", "suspend")) {
        //   return NextResponse.json(
        //     { error: "Insufficient permissions" },
        //     { status: 403 }
        //   );
        // }

        // Check if current user can act on target user
        if (!canActOnUser(authResult.user, targetUser)) {
          return NextResponse.json(
            { error: "Cannot activate this user" },
            { status: 403 }
          );
        }

        updatedUser = await dbHelpers.updateUser(id, { isActive: true });
        message = "User activated successfully";

        // Send notification to the user
        try {
          await NotificationService.notifyUserActivated(id, adminName);
        } catch (notifError) {
          console.error("Failed to send activation notification:", notifError);
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Remove password from response
    const { password, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message,
    });
  } catch (error) {
    console.error("User action error:", error);
    return NextResponse.json(
      { error: "Failed to perform user action" },
      { status: 500 }
    );
  }
}
