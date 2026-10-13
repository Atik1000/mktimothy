import { Metadata, ResolvingMetadata } from "next";
import { prisma } from "@/lib/utils/prisma";

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const blog = await prisma.blog.findUnique({
    where: { id: params.id },
    select: {
      metaTitle: true,
      title: true,
      metaDescription: true,
      excerpt: true,
      keywords: true,
      coverImage: true,
    }
  });

  if (!blog) {
    return {
      title: "Blog Not Found",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const imageUrl = blog.coverImage || previousImages[0];

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt || "",
    keywords: blog.keywords || [],
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt || "",
      images: imageUrl ? [imageUrl] : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt || "",
      images: imageUrl ? [imageUrl] : previousImages,
    },
  };
}

export default function BlogDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
