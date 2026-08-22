"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapImage from "@tiptap/extension-image";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  Minus,
} from "lucide-react";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// Only these schemes may be stored in post HTML — blocks javascript:, data:, etc.
const ALLOWED_LINK_PROTOCOLS = ["http:", "https:", "mailto:"];

function isSafeLinkUrl(url: string): boolean {
  // Relative paths are fine, but "//host" is protocol-relative — not a path.
  if (url.startsWith("/")) return !url.startsWith("//");
  try {
    return ALLOWED_LINK_PROTOCOLS.includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

// Only image extensions may land in the public bucket — a spoofed name like
// "x.html" would otherwise be served as HTML (stored XSS).
const ALLOWED_IMAGE_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function RichEditor({ value, onChange }: RichEditorProps) {
  const supabase = createClient();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Start writing your post...",
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full h-auto my-4",
        },
      }),
    ],
    // Required under Next.js SSR (TipTap v3) to avoid hydration mismatches
    immediatelyRender: false,
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:")?.trim();
    if (!url) return;
    if (!isSafeLinkUrl(url)) {
      toast.error("Only http(s) links are allowed");
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(async () => {
    if (!editor) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.heic,.heif";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > MAX_IMAGE_SIZE) {
        toast.error("Image is too large — maximum size is 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files can be uploaded.");
        return;
      }

      // Derive the storage extension from the whitelist, never the raw filename
      const rawExt = (file.name.split(".").pop() || "").toLowerCase();
      const ext = ALLOWED_IMAGE_EXT[rawExt] ? rawExt : "jpg";
      const fileName = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { contentType: ALLOWED_IMAGE_EXT[ext] });

      if (error) {
        console.error("Image upload error:", error);
        toast.error(`Image upload failed: ${error.message}`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }, [editor, supabase]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-secondary/30">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Link & Image */}
        <ToolbarButton
          onClick={addLink}
          active={editor.isActive("link")}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Add Image">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Horizontal Rule */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: oklch(0.55 0.02 60);
          pointer-events: none;
          height: 0;
        }
        .tiptap {
          min-height: 300px;
        }
        .tiptap h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
          line-height: 1.2;
        }
        .tiptap h2 {
          font-size: 1.4rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
          line-height: 1.3;
        }
        .tiptap h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem;
          line-height: 1.4;
        }
        .tiptap p {
          margin: 0.5rem 0;
          line-height: 1.7;
        }
        .tiptap ul,
        .tiptap ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .tiptap li {
          margin: 0.25rem 0;
        }
        .tiptap blockquote {
          border-left: 3px solid oklch(0.70 0.10 70);
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: oklch(0.50 0.02 60);
        }
        .tiptap hr {
          border: none;
          border-top: 1px solid oklch(0.90 0.015 85);
          margin: 1.5rem 0;
        }
        .tiptap img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1rem 0;
        }
        .tiptap a {
          color: oklch(0.55 0.12 70);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
