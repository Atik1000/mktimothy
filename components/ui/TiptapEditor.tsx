"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, Highlighter,
  Heading1, Heading2, Heading3, Pilcrow, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const toggleAlign = (alignment: string) => {
    editor.chain().focus().setTextAlign(alignment).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-zinc-900/50 rounded-t-xl">
      {/* Inline Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("bold") ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("italic") ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("underline") ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("strike") ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("highlight") ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Highlight"
      >
        <Highlighter className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1 self-center" />

      {/* Headings and Paragraph */}
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("paragraph") ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Paragraph"
      >
        <Pilcrow className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("heading", { level: 1 }) ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("heading", { level: 2 }) ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("heading", { level: 3 }) ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1 self-center" />

      {/* Alignment */}
      <button
        onClick={() => toggleAlign('left')}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive({ textAlign: 'left' }) ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => toggleAlign('center')}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive({ textAlign: 'center' }) ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => toggleAlign('right')}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive({ textAlign: 'right' }) ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1 self-center" />

      {/* Lists and Quotes */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("bulletList") ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("orderedList") ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive("blockquote") ? "bg-white/10 text-greencolor" : "text-zinc-400"
        }`}
        type="button" title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1 self-center" />

      {/* History */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-white/10 text-zinc-400 disabled:opacity-50 transition-colors"
        type="button" title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-white/10 text-zinc-400 disabled:opacity-50 transition-colors"
        type="button" title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className = "",
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[250px] p-4 focus:outline-none prose-p:my-2 prose-headings:my-3",
      },
    },
  });

  return (
    <div
      className={`border border-white/10 rounded-xl bg-zinc-900/50 focus-within:border-greencolor focus-within:ring-1 focus-within:ring-greencolor transition-all ${className}`}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
