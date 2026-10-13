
import { NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

// Function to handle the seeding logic
async function handleSeedCategories() {
  try {
    const defaultCategories = [
      {
        name: "Businesses for Sale",
        slug: "businesses-for-sale",
        description: "Established businesses available for acquisition",
        image: "/images/categories/businesses_for_sale.png",
        color: "#3B82F6",
        isActive: true,
      },
      {
        name: "Investment Projects Seeking Capital",
        slug: "investment-projects",
        description: "Startups and projects looking for funding",
        image: "/images/categories/investment_projects.png",
        color: "#10B981",
        isActive: true,
      },
      {
        name: "Commercial Real Estate",
        slug: "commercial-real-estate",
        description: "Commercial properties, office spaces, and land",
        image: "/images/categories/commercial_real_estate.png",
        color: "#8B5CF6",
        isActive: true,
      },
      {
        name: "Tourism & Hospitality Assets",
        slug: "tourism-hospitality",
        description: "Hotels, resorts, and tourism businesses",
        image: "/images/categories/tourism_assets.png",
        color: "#F59E0B",
        isActive: true,
      },
      {
        name: "Agricultural Opportunities",
        slug: "agriculture",
        description: "Farms, agricultural land, and agribusinesses",
        image: "/images/categories/agricultural_opportunities.png",
        color: "#84CC16",
        isActive: true,
      },
      {
        name: "Joint Venture Opportunities",
        slug: "joint-venture",
        description: "Partnership and joint venture projects",
        image: "/images/categories/joint_venture.png",
        color: "#06B6D4",
        isActive: true,
      },
    ];

    // Check if categories already exist
    const existingCategories = await prisma.category.count();

    if (existingCategories > 0) {
      // Update existing categories with images
      const updatePromises = defaultCategories.map(async (category) => {
        return prisma.category.upsert({
          where: { slug: category.slug },
          update: {
            image: category.image,
            description: category.description,
            color: category.color,
            isActive: category.isActive,
          },
          create: category,
        });
      });

      try {
        await Promise.all(updatePromises);
        return NextResponse.json({
          success: true,
          message: `Categories updated with images. Updated ${existingCategories} categories.`,
          count: existingCategories,
        });
      } catch (updateError) {
        console.error("Error updating categories:", updateError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update existing categories",
          },
          { status: 500 }
        );
      }
    }

    // Create categories
    const createdCategories = await prisma.category.createMany({
      data: defaultCategories,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: "Default categories created successfully",
      count: createdCategories.count,
      categories: defaultCategories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
      })),
    });
  } catch (error) {
    console.error("Error seeding categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed categories" },
      { status: 500 }
    );
  }
}

// GET method for easy browser access
export async function GET() {
  return await handleSeedCategories();
}

// POST method (keeping for compatibility)
export async function POST() {
  return await handleSeedCategories();
}
