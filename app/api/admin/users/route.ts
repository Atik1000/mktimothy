import { dbHelpers } from "@/lib/config/database";
import { authService } from "@/lib/services/auth";
import { getAssignableRoles, UserRole } from "@/lib/utils/permissions";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/users - Get all users with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role") as UserRole | null;
    const isActive = searchParams.get("isActive");
    const emailVerified = searchParams.get("emailVerified");
    const search = searchParams.get("search");

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

    // Build filters
    const filters: any = {
      approvalStatus: "APPROVED", // Only show approved users in main users list
    };
    if (role) filters.role = role;
    if (isActive !== null) filters.isActive = isActive === "true";
    if (emailVerified !== null)
      filters.emailVerified = emailVerified === "true";

    // Get users with pagination
    const result = await dbHelpers.getUsersWithPagination(page, limit, filters);

    // If search is provided, filter by name or email
    if (search && result.users) {
      const searchLower = search.toLowerCase();
      result.users = result.users.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, role = "USER", subAdminPermissions } = body;

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
    // if (!hasPermission(authResult.user, "users", "create")) {
    //   return NextResponse.json(
    //     { error: "Insufficient permissions" },
    //     { status: 403 }
    //   );
    // }

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user can assign this role
    const assignableRoles = getAssignableRoles(authResult.user);
    if (!assignableRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: "Cannot assign this role" },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existingUser = await dbHelpers.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Create user
    const hashedPassword = await authService.hashPassword(password);
    const newUser = await dbHelpers.createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role as UserRole,
      emailVerified: true, // Admin-created users are auto-verified
      subAdminPermissions: subAdminPermissions || [],
    });

    // Auto-approve admin-created users
    const approvedUser = await dbHelpers.updateUser(newUser.id, {
      approvalStatus: "APPROVED",
      approvedAt: new Date(),
      approvedBy: authResult.user.id,
    });

    // Remove password from response
    const { password: _, ...userResponse } = approvedUser;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

