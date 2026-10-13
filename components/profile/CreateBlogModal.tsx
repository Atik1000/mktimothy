"use client";

import { useAuth } from "@/lib/providers/auth-provider";
import { useEffect, useState } from "react";
import { FaCalendar, FaEye, FaTimes, FaTrash, FaUpload } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import TiptapEditor from "@/components/ui/TiptapEditor";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { BLOG_TEMPLATES, type BlogTemplate, type BlogTemplateId } from "@/lib/blog-templates";

// TipTap editor toolbar component
const EditorMenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-white/10 p-2 flex flex-wrap gap-1 bg-black rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded ${
          editor.isActive("bold") ? "bg-white/20" : "hover:bg-white/10"
        }`}
        title="Bold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="w-5 h-5 fill-white"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded ${
          editor.isActive("italic") ? "bg-white/20" : "hover:bg-white/10"
        }`}
        title="Italic"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="w-5 h-5 fill-white"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1 rounded ${
          editor.isActive("heading", { level: 1 })
            ? "bg-white/20"
            : "hover:bg-white/10"
        }`}
        title="Heading 1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="w-5 h-5 fill-white"
        >
          <path fill="none" d="M0 0H24V24H0z" />
          <path d="M13 20h-2v-7H4v7H2V4h2v7h7V4h2v16zm8-12v12h-2v-9.796l-2 .536V8.67L19.5 8H21z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1 rounded ${
          editor.isActive("heading", { level: 2 })
            ? "bg-white/20"
            : "hover:bg-white/10"
        }`}
        title="Heading 2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="w-5 h-5 fill-white"
        >
          <path fill="none" d="M0 0H24V24H0z" />
          <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm14.5 4c2.071 0 3.75 1.679 3.75 3.75 0 .857-.288 1.648-.772 2.28l-.148.18L18.034 18H22v2h-7v-1.556l4.82-5.546c.268-.307.43-.709.43-1.148 0-.966-.784-1.75-1.75-1.75-.918 0-1.671.707-1.744 1.606l-.006.144h-2C14.75 9.679 16.429 8 18.5 8z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1 rounded ${
          editor.isActive("heading", { level: 3 })
            ? "bg-white/20"
            : "hover:bg-white/10"
        }`}
        title="Heading 3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="w-5 h-5 fill-white"
        >
          <path fill="none" d="M0 0H24V24H0z" />
          <path d="M22 8l-.002 2-2.505 2.883c1.59.435 2.757 1.89 2.757 3.617 0 2.071-1.679 3.75-3.75 3.75-1.826 0-3.347-1.305-3.682-3.033l1.964-.382c.156.806.866 1.415 1.718 1.415.966 0 1.75-.784 1.75-1.75s-.784-1.75-1.75-1.75c-.286 0-.556.069-.794.19l-1.307-1.547L19.35 10H15V8h7zM4 4v7h7V4h2v16h-2v-7H4v7H2V4h2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded ${
          editor.isActive("bulletList") ? "bg-white/20" : "hover:bg-white/10"
        }`}
        title="Bullet List"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="w-5 h-5 fill-white"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1 rounded ${
          editor.isActive("orderedList") ? "bg-white/20" : "hover:bg-white/10"
        }`}
        title="Ordered List"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="w-5 h-5 fill-white"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zM3 14v-2.5h2V11H3v-1h3v2.5H4v.5h2v1H3zm2 5.5H3v-1h2V18H3v-1h3v4H3v-1h2v-.5zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1 rounded ${
          editor.isActive("blockquote") ? "bg-white/20" : "hover:bg-white/10"
        }`}
        title="Blockquote"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="w-5 h-5 fill-white"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("Enter the URL");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`p-1 rounded ${
          editor.isActive("link") ? "bg-white/20" : "hover:bg-white/10"
        }`}
        title="Link"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="w-5 h-5 fill-white"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
            }
          };
          input.click();
        }}
        className="p-1 rounded hover:bg-white/10"
        title="Image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="w-5 h-5 fill-white"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
        </svg>
      </button>
    </div>
  );
};
interface CreateBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingBlog?: any;
  profileUser?: any;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface FormData {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  status: string;
  isFeatured: boolean;
  publishedAt: string;
}

