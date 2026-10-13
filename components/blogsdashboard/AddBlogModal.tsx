"use client";

import Image from "next/image";
import { useState } from "react";
import { TiPlus, TiTimes } from "react-icons/ti";

interface AddBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called when the user publishes/schedules. Receives the chosen template
   * id plus the drafted fields so the parent can POST to /api/blogs.
   */
  onCreate?: (blog: {
    templateId: TemplateId;
    title: string;
    excerpt: string;
    content: string;
    visibility: string;
    scheduledFor?: string;
  }) => void;
}

/* ─────────────────────────── Templates ─────────────────────────── */

type TemplateId = "standard" | "story" | "insights";

interface BlogTemplate {
  id: TemplateId;
  name: string;
  description: string;
  /** Accent used in the picker card. */
  accent: string;
  /** Mini wireframe rendered with divs for the picker preview. */
  Preview: () => JSX.Element;
  /** Starter content the editor opens with. */
  defaultContent: string;
  defaultExcerpt: string;
}

const TEMPLATES: BlogTemplate[] = [
  {
    id: "standard",
    name: "Standard Article",
    description:
      "A clean, single-column layout. Best for announcements, news, and general posts.",
    accent: "#8bb22e",
    Preview: () => (
      <div className="flex flex-col gap-1.5 p-2 w-full">
        <div className="h-2 w-3/4 rounded-full bg-white/40" />
        <div className="h-1.5 w-full rounded-full bg-white/15" />
        <div className="h-1.5 w-full rounded-full bg-white/15" />
        <div className="h-1.5 w-5/6 rounded-full bg-white/15" />
        <div className="mt-1 h-1.5 w-2/3 rounded-full bg-white/15" />
      </div>
    ),
    defaultExcerpt: "A short summary of your article that appears in listings.",
    defaultContent: `<h2>Introduction</h2>
<p>Start with a strong opening that hooks the reader and sets up the topic.</p>

<h2>Main Section</h2>
<p>Develop your key points here. Use clear paragraphs and keep sentences tight.</p>

<h2>Conclusion</h2>
<p>Wrap up with the takeaway and, if relevant, a call to action.</p>`,
  },
  {
    id: "story",
    name: "Storyteller",
    description:
      "A narrative-driven layout with a hero pull-quote. Best for founder stories, case studies, and features.",
    accent: "#f0601d",
    Preview: () => (
      <div className="flex flex-col gap-1.5 p-2 w-full">
        <div className="h-3 w-full rounded bg-white/35" />
        <div className="my-1 h-2 w-1/2 rounded-full bg-[#f0601d]/70" />
        <div className="h-1.5 w-full rounded-full bg-white/15" />
        <div className="h-1.5 w-4/5 rounded-full bg-white/15" />
        <div className="h-1.5 w-3/4 rounded-full bg-white/15" />
      </div>
    ),
    defaultExcerpt:
      "Open with the moment that defines the story — what happened and why it matters.",
    defaultContent: `<blockquote>"Open with the quote or moment that anchors your story."</blockquote>

<p>Set the scene. Where did this happen, who was involved, and what was at stake?</p>

<h2>The Journey</h2>
<p>Walk the reader through the key beats. Focus on people and decisions, not just facts.</p>

<h2>What We Learned</h2>
<p>Close on the lesson and how it shapes what comes next.</p>`,
  },
  {
    id: "insights",
    name: "Insights & Data",
    description:
      "A structured layout with sectioned takeaways. Best for analysis, reports, and thought leadership.",
    accent: "#4a8fe0",
    Preview: () => (
      <div className="flex flex-col gap-1.5 p-2 w-full">
        <div className="h-2 w-2/3 rounded-full bg-white/40" />
        <div className="grid grid-cols-3 gap-1 my-1">
          <div className="h-5 rounded bg-white/20" />
          <div className="h-5 rounded bg-white/20" />
          <div className="h-5 rounded bg-white/20" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/15" />
        <div className="h-1.5 w-5/6 rounded-full bg-white/15" />
      </div>
    ),
    defaultExcerpt:
      "A one-line summary of the insight, backed by the data or examples in the post.",
    defaultContent: `<h2>TL;DR</h2>
<p>Lead with the headline insight in one or two sentences.</p>

<h2>Key Findings</h2>
<ul>
  <li><strong>Finding one.</strong> What the data shows and why it matters.</li>
  <li><strong>Finding two.</strong> What the data shows and why it matters.</li>
  <li><strong>Finding three.</strong> What the data shows and why it matters.</li>
</ul>

<h2>What It Means</h2>
<p>Translate the findings into action for the reader.</p>`,
  },
];

