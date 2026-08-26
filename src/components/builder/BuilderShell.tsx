"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageContent, PageSection } from "@/lib/page-schema";
import {
  COMPONENT_REGISTRY,
  listComponentsByCategory,
} from "@/lib/components/registry";
import {
  resolveSectionForDevice,
  type RenderDevice,
} from "@/components/renderer/PageRenderer";
import { SectionRenderer } from "@/components/renderer/SectionRenderer";
import { useBuilderStore } from "./builder-store";
import { RichTextEditor } from "./RichTextEditor";
import { MediaPicker } from "./MediaPicker";
import { StyleField } from "./StyleField";

type BuilderShellProps = {
  pageId: string;
  initialTitle: string;
  initialContent: PageContent;
};

const HERO_LAYOUTS = [
  { value: "centered", label: "Simple text (centered)" },
  { value: "full-width-bg", label: "Text on background image" },
  { value: "carousel", label: "Carousel (each slide: image + text)" },
  { value: "text-left-image-right", label: "Text left + image right" },
  { value: "image-left-text-right", label: "Image left + text right" },
  { value: "split-screen", label: "Split screen" },
  { value: "video-bg", label: "Text on video background" },
  { value: "gaming-banner", label: "Gaming banner" },
] as const;

const GRID_VARIANTS = [
  { value: "cards", label: "Cards (bordered)" },
  { value: "image-top", label: "Image on top" },
  { value: "image-left", label: "Image left + text" },
  { value: "overlay", label: "Image overlay + text" },
  { value: "minimal", label: "Minimal (no border)" },
  { value: "featured", label: "Featured (large first item)" },
] as const;

const STYLE_FIELDS = [
  ["width", "Width"],
  ["height", "Height"],
  ["padding", "Padding"],
  ["margin", "Margin"],
  ["textAlign", "Text align"],
  ["alignment", "Alignment"],
  ["background", "Background"],
  ["color", "Color"],
  ["fontFamily", "Font family"],
  ["fontSize", "Font size"],
  ["fontWeight", "Font weight"],
  ["lineHeight", "Line height"],
  ["border", "Border"],
  ["borderRadius", "Border radius"],
  ["boxShadow", "Box shadow"],
] as const;

const RESPONSIVE_FIELDS = [
  ["padding", "Padding"],
  ["fontSize", "Font size"],
  ["textAlign", "Text align"],
] as const;

function fieldClass() {
  return "mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm";
}

