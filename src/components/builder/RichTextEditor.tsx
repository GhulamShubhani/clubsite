"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { sanitizeHtml } from "@/lib/security/sanitize";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[80px] px-2 py-1.5 text-sm text-zinc-900 focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(sanitizeHtml(ed.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="min-h-[100px] rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-400">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-zinc-300 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 bg-zinc-50 p-1">
        {(
          [
            {
              label: "Bold",
              active: editor.isActive("bold"),
              run: () => editor.chain().focus().toggleBold().run(),
            },
            {
              label: "Italic",
              active: editor.isActive("italic"),
              run: () => editor.chain().focus().toggleItalic().run(),
            },
            {
              label: "H2",
              active: editor.isActive("heading", { level: 2 }),
              run: () =>
                editor.chain().focus().toggleHeading({ level: 2 }).run(),
            },
            {
              label: "List",
              active: editor.isActive("bulletList"),
              run: () => editor.chain().focus().toggleBulletList().run(),
            },
          ] as const
        ).map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.run}
            className={
              btn.active
                ? "rounded bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white"
                : "rounded px-2 py-0.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-200"
            }
          >
            {btn.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