const CreateBlogModal: React.FC<CreateBlogModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingBlog,
  profileUser,
}) => {
  const { user, handleApiResponse } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  /** Chosen starter template (null when editing, or until the user picks). */
  const [selectedTemplate, setSelectedTemplate] =
    useState<BlogTemplate | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    categoryId: "",
    tags: [],
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    status: "DRAFT",
    isFeatured: false,
    publishedAt: "",
  });

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({
        openOnClick: false,
      }),
      TiptapImage,
    ],
    content: formData.content,
    onUpdate: ({ editor }: any) => {
      setFormData((prev) => ({
        ...prev,
        content: editor.getHTML(),
      }));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none p-4 min-h-[300px] focus:outline-none border-none outline-none text-white bg-zinc-900 rounded-b-xl",
      },
    },
  });

  // Fetch categories and tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResult.success) {
          setCategories(categoriesResult.data);
        }

        // Fetch tags
        const tagsResponse = await fetch("/api/tags");
        const tagsResult = await tagsResponse.json();
        if (tagsResult.success) {
          setAvailableTags(tagsResult.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editingBlog && isOpen) {
      setFormData({
        title: editingBlog.title || "",
        excerpt: editingBlog.excerpt || "",
        content: editingBlog.content || "",
        coverImage: editingBlog.coverImage || "",
        categoryId: editingBlog.categoryId || "",
        tags: editingBlog.tags?.map((tag: any) => tag.tag.name) || [],
        metaTitle: editingBlog.metaTitle || "",
        metaDescription: editingBlog.metaDescription || "",
        keywords: editingBlog.keywords?.join(", ") || "",
        status: editingBlog.status || "DRAFT",
        isFeatured: editingBlog.isFeatured || false,
        publishedAt: editingBlog.publishedAt
          ? new Date(editingBlog.publishedAt).toISOString().slice(0, 16)
          : "",
      });

      if (editingBlog.coverImage) {
        setCoverImagePreview(editingBlog.coverImage);
      }
    } else if (!editingBlog && isOpen) {
      // Reset form for new blog
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        coverImage: "",
        categoryId: "",
        tags: [],
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        status: "DRAFT",
        isFeatured: false,
        publishedAt: "",
      });
      setCoverImageFile(null);
      setCoverImagePreview("");
      setSelectedTemplate(null);
      // Start on the template picker (step 0); existing numbered steps
      // (1–4) are reached after a template is chosen.
      setCurrentStep(0);
    }
  }, [editingBlog, isOpen]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  /**
   * Seed the editor and form with the chosen starter template, then move
   * to the Basic Info step. The TipTap editor is created with initial
   * content; once mounted we overwrite it with the template's HTML.
   */
  const handleSelectTemplate = (template: BlogTemplate) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      content: template.defaultContent,
      excerpt: template.defaultExcerpt,
    }));
    // editor may be null if it hasn't mounted yet (the picker shows first);
    // if so, the template content is still applied via `content: formData.content`
    // when the editor mounts, because the step-1 render now drives the editor.
    if (editor) {
      editor.commands.setContent(template.defaultContent);
    }
    setCurrentStep(1);
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          coverImage: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
        });
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors({ coverImage: "File size must be less than 5MB" });
        return;
      }

      setCoverImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear any previous errors
      setErrors((prev) => ({ ...prev, coverImage: "" }));
    }
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview("");
    setFormData((prev) => ({ ...prev, coverImage: "" }));
  };

  const addTag = (tagName: string) => {
    if (tagName.trim() && !formData.tags.includes(tagName.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagName.trim()],
      }));
    }
  };

  const removeTag = (tagName: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagName),
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.content.trim()) newErrors.content = "Content is required";
      if (!formData.categoryId) newErrors.categoryId = "Category is required";
    }

    if (step === 2) {
      // Content and excerpt validation
      if (formData.excerpt && formData.excerpt.length > 300) {
        newErrors.excerpt = "Excerpt must be 300 characters or less";
      }
    }

    if (step === 3) {
      // SEO validation
      if (formData.metaTitle && formData.metaTitle.length > 60) {
        newErrors.metaTitle = "Meta title should be 60 characters or less";
      }
      if (formData.metaDescription && formData.metaDescription.length > 160) {
        newErrors.metaDescription =
          "Meta description should be 160 characters or less";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setErrors({});

    try {
      // First upload cover image if any NEW image
      let coverImageUrl = formData.coverImage;

      if (coverImageFile) {
        const imageFormData = new FormData();
        imageFormData.append("images", coverImageFile);

        const token =
          localStorage.getItem("auth-token") ||
          sessionStorage.getItem("auth-token");

        const uploadResponse = await fetch("/api/upload/images", {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: imageFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          coverImageUrl = uploadResult.urls?.[0] || coverImageUrl;
        }
      }

      // Prepare blog data
      const blogData = {
        ...formData,
        coverImage: coverImageUrl,
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        publishedAt:
          formData.status === "SCHEDULED" && formData.publishedAt
            ? formData.publishedAt
            : undefined,
      };

      // Use PUT for editing, POST for creating
      const url = editingBlog ? `/api/blogs/${editingBlog.id}` : "/api/blogs";
      const method = editingBlog ? "PUT" : "POST";

      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(blogData),
      });

      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) return;

      const result = await response.json();

      if (result.success) {
        setSuccess(
          editingBlog
            ? "Blog updated successfully!"
            : "Blog created successfully!",
        );
        setTimeout(() => {
          onSuccess?.();
          onClose();
          // Reset form
          setCurrentStep(1);
          setFormData({
            title: "",
            excerpt: "",
            content: "",
            coverImage: "",
            categoryId: "",
            tags: [],
            metaTitle: "",
            metaDescription: "",
            keywords: "",
            status: "DRAFT",
            isFeatured: false,
            publishedAt: "",
          });
          setCoverImageFile(null);
          setCoverImagePreview("");
        }, 2000);
      } else {
        setErrors({
          general:
            result.error ||
            (editingBlog ? "Failed to update blog" : "Failed to create blog"),
        });
      }
    } catch (error) {
      setErrors({ general: "Network error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const blogStatuses = [
    { value: "DRAFT", label: "Draft" },
    { value: "PUBLISHED", label: "Published" },
    { value: "SCHEDULED", label: "Scheduled" },
    { value: "ARCHIVED", label: "Archived" },
  ];

  const isAdminOrModerator =
    user?.role === "ADMIN" || user?.role === "MODERATOR";

  if (!isAdminOrModerator && profileUser?.approvalStatus !== "APPROVED") {
    return (
      <div
        className={` inset-0 bg-black/50 flex items-center justify-center z-[100] p-8 fixed ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="relative">
          <IoClose
            className="w-6 h-6 absolute top-4 right-4 text-white"
            onClick={onClose}
          />
          <div className="bg-bgdark rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <p className="text-white aabbss font-bold text-xl mb-4">
                Your account is not approved yet. Please wait for approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#09090b] border border-white/10 shadow-2xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto thin-green-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex gap-3 flex-col items-start">
            {/* On the editor steps, allow jumping back to the template picker */}
            {currentStep > 0 && currentStep <= 4 && !editingBlog && (
              <button
                type="button"
                onClick={() => setCurrentStep(0)}
                className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
              >
                ← Templates
              </button>
            )}
            <h2 className="text-zinc-100 font-bold text-2xl">
              {currentStep === 0 && !editingBlog
                ? "Choose a template"
                : editingBlog
                  ? "Edit Blog"
                  : "Create New Blog"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps — hidden while picking a template */}
        {currentStep > 0 && (
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between overflow-x-auto scrollbar pb-3">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step <= currentStep
                        ? "bg-greencolor text-white"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {step}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      step <= currentStep ? "text-zinc-100" : "text-zinc-500"
                    }`}
                  >
                    {step === 1 && "Basic Info"}
                    {step === 2 && "Content & Media"}
                    {step === 3 && "SEO & Tags"}
                    {step === 4 && "Publishing"}
                  </span>
                  {step < 4 && (
                    <div
                      className={`w-7 xsm:w-10 md:w-16 h-0.5 mx-2 xsm:mx-4 transition-colors ${
                        step < currentStep ? "bg-greencolor" : "bg-zinc-800"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl m-6">
            <p className="text-emerald-400 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl m-6">
            <p className="text-rose-400 text-sm font-medium">
              {errors.general}
            </p>
          </div>
        )}

        {/* Step Content */}
        <div className="p-6">
          {/* Step 0: Template picker (create flow only) */}
          {currentStep === 0 && !editingBlog && (
            <div className="space-y-6">
              <div>
                <h3 className="text-zinc-100 font-bold text-xl">
                  Start from a template
                </h3>
                <p className="text-zinc-400 text-sm mt-1">
                  Pick a layout — you can edit everything afterwards.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {BLOG_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplate?.id === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`group text-left rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                        isSelected
                          ? "border-white/60 bg-white/5"
                          : "border-white/40 hover:border-white/60 bg-white/[0.02]"
                      }`}
                    >
                      {/* Mini wireframe preview */}
                      <div className="h-28 bg-white/[0.04] flex items-center justify-center border-b border-white/10 px-4">
                        <TemplateWireframe id={tpl.id} />
                      </div>
                      {/* Label */}
                      <div className="p-4 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: tpl.accent }}
                          />
                          <span className="text-zinc-100 text-[15px] font-semibold">
                            {tpl.name}
                          </span>
                        </div>
                        <span className="text-zinc-500 text-[12px] leading-snug">
                          {tpl.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Skip — start from a blank editor */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setFormData((prev) => ({
                      ...prev,
                      content: "",
                      excerpt: "",
                    }));
                    if (editor) editor.commands.clearContent();
                    setCurrentStep(1);
                  }}
                  className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Skip — start blank
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-zinc-100 font-bold text-xl mb-6">
                Basic Information
              </h3>

              {/* Title */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full bg-transparent border-2 ${
                    errors.title ? "border-red-500" : "border-lightgray"
                  } text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl`}
                  placeholder="Enter your blog title"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    handleInputChange("categoryId", e.target.value)
                  }
                  className={`w-full bg-zinc-900/50 border ${
                    errors.categoryId ? "border-red-500" : "border-white/10"
                  } text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.categoryId}
                  </p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Content *
                </label>
                {/* <TiptapEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange("content", content)}
                  placeholder="Write your blog content here..."
                  className="text-white"
                /> */}
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <EditorMenuBar editor={editor} />
                  <EditorContent editor={editor} className="focus:outline-none" />
                </div>
                {errors.content && (
                  <p className="text-red-400 text-sm mt-1">{errors.content}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Content & Media */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-zinc-100 font-bold text-xl mb-6">
                Content & Media
              </h3>

              {/* Excerpt */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange("excerpt", e.target.value)}
                  className={`w-full bg-transparent border-2 ${
                    errors.excerpt ? "border-red-500" : "border-lightgray"
                  } text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl resize-none`}
                  rows={3}
                  placeholder="Brief description of your blog post"
                  maxLength={300}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.excerpt && (
                    <p className="text-red-400 text-sm">{errors.excerpt}</p>
                  )}
                  <p className="text-gray-400 text-sm ml-auto">
                    {formData.excerpt.length}/300
                  </p>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-white aabbss font-medium mb-4">
                  Cover Image
                </label>

                {coverImagePreview ? (
                  <div className="relative">
                    <div className="w-full h-48 bg-zinc-800 rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={proxiedImageUrl(coverImagePreview)}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute top-2 right-2 bg-rose-600/90 text-white p-2 rounded-full hover:bg-rose-600 transition-colors shadow-lg backdrop-blur-sm"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-white/20 bg-zinc-900/30 rounded-xl p-8 text-center hover:border-greencolor/50 transition-colors">
                    <input
                      type="file"
                      id="cover-upload"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      <FaUpload className="w-12 h-12 text-zinc-500" />
                      <div>
                        <p className="text-zinc-100 font-medium">
                          Click to upload cover image
                        </p>
                        <p className="text-zinc-500 text-sm mt-1">
                          PNG, JPG, GIF, WebP up to 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {errors.coverImage && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.coverImage}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: SEO & Tags */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-zinc-100 font-bold text-xl mb-6">
                SEO & Tags
              </h3>

              {/* Tags */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Tags
                </label>
                <div className="space-y-3">
                  {/* Selected Tags Display */}
                  <div className="flex flex-wrap gap-2 min-h-[44px] p-3 border border-white/10 rounded-xl bg-zinc-900/50">
                    {formData.tags.length === 0 ? (
                      <span className="text-zinc-500 text-sm py-1">
                        No tags selected
                      </span>
                    ) : (
                      formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-greencolor/20 border border-greencolor/30 text-greencolor px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-greencolor/70 hover:text-rose-400 transition-colors"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Manual Tag Input */}
                  <div>
                    <input
                      type="text"
                      placeholder="Type a tag and press Enter..."
                      className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const value = (
                            e.target as HTMLInputElement
                          ).value.trim();
                          if (value) {
                            addTag(value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    <p className="text-zinc-500 text-xs mt-2">
                      Press Enter to add a tag
                    </p>
                  </div>

                  {/* Suggested Tags */}
                  {availableTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      <p className="text-zinc-400 text-sm w-full mb-2">
                        Suggested tags:
                      </p>
                      {availableTags.slice(0, 10).map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => addTag(tag.name)}
                          disabled={formData.tags.includes(tag.name)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                            formData.tags.includes(tag.name)
                              ? "bg-greencolor/20 text-greencolor border-greencolor/30 cursor-not-allowed opacity-50"
                              : "border-white/10 text-zinc-400 hover:border-greencolor hover:text-greencolor cursor-pointer hover:bg-greencolor/10"
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Title */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    handleInputChange("metaTitle", e.target.value)
                  }
                  className={`w-full bg-transparent border-2 ${
                    errors.metaTitle ? "border-red-500" : "border-lightgray"
                  } text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl`}
                  placeholder="SEO meta title"
                  maxLength={60}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.metaTitle && (
                    <p className="text-red-400 text-sm">{errors.metaTitle}</p>
                  )}
                  <p className="text-gray-400 text-sm ml-auto">
                    {formData.metaTitle.length}/60
                  </p>
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) =>
                    handleInputChange("metaDescription", e.target.value)
                  }
                  className={`w-full bg-transparent border-2 ${
                    errors.metaDescription
                      ? "border-red-500"
                      : "border-lightgray"
                  } text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl resize-none`}
                  rows={3}
                  placeholder="SEO meta description"
                  maxLength={160}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.metaDescription && (
                    <p className="text-red-400 text-sm">
                      {errors.metaDescription}
                    </p>
                  )}
                  <p className="text-gray-400 text-sm ml-auto">
                    {formData.metaDescription.length}/160
                  </p>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) =>
                    handleInputChange("keywords", e.target.value)
                  }
                  className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-zinc-500 text-sm mt-2">
                  Separate keywords with commas
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Publishing */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-zinc-100 font-bold text-xl mb-6">
                Publishing Options
              </h3>

              {/* Status */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                >
                  {blogStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scheduled Publishing */}
              {formData.status === "SCHEDULED" && (
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Publish Date & Time
                  </label>
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-greencolor" />
                    <input
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) =>
                        handleInputChange("publishedAt", e.target.value)
                      }
                      className="flex-1 bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </div>
              )}

              {/* Featured */}
              <div className="flex items-center gap-3 bg-zinc-900/30 p-4 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    handleInputChange("isFeatured", e.target.checked)
                  }
                  className="w-5 h-5 text-greencolor bg-zinc-900 border-white/20 rounded focus:ring-greencolor focus:ring-2 focus:ring-offset-0"
                />
                <label
                  htmlFor="featured"
                  className="text-zinc-300 font-medium cursor-pointer"
                >
                  Mark as Featured
                </label>
              </div>

              {/* Preview */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-5">
                <h4 className="text-zinc-100 font-bold mb-4 flex items-center gap-2">
                  <FaEye className="text-greencolor" />
                  Preview
                </h4>
                <div className="space-y-3">
                  <h5 className="text-zinc-100 font-bold text-lg">
                    {formData.title || "Your blog title"}
                  </h5>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {formData.excerpt || "Your blog excerpt will appear here"}
                  </p>
                  <div className="flex gap-2 flex-wrap pt-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-greencolor/10 border border-greencolor/20 text-greencolor px-2 py-1 rounded-md text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation — hidden on the template picker */}
        {currentStep > 0 && (
        <div className="flex items-center justify-between p-6 border-t border-white/5 bg-zinc-900/20 rounded-b-2xl">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                disabled={isLoading}
                className="bg-zinc-800 text-zinc-300 font-semibold px-6 py-2 rounded-xl hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-50"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="bg-greencolor text-white font-semibold px-6 py-2 rounded-xl hover:bg-greencolor/90 transition-all disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-greencolor text-white font-semibold px-6 py-2 rounded-xl hover:bg-greencolor/90 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                {isLoading
                  ? editingBlog
                    ? "Updating..."
                    : "Creating..."
                  : editingBlog
                    ? "Update Blog"
                    : "Create Blog"}
              </button>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

/* Small wireframe previews for the template picker cards. */
const TemplateWireframe = ({ id }: { id: BlogTemplateId }) => {
  if (id === "story") {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="h-3 w-full rounded bg-white/35" />
        <div className="my-1 h-2 w-1/2 rounded-full bg-[#f0601d]/70" />
        <div className="h-1.5 w-full rounded-full bg-white/15" />
        <div className="h-1.5 w-4/5 rounded-full bg-white/15" />
        <div className="h-1.5 w-3/4 rounded-full bg-white/15" />
      </div>
    );
  }
  if (id === "insights") {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="h-2 w-2/3 rounded-full bg-white/40" />
        <div className="grid grid-cols-3 gap-1 my-1">
          <div className="h-5 rounded bg-white/20" />
          <div className="h-5 rounded bg-white/20" />
          <div className="h-5 rounded bg-white/20" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/15" />
        <div className="h-1.5 w-5/6 rounded-full bg-white/15" />
      </div>
    );
  }
  // standard
  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="h-2 w-3/4 rounded-full bg-white/40" />
      <div className="h-1.5 w-full rounded-full bg-white/15" />
      <div className="h-1.5 w-full rounded-full bg-white/15" />
      <div className="h-1.5 w-5/6 rounded-full bg-white/15" />
      <div className="mt-1 h-1.5 w-2/3 rounded-full bg-white/15" />
    </div>
  );
};

export default CreateBlogModal;
