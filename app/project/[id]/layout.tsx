import { Metadata, ResolvingMetadata } from "next";
import { prisma } from "@/lib/utils/prisma";

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: {
      metaTitle: true,
      title: true,
      metaDescription: true,
      description: true,
      keywords: true,
      listingImages: {
        orderBy: {
          order: "asc",
        },
        take: 1,
      },
    },
  });

  if (!listing) {
    return {
      title: "Project Not Found",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const imageUrl = listing.listingImages[0]?.url || previousImages[0];

  return {
    title: listing.metaTitle || listing.title,
    description: listing.metaDescription || listing.description || "",
    keywords: listing.keywords || [],
    openGraph: {
      title: listing.metaTitle || listing.title,
      description: listing.metaDescription || listing.description || "",
      images: imageUrl ? [imageUrl] : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: listing.metaTitle || listing.title,
      description: listing.metaDescription || listing.description || "",
      images: imageUrl ? [imageUrl] : previousImages,
    },
  };
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
