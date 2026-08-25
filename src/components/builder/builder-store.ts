import { create } from "zustand";
import type { PageContent, PageSection } from "@/lib/page-schema";
import { createSection } from "@/lib/components/registry";
import type { RenderDevice } from "@/components/renderer/PageRenderer";

const MAX_HISTORY = 50;
let lastAddAt = 0;

function cloneSections(sections: PageSection[]): PageSection[] {
  return structuredClone(sections);
}

type BuilderState = {
  pageId: string;
  title: string;
  sections: PageSection[];
  selectedId: string | null;
  device: RenderDevice;
  dirty: boolean;
  undoStack: PageSection[][];
  redoStack: PageSection[][];
  load: (pageId: string, title: string, content: PageContent) => void;
  select: (id: string | null) => void;
  addSection: (type: string) => void;
  removeSection: (id: string) => void;
  reorder: (activeId: string, overId: string) => void;
  updateProps: (id: string, props: Record<string, unknown>) => void;
  updateStyles: (id: string, styles: Record<string, unknown>) => void;
  updateResponsive: (
    id: string,
    device: RenderDevice,
    styles: Record<string, unknown>,
  ) => void;
  replaceProps: (id: string, props: Record<string, unknown>) => void;
  setDevice: (device: RenderDevice) => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
};

function pushHistory(
  state: Pick<BuilderState, "sections" | "undoStack" | "redoStack">,
): Pick<BuilderState, "undoStack" | "redoStack"> {
  return {
    undoStack: [...state.undoStack, cloneSections(state.sections)].slice(
      -MAX_HISTORY,
    ),
    redoStack: [],
  };
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  pageId: "",
  title: "",
  sections: [],
  selectedId: null,
  device: "desktop",
  dirty: false,
  undoStack: [],
  redoStack: [],

  load: (pageId, title, content) =>
    set({
      pageId,
      title,
      sections: cloneSections(content.sections ?? []),
      selectedId: null,
      dirty: false,
      undoStack: [],
      redoStack: [],
    }),

  select: (id) => set({ selectedId: id }),

  addSection: (type) => {
    const now = Date.now();
    if (now - lastAddAt < 300) return;
    lastAddAt = now;

    const state = get();
    const section = createSection(type);
    set({
      ...pushHistory(state),
      sections: [...state.sections, section],
      selectedId: section.id,
      dirty: true,
    });
  },

  removeSection: (id) => {
    const state = get();
    set({
      ...pushHistory(state),
      sections: state.sections.filter((s) => s.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      dirty: true,
    });
  },

  reorder: (activeId, overId) => {
    if (activeId === overId) return;
    const state = get();
    const oldIndex = state.sections.findIndex((s) => s.id === activeId);
    const newIndex = state.sections.findIndex((s) => s.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = cloneSections(state.sections);
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    set({
      ...pushHistory(state),
      sections: next,
      dirty: true,
    });
  },

  updateProps: (id, props) => {
    const state = get();
    set({
      ...pushHistory(state),
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, props: { ...s.props, ...props } } : s,
      ),
      dirty: true,
    });
  },

  updateStyles: (id, styles) => {
    const state = get();
    set({
      ...pushHistory(state),
      sections: state.sections.map((s) =>
        s.id === id
          ? { ...s, styles: { ...(s.styles ?? {}), ...styles } }
          : s,
      ),
      dirty: true,
    });
  },

  updateResponsive: (id, device, styles) => {
    const state = get();
    set({
      ...pushHistory(state),
      sections: state.sections.map((s) => {
        if (s.id !== id) return s;
        const responsive = { ...(s.responsive ?? {}) };
        responsive[device] = {
          ...(responsive[device] ?? {}),
          ...styles,
        };
        return { ...s, responsive };
      }),
      dirty: true,
    });
  },

  replaceProps: (id, props) => {
    const state = get();
    set({
      ...pushHistory(state),
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, props: structuredClone(props) } : s,
      ),
      dirty: true,
    });
  },

  setDevice: (device) => set({ device }),

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const previous = state.undoStack[state.undoStack.length - 1];
    set({
      sections: previous,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, cloneSections(state.sections)],
      dirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    set({
      sections: next,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, cloneSections(state.sections)],
      dirty: true,
    });
  },

  markSaved: () => set({ dirty: false }),
}));