function HeroCarouselEditor({
  slides,
  onChange,
}: {
  slides: Array<Record<string, unknown>>;
  onChange: (slides: Array<Record<string, unknown>>) => void;
}) {
  const list =
    slides.length > 0
      ? slides
      : [
          {
            imageUrl: "",
            heading: "Slide 1 heading",
            description: "Short text for this slide.",
            ctaLabel: "Learn more",
            ctaHref: "#",
          },
        ];

  function updateSlide(index: number, patch: Record<string, unknown>) {
    const next = list.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  }

  function addSlide() {
    onChange([
      ...list,
      {
        imageUrl: "",
        heading: `Slide ${list.length + 1}`,
        description: "",
        ctaLabel: "",
        ctaHref: "#",
      },
    ]);
  }

  function removeSlide(index: number) {
    onChange(list.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        Each slide has its own background image and text.
      </p>
      {list.map((slide, index) => (
        <div
          key={index}
          className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700">
              Slide {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeSlide(index)}
              className="cursor-pointer text-xs text-red-600 underline"
            >
              Remove
            </button>
          </div>
          <MediaPicker
            label="Slide image"
            value={String(slide.imageUrl ?? "")}
            onSelect={(url) => updateSlide(index, { imageUrl: url })}
          />
          <label className="block">
            <span className="text-xs text-zinc-500">Heading</span>
            <input
              className={fieldClass()}
              value={String(slide.heading ?? "")}
              onChange={(e) => updateSlide(index, { heading: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500">Text</span>
            <textarea
              className={fieldClass()}
              rows={2}
              value={String(slide.description ?? "")}
              onChange={(e) =>
                updateSlide(index, { description: e.target.value })
              }
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500">Button label</span>
            <input
              className={fieldClass()}
              value={String(slide.ctaLabel ?? "")}
              onChange={(e) =>
                updateSlide(index, { ctaLabel: e.target.value })
              }
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500">Button link</span>
            <input
              className={fieldClass()}
              value={String(slide.ctaHref ?? "")}
              onChange={(e) => updateSlide(index, { ctaHref: e.target.value })}
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={addSlide}
        className="cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
      >
        + Add slide
      </button>
    </div>
  );
}

function GridItemsEditor({
  items,
  onChange,
}: {
  items: Array<Record<string, unknown>>;
  onChange: (items: Array<Record<string, unknown>>) => void;
}) {
  const list =
    items.length > 0
      ? items
      : [{ title: "Item 1", body: "Description", mediaType: "none" }];

  function updateItem(index: number, patch: Record<string, unknown>) {
    const next = list.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  }

  function addItem() {
    onChange([
      ...list,
      {
        title: `Item ${list.length + 1}`,
        body: "Description",
        mediaType: "none",
        imageUrl: "",
        videoUrl: "",
        href: "",
      },
    ]);
  }

  function removeItem(index: number) {
    onChange(list.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        Add any number of items. Each can include text with an optional image or video.
      </p>
      {list.map((item, index) => {
        const mediaType = String(item.mediaType ?? "none");
        return (
          <div
            key={index}
            className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700">
                Item {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={list.length <= 1}
                className="cursor-pointer text-xs text-red-600 underline disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline"
              >
                Remove
              </button>
            </div>
            <label className="block">
              <span className="text-xs text-zinc-500">Media</span>
              <select
                className={`${fieldClass()} cursor-pointer`}
                value={mediaType}
                onChange={(e) => {
                  const next = e.target.value;
                  const patch: Record<string, unknown> = { mediaType: next };
                  if (next === "none") {
                    patch.imageUrl = "";
                    patch.videoUrl = "";
                  }
                  updateItem(index, patch);
                }}
              >
                <option value="none">Text only</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              {mediaType === "none" ? (
                <p className="mt-1 text-[11px] text-zinc-400">
                  Select <strong className="font-medium text-zinc-500">Image</strong> above to upload or choose from your media library.
                </p>
              ) : null}
            </label>
            {mediaType === "image" ? (
              <MediaPicker
                label="Image"
                value={String(item.imageUrl ?? "")}
                onSelect={(url) => updateItem(index, { imageUrl: url })}
              />
            ) : null}
            {mediaType === "video" ? (
              <label className="block">
                <span className="text-xs text-zinc-500">Video URL</span>
                <input
                  className={fieldClass()}
                  placeholder="MP4 or YouTube/Vimeo embed URL"
                  value={String(item.videoUrl ?? "")}
                  onChange={(e) =>
                    updateItem(index, { videoUrl: e.target.value })
                  }
                />
              </label>
            ) : null}
            <label className="block">
              <span className="text-xs text-zinc-500">Title</span>
              <input
                className={fieldClass()}
                value={String(item.title ?? "")}
                onChange={(e) => updateItem(index, { title: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Description</span>
              <textarea
                className={fieldClass()}
                rows={2}
                value={String(item.body ?? item.description ?? "")}
                onChange={(e) => updateItem(index, { body: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Link (optional)</span>
              <input
                className={fieldClass()}
                placeholder="https://"
                value={String(item.href ?? "")}
                onChange={(e) => updateItem(index, { href: e.target.value })}
              />
            </label>
          </div>
        );
      })}
      <button
        type="button"
        onClick={addItem}
        className="cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
      >
        + Add item
      </button>
    </div>
  );
}

function ComponentLibrary() {
  const addSection = useBuilderStore((s) => s.addSection);
  const standard = listComponentsByCategory("standard");
  const gaming = listComponentsByCategory("gaming");

  function handleAdd(type: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addSection(type);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-r border-zinc-200 bg-zinc-50">
      <div className="shrink-0 border-b border-zinc-200 px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Components
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <p className="mb-2 text-[11px] font-medium uppercase text-zinc-400">
          Standard
        </p>
        <ul className="mb-6 space-y-1">
          {standard.map((c) => (
            <li key={c.type}>
              <button
                type="button"
                onClick={(e) => handleAdd(c.type, e)}
                className="w-full rounded-md px-2 py-1.5 text-left text-sm text-zinc-800 hover:bg-zinc-200"
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
        <p className="mb-2 text-[11px] font-medium uppercase text-zinc-400">
          Gaming
        </p>
        <ul className="space-y-1">
          {gaming.map((c) => (
            <li key={c.type}>
              <button
                type="button"
                onClick={(e) => handleAdd(c.type, e)}
                className="w-full rounded-md px-2 py-1.5 text-left text-sm text-zinc-800 hover:bg-zinc-200"
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PropertiesPanel() {
  const sections = useBuilderStore((s) => s.sections);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const device = useBuilderStore((s) => s.device);
  const updateProps = useBuilderStore((s) => s.updateProps);
  const updateStyles = useBuilderStore((s) => s.updateStyles);
  const updateResponsive = useBuilderStore((s) => s.updateResponsive);
  const replaceProps = useBuilderStore((s) => s.replaceProps);
  const removeSection = useBuilderStore((s) => s.removeSection);

  const selected = sections.find((s) => s.id === selectedId) ?? null;
  const label = selected
    ? (COMPONENT_REGISTRY[selected.type]?.label ?? selected.type)
    : null;

  const [advancedJson, setAdvancedJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setAdvancedJson("");
      setJsonError(null);
      return;
    }
    setAdvancedJson(JSON.stringify(selected.props, null, 2));
    setJsonError(null);
    // Only re-sync when selection changes — not on every prop keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (!selected) {
    return (
      <div className="flex h-full flex-col border-l border-zinc-200 bg-zinc-50">
        <div className="border-b border-zinc-200 px-3 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Properties
          </h2>
        </div>
        <p className="p-4 text-sm text-zinc-500">
          Select a section on the canvas to edit its props and styles.
        </p>
      </div>
    );
  }

  const props = selected.props;
  const styles = selected.styles ?? {};
  const responsive = selected.responsive?.[device] ?? {};
  const isTextLike =
    selected.type === "text" ||
    selected.type === "heading" ||
    "description" in props ||
    "heading" in props ||
    "text" in props;

  const heading = String(props.heading ?? props.title ?? props.text ?? "");
  const description = String(
    props.description ?? props.body ?? props.subheading ?? "",
  );

  function setHeadingHtml(value: string) {
    const next: Record<string, unknown> = { heading: value };
    if ("title" in props) next.title = value;
    if ("text" in props) next.text = value;
    if ("name" in props) next.name = value;
    updateProps(selected!.id, next);
  }

  function setDescriptionHtml(value: string) {
    const next: Record<string, unknown> = { description: value };
    if ("body" in props) next.body = value;
    if ("subheading" in props) next.subheading = value;
    updateProps(selected!.id, next);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-l border-zinc-200 bg-zinc-50">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-3 py-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Properties
          </h2>
          <p className="mt-0.5 text-sm font-medium text-zinc-900">{label}</p>
        </div>
        <button
          type="button"
          onClick={() => removeSection(selected.id)}
          className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          Remove
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {isTextLike ? (
          <>
            <div>
              <span className="mb-1 block text-xs font-medium text-zinc-500">
                Heading
              </span>
              <RichTextEditor value={heading} onChange={setHeadingHtml} />
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-zinc-500">
                Description
              </span>
              <RichTextEditor
                value={description}
                onChange={setDescriptionHtml}
              />
            </div>
          </>
        ) : null}

        {selected.type === "hero" ? (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Hero
            </p>
            <label className="block">
              <span className="text-xs text-zinc-500">Layout</span>
              <select
                className={`${fieldClass()} cursor-pointer`}
                value={String(props.layout ?? "centered")}
                onChange={(e) => {
                  const layout = e.target.value;
                  updateProps(selected.id, { layout });
                  if (layout === "carousel" || layout === "full-width-bg") {
                    updateStyles(selected.id, { padding: "0" });
                  }
                }}
              >
                {HERO_LAYOUTS.map((layout) => (
                  <option key={layout.value} value={layout.value}>
                    {layout.label}
                  </option>
                ))}
              </select>
            </label>

            {String(props.layout) === "carousel" ? (
              <HeroCarouselEditor
                slides={
                  Array.isArray(props.slides)
                    ? (props.slides as Array<Record<string, unknown>>)
                    : []
                }
                onChange={(slides) => updateProps(selected.id, { slides })}
              />
            ) : (
              <>
                <MediaPicker
                  label={
                    String(props.layout) === "full-width-bg" ||
                    String(props.layout) === "background-image"
                      ? "Background image"
                      : "Image"
                  }
                  value={String(props.imageUrl ?? "")}
                  onSelect={(url) =>
                    updateProps(selected.id, { imageUrl: url })
                  }
                />
                {String(props.layout) === "video-bg" ? (
                  <label className="block">
                    <span className="text-xs text-zinc-500">Video URL</span>
                    <input
                      className={fieldClass()}
                      value={String(props.videoUrl ?? "")}
                      onChange={(e) =>
                        updateProps(selected.id, { videoUrl: e.target.value })
                      }
                    />
                  </label>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {selected.type === "grid" ? (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Grid
            </p>
            <label className="block">
              <span className="text-xs text-zinc-500">Layout style</span>
              <select
                className={`${fieldClass()} cursor-pointer`}
                value={String(props.variant ?? "cards")}
                onChange={(e) =>
                  updateProps(selected.id, { variant: e.target.value })
                }
              >
                {GRID_VARIANTS.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Columns</span>
              <select
                className={`${fieldClass()} cursor-pointer`}
                value={String(props.columns ?? 3)}
                onChange={(e) =>
                  updateProps(selected.id, {
                    columns: Number.parseInt(e.target.value, 10),
                  })
                }
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} column{n === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>
            <GridItemsEditor
              items={
                Array.isArray(props.items)
                  ? (props.items as Array<Record<string, unknown>>)
                  : []
              }
              onChange={(items) => updateProps(selected.id, { items })}
            />
          </div>
        ) : null}

        {selected.type === "navbar" ? (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Navbar
            </p>
            <MediaPicker
              label="Logo"
              value={String(props.logoUrl ?? "")}
              onSelect={(url) => updateProps(selected.id, { logoUrl: url })}
            />
            <label className="block">
              <span className="text-xs text-zinc-500">Brand</span>
              <input
                className={fieldClass()}
                value={String(props.brand ?? "")}
                onChange={(e) =>
                  updateProps(selected.id, { brand: e.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">CTA label</span>
              <input
                className={fieldClass()}
                value={String(props.ctaLabel ?? "")}
                onChange={(e) =>
                  updateProps(selected.id, { ctaLabel: e.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">CTA href</span>
              <input
                className={fieldClass()}
                value={String(props.ctaHref ?? "")}
                onChange={(e) =>
                  updateProps(selected.id, { ctaHref: e.target.value })
                }
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={Boolean(props.sticky)}
                onChange={(e) =>
                  updateProps(selected.id, { sticky: e.target.checked })
                }
              />
              Sticky
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={props.mobileMenu !== false}
                onChange={(e) =>
                  updateProps(selected.id, { mobileMenu: e.target.checked })
                }
              />
              Mobile menu button
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Height</span>
              <select
                className={`${fieldClass()} cursor-pointer`}
                value={String(props.height ?? "")}
                onChange={(e) =>
                  updateProps(selected.id, { height: e.target.value })
                }
              >
                <option value="">Default</option>
                <option value="48px">48px</option>
                <option value="56px">56px</option>
                <option value="64px">64px</option>
                <option value="72px">72px</option>
                <option value="80px">80px</option>
              </select>
            </label>
          </div>
        ) : null}

        {selected.type === "image" || selected.type === "card" ? (
          <MediaPicker
            label="Image"
            value={String(props.imageUrl ?? "")}
            onSelect={(url) => updateProps(selected.id, { imageUrl: url })}
          />
        ) : null}

        {selected.type === "video" ? (
          <div className="space-y-3">
            <MediaPicker
              label="Video"
              value={String(props.videoUrl ?? "")}
              onSelect={(url) => updateProps(selected.id, { videoUrl: url })}
            />
            <MediaPicker
              label="Poster"
              value={String(props.posterUrl ?? "")}
              onSelect={(url) => updateProps(selected.id, { posterUrl: url })}
            />
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Styles
          </p>
          {STYLE_FIELDS.map(([key, labelText]) => (
            <StyleField
              key={key}
              fieldKey={key}
              label={labelText}
              value={String(styles[key] ?? "")}
              onChange={(next) =>
                updateStyles(selected.id, { [key]: next })
              }
              className={fieldClass()}
            />
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Responsive
          </p>
          <p className="mb-2 text-xs text-zinc-500">
            Editing overrides for: {device}
          </p>
          {RESPONSIVE_FIELDS.map(([key, labelText]) => (
            <StyleField
              key={key}
              fieldKey={key}
              label={labelText}
              value={String(responsive[key] ?? "")}
              onChange={(next) =>
                updateResponsive(selected.id, device, {
                  [key]: next,
                })
              }
              className={fieldClass()}
            />
          ))}
        </div>

        <label className="block">
          <span className="text-xs font-medium text-zinc-500">
            Advanced props (JSON)
          </span>
          <textarea
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 font-mono text-xs"
            rows={10}
            value={advancedJson}
            onChange={(e) => setAdvancedJson(e.target.value)}
            onBlur={() => {
              try {
                const parsed = JSON.parse(advancedJson) as Record<
                  string,
                  unknown
                >;
                if (
                  typeof parsed !== "object" ||
                  parsed === null ||
                  Array.isArray(parsed)
                ) {
                  setJsonError("Props must be a JSON object");
                  return;
                }
                setJsonError(null);
                replaceProps(selected.id, parsed);
              } catch {
                setJsonError("Invalid JSON");
              }
            }}
          />
          {jsonError ? (
            <p className="mt-1 text-xs text-red-600">{jsonError}</p>
          ) : null}
        </label>
      </div>
    </div>
  );
}

type VersionRow = {
  id: string;
  kind: string;
  version: number;
  publishedAt: string | null;
  createdAt: string;
};

function VersionsPanel({
  pageId,
  onStatus,
}: {
  pageId: string;
  onStatus: (msg: string) => void;
}) {
  const load = useBuilderStore((s) => s.load);
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/pages/${pageId}/versions`);
    const data = (await res.json()) as {
      versions?: VersionRow[];
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? "Failed to load versions");
    setVersions(data.versions ?? []);
  }, [pageId]);

  useEffect(() => {
    if (!open) return;
    void fetchVersions().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load versions"),
    );
  }, [open, fetchVersions]);

  async function reloadDraft() {
    const res = await fetch(`/api/pages/${pageId}/draft`);
    const data = (await res.json()) as {
      page?: { title: string };
      draft?: { content: PageContent };
      error?: string;
    };
    if (!res.ok || !data.draft || !data.page) {
      throw new Error(data.error ?? "Failed to reload draft");
    }
    load(pageId, data.page.title, data.draft.content);
  }

  async function restore(versionId: string, publish = false) {
    setBusy(versionId + (publish ? ":pub" : ""));
    setError(null);
    try {
      const res = await fetch(`/api/pages/${pageId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId, publish }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Restore failed");
      await reloadDraft();
      await fetchVersions();
      onStatus(publish ? "Restored and published" : "Draft restored");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setBusy(null);
    }
  }

  const historyLike = versions.filter(
    (v) => v.kind === "HISTORY" || v.kind === "PUBLISHED",
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
      >
        Versions
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-1 w-80 rounded-lg border border-zinc-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Versions
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] text-zinc-500 hover:text-zinc-800"
            >
              Close
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {error ? (
              <p className="px-2 py-1 text-xs text-red-600">{error}</p>
            ) : null}
            {historyLike.length === 0 ? (
              <p className="px-2 py-3 text-xs text-zinc-500">No history yet.</p>
            ) : (
              <ul className="space-y-2">
                {historyLike.map((v) => (
                  <li
                    key={v.id}
                    className="rounded-md border border-zinc-100 px-2 py-2"
                  >
                    <p className="text-xs font-medium text-zinc-800">
                      {v.kind} · v{v.version}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {new Date(v.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {v.kind === "HISTORY" || v.kind === "PUBLISHED" ? (
                        <button
                          type="button"
                          disabled={busy !== null}
                          onClick={() => void restore(v.id, false)}
                          className="text-[11px] text-zinc-700 underline disabled:opacity-50"
                        >
                          Restore
                        </button>
                      ) : null}
                      {v.kind === "HISTORY" || v.kind === "PUBLISHED" ? (
                        <button
                          type="button"
                          disabled={busy !== null}
                          onClick={() => void restore(v.id, true)}
                          className="text-[11px] text-zinc-700 underline disabled:opacity-50"
                        >
                          Publish this version
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SortableSection({
  section,
  device,
  selected,
  onSelect,
}: {
  section: PageSection;
  device: RenderDevice;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const resolved = resolveSectionForDevice(section, device);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        selected
          ? "relative outline-2 -outline-offset-2 outline-sky-500"
          : "relative hover:outline-1 hover:-outline-offset-1 hover:outline-zinc-300"
      }
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <button
        type="button"
        className="absolute left-1 top-1 z-10 rounded bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        Drag
      </button>
      <SectionRenderer section={resolved} device={device} />
    </div>
  );
}

function BuilderCanvas() {
  const sections = useBuilderStore((s) => s.sections);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const device = useBuilderStore((s) => s.device);
  const select = useBuilderStore((s) => s.select);
  const reorder = useBuilderStore((s) => s.reorder);
  const setDevice = useBuilderStore((s) => s.setDevice);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = useMemo(() => sections.map((s) => s.id), [sections]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorder(String(active.id), String(over.id));
  }

  const widthClass =
    device === "mobile"
      ? "max-w-[390px]"
      : device === "tablet"
        ? "max-w-[768px]"
        : "max-w-5xl";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-zinc-100">
      <div className="flex shrink-0 items-center justify-center gap-1 border-b border-zinc-200 bg-white px-3 py-2">
        {(
          [
            ["desktop", "Desktop"],
            ["tablet", "Tablet"],
            ["mobile", "Mobile"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setDevice(value)}
            className={
              device === value
                ? "rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white"
                : "rounded-md px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
            }
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto p-6"
        onClick={() => select(null)}
      >
        <div
          className={`mx-auto mb-16 min-h-120 rounded-lg border border-zinc-200 bg-white shadow-sm ${widthClass}`}
        >
          {sections.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
              Add components from the library
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={ids}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    device={device}
                    selected={selectedId === section.id}
                    onSelect={() => select(section.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}

export function BuilderShell({
  pageId,
  initialTitle,
  initialContent,
}: BuilderShellProps) {
  const load = useBuilderStore((s) => s.load);
  const title = useBuilderStore((s) => s.title);
  const sections = useBuilderStore((s) => s.sections);
  const dirty = useBuilderStore((s) => s.dirty);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const undoStack = useBuilderStore((s) => s.undoStack);
  const redoStack = useBuilderStore((s) => s.redoStack);
  const markSaved = useBuilderStore((s) => s.markSaved);

  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    load(pageId, initialTitle, initialContent);
  }, [pageId, initialTitle, initialContent, load]);

  function saveDraft() {
    startTransition(async () => {
      setStatus(null);
      try {
        const res = await fetch(`/api/pages/${pageId}/draft`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: { sections } }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "Failed to save draft");
        }
        markSaved();
        setStatus("Draft saved");
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function publish() {
    startTransition(async () => {
      setStatus(null);
      try {
        const saveRes = await fetch(`/api/pages/${pageId}/draft`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: { sections } }),
        });
        if (!saveRes.ok) {
          throw new Error("Could not save draft before publish");
        }
        markSaved();

        const res = await fetch(`/api/pages/${pageId}/publish`, {
          method: "POST",
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "Publish failed");
        }
        setStatus("Published");
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Publish failed");
      }
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white text-zinc-900">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-zinc-200 px-4 py-2">
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Admin
        </Link>
        <h1 className="text-sm font-semibold text-zinc-900">{title}</h1>
        {dirty ? (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
            Unsaved
          </span>
        ) : null}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <VersionsPanel pageId={pageId} onStatus={setStatus} />
          <button
            type="button"
            onClick={() => undo()}
            disabled={undoStack.length === 0}
            className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 disabled:opacity-40"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => redo()}
            disabled={redoStack.length === 0}
            className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 disabled:opacity-40"
          >
            Redo
          </button>
          <Link
            href={`/admin/preview/${pageId}`}
            target="_blank"
            className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Preview
          </Link>
          <button
            type="button"
            onClick={saveDraft}
            disabled={pending}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={pending}
            className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </header>
      {status ? (
        <div className="shrink-0 border-b border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs text-zinc-600">
          {status}
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_300px] overflow-hidden">
        <ComponentLibrary />
        <BuilderCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