/* ─────────────────────────── Component ─────────────────────────── */

const AddBlogModal = ({ isOpen, onClose, onCreate }: AddBlogModalProps) => {
  const [step, setStep] = useState<"select" | "edit">("select");
  const [selectedTemplate, setSelectedTemplate] =
    useState<BlogTemplate | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [timeFormat, setTimeFormat] = useState("AM");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandToggle = () => setIsExpanded((v) => !v);

  const reset = () => {
    setStep("select");
    setSelectedTemplate(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setVisibility("Public");
    setIsExpanded(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectTemplate = (template: BlogTemplate) => {
    setSelectedTemplate(template);
    setExcerpt(template.defaultExcerpt);
    setContent(template.defaultContent);
    setStep("edit");
  };

  const handleBack = () => {
    setStep("select");
    setSelectedTemplate(null);
  };

  const handlePublish = () => {
    if (!selectedTemplate) return;
    onCreate?.({
      templateId: selectedTemplate.id,
      title: title.trim() || "Untitled",
      excerpt: excerpt.trim(),
      content,
      visibility,
    });
    handleClose();
  };

  const handleSchedule = () => {
    if (!selectedTemplate) return;
    onCreate?.({
      templateId: selectedTemplate.id,
      title: title.trim() || "Untitled",
      excerpt: excerpt.trim(),
      content,
      visibility: "Schedule",
    });
    handleClose();
  };

  if (!isOpen) return null;

  const icons = [
    "/images/ico1.png",
    "/images/ico2.png",
    "/images/ico3.png",
    "/images/ico4.png",
    "/images/ico5.png",
    "/images/ico6.png",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-bgdark border border-white/20 rounded-xl p-6 w-[90%] max-w-[700px] h-[60vh] overflow-y-auto flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              {step === "edit" && (
                <button
                  onClick={handleBack}
                  className="text-white hover:text-gray-300 transition-colors text-[14px] aabbss"
                >
                  ← Templates
                </button>
              )}
              <h2 className="text-white text-[24px] font-bold aabbss">
                {step === "select" ? "Choose a template" : "Upload a new Blog"}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <TiTimes className="w-6 h-6" />
            </button>
          </div>

          {/* ───────────── Step 1: Template picker ───────────── */}
          {step === "select" && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TEMPLATES.map((tpl) => {
                const Preview = tpl.Preview;
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`group text-left rounded-xl border transition-all duration-200 overflow-hidden flex flex-col ${
                      isSelected
                        ? "border-greencolor bg-greencolor/10"
                        : "border-white/15 hover:border-white/40 bg-white/[0.02]"
                    }`}
                  >
                    {/* Wireframe preview */}
                    <div className="h-28 bg-white/[0.04] flex items-center justify-center border-b border-white/10">
                      <div className="w-[80%] opacity-80 group-hover:opacity-100 transition-opacity">
                        <Preview />
                      </div>
                    </div>
                    {/* Label */}
                    <div className="p-3 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tpl.accent }}
                        />
                        <span className="text-white text-[15px] font-semibold aabbss">
                          {tpl.name}
                        </span>
                      </div>
                      <span className="text-white/50 text-[12px] leading-snug">
                        {tpl.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ───────────── Step 2: Editor seeded by template ───────────── */}
          {step === "edit" && selectedTemplate && (
            <div className="mt-6 flex flex-col gap-5">
              {/* Title */}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Blog title"
                className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white text-[18px] font-semibold aabbss placeholder:text-white/30 focus:outline-none focus:border-greencolor"
              />

              {/* Excerpt */}
              <input
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short excerpt / summary"
                className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-greencolor"
              />

              {/* Tell your story toggle + formatting icons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExpandToggle}
                  className="flex items-center gap-2 text-greencolor hover:text-greencolor/80 transition-all duration-300"
                >
                  <div
                    className={`transform transition-transform duration-300 ${
                      isExpanded ? "rotate-45" : "rotate-0"
                    }`}
                  >
                    <TiPlus className="p-1 border text-3xl border-greencolor rounded-full" />
                  </div>
                  {!isExpanded && <span className="aabbss">Tell your story</span>}
                </button>
                {isExpanded && (
                  <div className="flex items-center gap-3">
                    {icons.map((icon, index) => (
                      <div
                        key={index}
                        className="p-1 border border-lightgray hover:bg-greencolor hover:border-greencolor rounded-full"
                      >
                        <Image
                          src={icon}
                          alt="Icon"
                          width={20}
                          height={20}
                          className="w-6 h-6 text-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content editor (seeded with the chosen template) */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog content…"
                className="w-full min-h-[180px] bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white text-[14px] leading-relaxed placeholder:text-white/30 focus:outline-none focus:border-greencolor resize-y font-mono"
              />
              <span className="text-white/40 text-[11px] -mt-3">
                Started from the <strong>{selectedTemplate.name}</strong>{" "}
                template — edit freely.
              </span>
            </div>
          )}
        </div>

        {/* Bottom Actions (edit step only) */}
        {step === "edit" && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-greencolor"
              >
                <option value="Public" className="bg-bgdark">
                  Public
                </option>
                <option value="Private" className="bg-bgdark">
                  Private
                </option>
                <option value="Schedule" className="bg-bgdark">
                  Schedule
                </option>
              </select>

              {/* Date Component - Pixel Perfect */}
              {isExpanded && (
                <div className="flex items-center justify-center gap-[10px] px-[20px] pr-[50px] py-[8px] border border-[#4A4A4A] rounded-lg">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.6667 3.33333H15.8333V2.5C15.8333 2.04167 15.4583 1.66667 15 1.66667C14.5417 1.66667 14.1667 2.04167 14.1667 2.5V3.33333H5.83333V2.5C5.83333 2.04167 5.45833 1.66667 5 1.66667C4.54167 1.66667 4.16667 2.04167 4.16667 2.5V3.33333H3.33333C2.41667 3.33333 1.66667 4.08333 1.66667 5V16.6667C1.66667 17.5833 2.41667 18.3333 3.33333 18.3333H16.6667C17.5833 18.3333 18.3333 17.5833 18.3333 16.6667V5C18.3333 4.08333 17.5833 3.33333 16.6667 3.33333ZM16.6667 16.6667H3.33333V8.33333H16.6667V16.6667ZM3.33333 6.66667V5H16.6667V6.66667H3.33333Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <span className="text-white aabbss font-normal text-[14px] ">
                    Date
                  </span>
                </div>
              )}

              {/* Time Component - Pixel Perfect */}
              {isExpanded && (
                <div className="flex items-center justify-center gap-[20px] px-[20px] py-[10px] border border-[#4A4A4A] rounded-lg">
                  <span className="text-white aabbss font-normal text-[14px] ">
                    Time
                  </span>
                  <div className="w-px h-[20px] bg-[#4A4A4A]"></div>
                  <span className="text-white aabbss font-normal text-[14px] ">
                    {timeFormat}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isExpanded ? (
                <button
                  onClick={handleSchedule}
                  className="bg-greencolor text-white px-6 py-2 rounded-lg hover:bg-greencolor/90 transition-colors aabbss"
                >
                  Schedule
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  className="bg-greencolor text-white px-6 py-2 rounded-lg hover:bg-greencolor/90 transition-colors aabbss"
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBlogModal;
