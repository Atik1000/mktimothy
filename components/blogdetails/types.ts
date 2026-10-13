export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  rating?: number;
  hasReply?: boolean;
}

export interface SimilarBlog {
  id: string;
  title: string;
  likes: string;
  location: string;
  image: string;
  description: string;
  time: string;
  category: string;
  rating: string;
  isEditorsPick: boolean;
}

export interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  comment: string;
  newsletter: boolean;
}

export interface BlogData {
  title: string;
  subtitle: string;
  image: string;
  publishDate: string;
  category: string;
  likes: number;
  content: string[];
  author: {
    name: string;
    image: string;
    email: string;
    phone: string;
    location: string;
    listingId: string;
  };
  comments: Comment[];
  similarBlogs: SimilarBlog[];
}

