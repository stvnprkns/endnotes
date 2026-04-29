// src/context/EndnotesEngine.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

// src/core/warnings.ts
var warnedMessages = /* @__PURE__ */ new Set();
var nodeEnv = typeof globalThis !== "undefined" ? globalThis.process?.env?.NODE_ENV : void 0;
var isDev = nodeEnv !== "production";
function warnOnce(message) {
  if (!isDev || warnedMessages.has(message)) {
    return;
  }
  warnedMessages.add(message);
  console.warn(`[endnotes] ${message}`);
}

// src/core/identity.ts
function normalizeHref(href) {
  const trimmed = href.trim();
  if (!trimmed) {
    return "";
  }
  try {
    const url = new URL(trimmed);
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return trimmed.toLowerCase().replace(/\/$/, "");
  }
}
function hashString(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
function fallbackIdentityFields(source) {
  return [
    source.kind ?? "",
    source.title ?? "",
    source.source ?? "",
    source.date ?? "",
    source.author ?? "",
    source.quote ?? "",
    source.supports ?? "",
    source.description ?? ""
  ].filter(Boolean);
}
function resolveSourceKey(source) {
  if (source.id?.trim()) {
    return `id:${source.id.trim()}`;
  }
  if (source.href?.trim()) {
    return `href:${normalizeHref(source.href)}`;
  }
  const fields = fallbackIdentityFields(source);
  if (fields.length === 0) {
    warnOnce(
      "Endnote source is missing id, href, and descriptive fields. Generated fallback identity may collide."
    );
    return "fallback:unknown";
  }
  warnOnce(
    "Endnote source is missing id and href. Using derived fallback identity; provide id for deterministic dedupe."
  );
  return `fallback:${hashString(fields.join("|"))}`;
}

// src/core/sorting.ts
function sortRegisteredEndnotes(notes) {
  return [...notes].sort((first, second) => first.number - second.number);
}

// src/core/sourceKind.ts
function inferEndnoteKind(source) {
  if (source.kind) {
    return source.kind;
  }
  if (source.href?.trim() || source.type) {
    return "citation";
  }
  return "note";
}

// src/core/registry.ts
function mergeSourceMetadata(existing, incoming, sourceKey) {
  if (existing.title && incoming.title && existing.title !== incoming.title) {
    warnOnce(`Conflicting metadata for source "${sourceKey}" (title mismatch).`);
  }
  return {
    ...incoming,
    ...existing
  };
}
var EndnotesRegistry = class {
  constructor() {
    this.notesByKey = /* @__PURE__ */ new Map();
  }
  register({ source, instanceId }) {
    const normalizedSource = {
      ...source,
      kind: inferEndnoteKind(source)
    };
    const key = resolveSourceKey(normalizedSource);
    const existing = this.notesByKey.get(key);
    if (existing) {
      const alreadyTracked = existing.instances.some(
        (instance) => instance.instanceId === instanceId
      );
      if (!alreadyTracked) {
        existing.instances.push({ instanceId, sourceKey: key });
      }
      existing.source = mergeSourceMetadata(existing.source, normalizedSource, key);
      return existing;
    }
    const number = this.notesByKey.size + 1;
    const created = {
      key,
      number,
      source: normalizedSource,
      instances: [{ instanceId, sourceKey: key }]
    };
    this.notesByKey.set(key, created);
    return created;
  }
  unregisterInstance(instanceId) {
    const entries = [...this.notesByKey.entries()];
    for (const [key, note] of entries) {
      const nextInstances = note.instances.filter(
        (instance) => instance.instanceId !== instanceId
      );
      if (nextInstances.length === note.instances.length) {
        continue;
      }
      if (nextInstances.length === 0) {
        this.notesByKey.delete(key);
      } else {
        note.instances = nextInstances;
        this.notesByKey.set(key, note);
      }
    }
    this.reindex();
  }
  getByKey(key) {
    return this.notesByKey.get(key);
  }
  getOrderedNotes() {
    return sortRegisteredEndnotes([...this.notesByKey.values()]);
  }
  snapshot() {
    return { notes: this.getOrderedNotes() };
  }
  clear() {
    this.notesByKey.clear();
  }
  reindex() {
    this.getOrderedNotes().forEach((note, index) => {
      note.number = index + 1;
      this.notesByKey.set(note.key, note);
    });
  }
};

// src/context/EndnotesEngine.tsx
import { jsx } from "react/jsx-runtime";
var ACTIVE_HIGHLIGHT_MS = 1700;
var REDUCED_MOTION_HIGHLIGHT_MS = 700;
var EndnotesContext = createContext(null);
function getReducedMotionPreference() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function toCssVariables(theme) {
  if (!theme) {
    return {};
  }
  const style = {};
  if (theme.fontFamily) style["--endnotes-font-family"] = theme.fontFamily;
  if (theme.foreground) style["--endnotes-foreground"] = theme.foreground;
  if (theme.muted) style["--endnotes-muted"] = theme.muted;
  if (theme.background) style["--endnotes-background"] = theme.background;
  if (theme.border) style["--endnotes-border"] = theme.border;
  if (theme.accent) style["--endnotes-accent"] = theme.accent;
  if (theme.radius) style["--endnotes-radius"] = theme.radius;
  if (theme.shadow) style["--endnotes-shadow"] = theme.shadow;
  return style;
}
function EndnotesEngine({
  children,
  adapt = false,
  theme,
  variant = "default"
}) {
  const registryRef = useRef(new EndnotesRegistry());
  const [revision, setRevision] = useState(0);
  const [activeNoteKey, setActiveNoteKey] = useState(void 0);
  const [activeMarkerInstanceId, setActiveMarkerInstanceId] = useState(void 0);
  const highlightTimeoutRef = useRef(void 0);
  const markerHighlightTimeoutRef = useRef(void 0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const registerSource2 = useCallback((source, instanceId) => {
    const note = registryRef.current.register({ source, instanceId });
    refresh();
    return { sourceKey: note.key, number: note.number };
  }, [refresh]);
  const unregisterSourceInstance2 = useCallback((instanceId) => {
    registryRef.current.unregisterInstance(instanceId);
    refresh();
  }, [refresh]);
  const markerIdFor2 = useCallback((instanceId) => `endnote-marker-${instanceId}`, []);
  const noteIdFor2 = useCallback((sourceKey) => `endnote-note-${encodeURIComponent(sourceKey)}`, []);
  const clearHighlight = useCallback(() => {
    if (highlightTimeoutRef.current !== void 0) {
      window.clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = void 0;
    }
  }, []);
  const clearMarkerHighlight = useCallback(() => {
    if (markerHighlightTimeoutRef.current !== void 0) {
      window.clearTimeout(markerHighlightTimeoutRef.current);
      markerHighlightTimeoutRef.current = void 0;
    }
  }, []);
  const scrollToNote2 = useCallback((sourceKey) => {
    if (typeof document === "undefined") {
      return;
    }
    const target = document.getElementById(noteIdFor2(sourceKey));
    if (!target) {
      warnOnce(`Could not find note target for "${sourceKey}". Ensure <Endnotes /> is rendered.`);
      return;
    }
    const reducedMotion2 = getReducedMotionPreference();
    target.scrollIntoView({ behavior: reducedMotion2 ? "auto" : "smooth", block: "start" });
    target.focus();
    setActiveNoteKey(sourceKey);
    clearHighlight();
    highlightTimeoutRef.current = window.setTimeout(() => {
      setActiveNoteKey(void 0);
    }, reducedMotion2 ? REDUCED_MOTION_HIGHLIGHT_MS : ACTIVE_HIGHLIGHT_MS);
  }, [clearHighlight, noteIdFor2]);
  const scrollToMarker2 = useCallback((instanceId) => {
    if (typeof document === "undefined") {
      return;
    }
    const marker = document.getElementById(markerIdFor2(instanceId));
    if (!marker) {
      return;
    }
    const reducedMotion2 = getReducedMotionPreference();
    marker.scrollIntoView({ behavior: reducedMotion2 ? "auto" : "smooth", block: "nearest", inline: "nearest" });
    marker.focus();
    setActiveMarkerInstanceId(instanceId);
    clearMarkerHighlight();
    markerHighlightTimeoutRef.current = window.setTimeout(() => {
      setActiveMarkerInstanceId(void 0);
    }, reducedMotion2 ? REDUCED_MOTION_HIGHLIGHT_MS : ACTIVE_HIGHLIGHT_MS);
  }, [clearMarkerHighlight, markerIdFor2]);
  useEffect(() => () => {
    clearHighlight();
    clearMarkerHighlight();
  }, [clearHighlight, clearMarkerHighlight]);
  const notes = useMemo(() => registryRef.current.snapshot().notes, [revision]);
  const contextValue = useMemo(
    () => ({
      adapt,
      theme,
      variant,
      notes,
      activeNoteKey,
      activeMarkerInstanceId,
      registerSource: registerSource2,
      unregisterSourceInstance: unregisterSourceInstance2,
      markerIdFor: markerIdFor2,
      noteIdFor: noteIdFor2,
      scrollToNote: scrollToNote2,
      scrollToMarker: scrollToMarker2
    }),
    [
      activeNoteKey,
      activeMarkerInstanceId,
      adapt,
      markerIdFor2,
      noteIdFor2,
      notes,
      registerSource2,
      scrollToMarker2,
      scrollToNote2,
      theme,
      unregisterSourceInstance2,
      variant
    ]
  );
  const className = adapt ? "endnotes-root endnotes-root--adapt" : "endnotes-root";
  const cssVars = toCssVariables(theme);
  return /* @__PURE__ */ jsx(EndnotesContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx("div", { className, style: cssVars, "data-endnotes-variant": variant, children }) });
}
function useEndnotesContextOptional() {
  return useContext(EndnotesContext);
}

// src/context/implicitStore.ts
import { useMemo as useMemo2, useSyncExternalStore } from "react";
var registry = new EndnotesRegistry();
var subscribers = /* @__PURE__ */ new Set();
var implicitState = {
  revision: 0,
  notes: []
};
var clearHighlightHandle;
var clearMarkerHighlightHandle;
var ACTIVE_HIGHLIGHT_MS2 = 1700;
var REDUCED_MOTION_HIGHLIGHT_MS2 = 700;
function emitChange() {
  implicitState = {
    ...implicitState,
    revision: implicitState.revision + 1,
    notes: registry.snapshot().notes
  };
  subscribers.forEach((callback) => callback());
}
function subscribe(callback) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}
function markerIdFor(instanceId) {
  return `endnote-marker-${instanceId}`;
}
function noteIdFor(sourceKey) {
  return `endnote-note-${encodeURIComponent(sourceKey)}`;
}
function reducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function setActive(sourceKey) {
  implicitState = {
    ...implicitState,
    activeNoteKey: sourceKey
  };
  emitChange();
}
function scrollToNote(sourceKey) {
  if (typeof document === "undefined") {
    return;
  }
  const target = document.getElementById(noteIdFor(sourceKey));
  if (!target) {
    warnOnce(`Could not find note target for "${sourceKey}". Ensure <Endnotes /> is rendered.`);
    return;
  }
  const motionReduced = reducedMotion();
  target.scrollIntoView({ behavior: motionReduced ? "auto" : "smooth", block: "start" });
  target.focus();
  setActive(sourceKey);
  if (clearHighlightHandle !== void 0) {
    window.clearTimeout(clearHighlightHandle);
  }
  clearHighlightHandle = window.setTimeout(
    () => setActive(void 0),
    motionReduced ? REDUCED_MOTION_HIGHLIGHT_MS2 : ACTIVE_HIGHLIGHT_MS2
  );
}
function scrollToMarker(instanceId) {
  if (typeof document === "undefined") {
    return;
  }
  const marker = document.getElementById(markerIdFor(instanceId));
  if (!marker) {
    return;
  }
  const motionReduced = reducedMotion();
  marker.scrollIntoView({ behavior: motionReduced ? "auto" : "smooth", block: "nearest", inline: "nearest" });
  marker.focus();
  implicitState = {
    ...implicitState,
    activeMarkerInstanceId: instanceId
  };
  emitChange();
  if (clearMarkerHighlightHandle !== void 0) {
    window.clearTimeout(clearMarkerHighlightHandle);
  }
  clearMarkerHighlightHandle = window.setTimeout(() => {
    implicitState = {
      ...implicitState,
      activeMarkerInstanceId: void 0
    };
    emitChange();
  }, motionReduced ? REDUCED_MOTION_HIGHLIGHT_MS2 : ACTIVE_HIGHLIGHT_MS2);
}
function snapshotState() {
  return implicitState;
}
function registerSource(source, instanceId) {
  const note = registry.register({ source, instanceId });
  emitChange();
  return { sourceKey: note.key, number: note.number };
}
function unregisterSourceInstance(instanceId) {
  registry.unregisterInstance(instanceId);
  emitChange();
}
function useImplicitEndnotesContext() {
  const state = useSyncExternalStore(subscribe, snapshotState, snapshotState);
  return useMemo2(
    () => ({
      adapt: true,
      theme: void 0,
      variant: "default",
      notes: state.notes,
      activeNoteKey: state.activeNoteKey,
      activeMarkerInstanceId: state.activeMarkerInstanceId,
      registerSource,
      unregisterSourceInstance,
      markerIdFor,
      noteIdFor,
      scrollToNote,
      scrollToMarker
    }),
    [state.activeMarkerInstanceId, state.activeNoteKey, state.notes]
  );
}

// src/components/EndnotesProvider.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function EndnotesProvider({
  children,
  adapt = false,
  theme,
  variant = "default",
  marker,
  behavior
}) {
  void marker;
  void behavior;
  return /* @__PURE__ */ jsx2(EndnotesEngine, { adapt, theme, variant, children });
}
function useEndnotes() {
  const explicitContext = useEndnotesContextOptional();
  const implicitContext = useImplicitEndnotesContext();
  const context = explicitContext ?? implicitContext;
  return {
    notes: context.notes,
    scrollToNote: context.scrollToNote,
    scrollToMarker: context.scrollToMarker
  };
}

// src/components/Note.tsx
import {
  useEffect as useEffect2,
  useId,
  useMemo as useMemo3,
  useRef as useRef2,
  useState as useState2
} from "react";
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
function joinClassNames(...classNames2) {
  return classNames2.filter(Boolean).join(" ");
}
function formatMarkerLabel(number, title) {
  return title ? `View reference ${number}: ${title}` : `View reference ${number}`;
}
function isSafePreviewHref(href) {
  const lower = href.trim().toLowerCase();
  return !lower.startsWith("javascript:") && !lower.startsWith("data:");
}
function normalizeTitle(title, children) {
  if (title) {
    return title;
  }
  if (typeof children === "string") {
    const trimmed = children.trim();
    return trimmed.length > 0 ? trimmed : void 0;
  }
  return void 0;
}
var PREVIEW_EXIT_MS = 170;
function Note({
  children,
  title,
  className,
  ...source
}) {
  const explicitContext = useEndnotesContextOptional();
  const implicitContext = useImplicitEndnotesContext();
  const context = explicitContext ?? implicitContext;
  const reactId = useId();
  const [registration, setRegistration] = useState2(null);
  const [isPreviewMounted, setIsPreviewMounted] = useState2(false);
  const [previewPhase, setPreviewPhase] = useState2("exiting");
  const [touchPreviewMode, setTouchPreviewMode] = useState2(false);
  const markerRootRef = useRef2(null);
  const previewEnterRafRef = useRef2(null);
  const previewCloseTimerRef = useRef2(null);
  const { registerSource: registerSource2, unregisterSourceInstance: unregisterSourceInstance2, markerIdFor: markerIdFor2, scrollToNote: scrollToNote2 } = context;
  const instanceId = useMemo3(() => reactId.replace(/:/g, ""), [reactId]);
  const resolvedTitle = normalizeTitle(title, children);
  const clearPreviewTimers = () => {
    if (previewEnterRafRef.current !== null) {
      window.cancelAnimationFrame(previewEnterRafRef.current);
      previewEnterRafRef.current = null;
    }
    if (previewCloseTimerRef.current !== null) {
      window.clearTimeout(previewCloseTimerRef.current);
      previewCloseTimerRef.current = null;
    }
  };
  const openPreview = () => {
    clearPreviewTimers();
    if (!isPreviewMounted) {
      setIsPreviewMounted(true);
      setPreviewPhase("entering");
      previewEnterRafRef.current = window.requestAnimationFrame(() => {
        setPreviewPhase("open");
        previewEnterRafRef.current = null;
      });
      return;
    }
    setPreviewPhase("open");
  };
  const closePreview = () => {
    clearPreviewTimers();
    if (!isPreviewMounted) {
      return;
    }
    setPreviewPhase("exiting");
    previewCloseTimerRef.current = window.setTimeout(() => {
      setIsPreviewMounted(false);
      previewCloseTimerRef.current = null;
    }, PREVIEW_EXIT_MS);
  };
  useEffect2(() => {
    if (!source.id && !source.href && !resolvedTitle && !source.source) {
      warnOnce("Note received minimal metadata. Provide at least id, href, title, or source.");
    }
    const result = registerSource2(
      {
        ...source,
        title: resolvedTitle
      },
      instanceId
    );
    setRegistration(result);
    return () => {
      unregisterSourceInstance2(instanceId);
    };
  }, [
    instanceId,
    registerSource2,
    resolvedTitle,
    source.accessed,
    source.author,
    source.date,
    source.description,
    source.href,
    source.id,
    source.quote,
    source.kind,
    source.source,
    source.supports,
    source.type,
    unregisterSourceInstance2
  ]);
  useEffect2(() => {
    const root = markerRootRef.current;
    if (!root) {
      return;
    }
    const onFocusOut = (event) => {
      if (touchPreviewMode) {
        return;
      }
      const next = event.relatedTarget;
      if (next && root.contains(next)) {
        return;
      }
      closePreview();
    };
    root.addEventListener("focusout", onFocusOut);
    return () => {
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [touchPreviewMode, registration?.sourceKey ?? null, isPreviewMounted]);
  useEffect2(() => {
    return () => {
      clearPreviewTimers();
    };
  }, []);
  if (!registration) {
    return /* @__PURE__ */ jsx3(
      "span",
      {
        ref: markerRootRef,
        className: joinClassNames(
          explicitContext ? void 0 : "endnotes-root endnotes-root--implicit",
          "endnotes-marker-wrap"
        ),
        children: /* @__PURE__ */ jsx3("sup", { className: joinClassNames("endnotes-marker", className), children: /* @__PURE__ */ jsx3("span", { className: "endnotes-marker-link endnotes-marker-link--pending", "aria-label": "Loading reference", children: "?" }) })
      }
    );
  }
  const markerId = markerIdFor2(instanceId);
  const previewId = `endnote-preview-${instanceId}`;
  const { number, sourceKey } = registration;
  const registeredSource = context.notes.find((note) => note.key === sourceKey)?.source;
  const previewTitle = registeredSource?.title ?? resolvedTitle ?? "Untitled source";
  const previewMeta = [registeredSource?.source, registeredSource?.author, registeredSource?.date].filter((value) => Boolean(value)).join(" \xB7 ");
  const noteAnchorId = context.noteIdFor(sourceKey);
  const handleMarkerClick = (event) => {
    if (touchPreviewMode) {
      event.preventDefault();
      if (isPreviewMounted && previewPhase !== "exiting") {
        closePreview();
      } else {
        openPreview();
      }
      return;
    }
    event.preventDefault();
    scrollToNote2(sourceKey);
  };
  const previewRegionLabel = `Reference preview: ${previewTitle}`;
  return /* @__PURE__ */ jsxs(
    "span",
    {
      ref: markerRootRef,
      className: joinClassNames(
        explicitContext ? void 0 : "endnotes-root endnotes-root--implicit",
        "endnotes-marker-wrap"
      ),
      onMouseEnter: () => {
        if (!touchPreviewMode) {
          openPreview();
        }
      },
      onMouseLeave: () => {
        if (!touchPreviewMode) {
          closePreview();
        }
      },
      children: [
        /* @__PURE__ */ jsx3("sup", { className: joinClassNames("endnotes-marker", className), children: /* @__PURE__ */ jsx3(
          "a",
          {
            id: markerId,
            href: `#${noteAnchorId}`,
            className: joinClassNames(
              "endnotes-marker-link",
              context.activeMarkerInstanceId === instanceId ? "is-active" : void 0
            ),
            "aria-label": formatMarkerLabel(number, resolvedTitle),
            "aria-describedby": isPreviewMounted && previewPhase !== "exiting" ? previewId : void 0,
            onPointerDown: (event) => {
              if (event.pointerType === "touch") {
                setTouchPreviewMode(true);
              }
            },
            onTouchStart: () => {
              setTouchPreviewMode(true);
            },
            onClick: handleMarkerClick,
            onFocus: () => {
              if (!touchPreviewMode) {
                openPreview();
              }
            },
            children: number
          }
        ) }),
        isPreviewMounted ? /* @__PURE__ */ jsxs(
          "span",
          {
            id: previewId,
            role: previewPhase === "exiting" ? void 0 : "region",
            "aria-label": previewPhase === "exiting" ? void 0 : previewRegionLabel,
            "aria-hidden": previewPhase === "exiting" ? "true" : void 0,
            className: joinClassNames(
              "endnotes-preview-card",
              previewPhase === "entering" ? "is-entering" : void 0,
              previewPhase === "open" ? "is-open" : void 0,
              previewPhase === "exiting" ? "is-exiting" : void 0
            ),
            children: [
              /* @__PURE__ */ jsx3("span", { className: "endnotes-preview-title", children: previewTitle }),
              previewMeta ? /* @__PURE__ */ jsx3("span", { className: "endnotes-preview-meta", children: previewMeta }) : null,
              registeredSource?.quote ? /* @__PURE__ */ jsxs("span", { className: "endnotes-preview-quote", children: [
                '"',
                registeredSource.quote,
                '"'
              ] }) : null,
              registeredSource?.href ? isSafePreviewHref(registeredSource.href) ? /^https?:\/\//i.test(registeredSource.href) ? /* @__PURE__ */ jsx3(
                "a",
                {
                  className: "endnotes-preview-href",
                  href: registeredSource.href,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  children: registeredSource.href
                }
              ) : /* @__PURE__ */ jsx3("a", { className: "endnotes-preview-href", href: registeredSource.href, children: registeredSource.href }) : /* @__PURE__ */ jsx3("span", { className: "endnotes-preview-href", children: registeredSource.href }) : null
            ]
          }
        ) : null
      ]
    }
  );
}

// src/components/Endnote.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
function Endnote(props) {
  return /* @__PURE__ */ jsx4(Note, { ...props });
}

// src/components/Endnotes.tsx
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
var SAFE_HREF_PROTOCOLS = /* @__PURE__ */ new Set(["http:", "https:", "mailto:", "tel:"]);
function joinClassNames2(...classNames2) {
  return classNames2.filter(Boolean).join(" ");
}
function sanitizeHref(rawHref) {
  if (!rawHref) {
    return void 0;
  }
  const trimmedHref = rawHref.trim();
  if (!trimmedHref) {
    return void 0;
  }
  if (trimmedHref.startsWith("/")) {
    return trimmedHref;
  }
  try {
    const parsedUrl = new URL(trimmedHref, "https://endnotes.local");
    if (!SAFE_HREF_PROTOCOLS.has(parsedUrl.protocol)) {
      return void 0;
    }
    return trimmedHref;
  } catch {
    return void 0;
  }
}
function metadata(note) {
  const parts = [note.source.author, note.source.date, note.source.accessed].filter(Boolean);
  return parts.join(" \u2022 ");
}
function supportingSentence(note) {
  const kind = inferEndnoteKind(note.source);
  if (kind === "citation") {
    return note.source.source ?? metadata(note) ?? note.source.description ?? note.source.supports ?? note.source.quote ?? null;
  }
  return note.source.description ?? note.source.supports ?? note.source.quote ?? metadata(note) ?? null;
}
function Endnotes({ title, heading, className }) {
  const explicitContext = useEndnotesContextOptional();
  const implicitContext = useImplicitEndnotesContext();
  const context = explicitContext ?? implicitContext;
  const resolvedHeading = (title ?? heading ?? "Endnotes").trim() || "Endnotes";
  if (context.notes.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxs2(
    "section",
    {
      className: joinClassNames2(
        explicitContext ? void 0 : "endnotes-root endnotes-root--implicit",
        "endnotes-section",
        className
      ),
      "aria-label": resolvedHeading,
      children: [
        /* @__PURE__ */ jsxs2("div", { className: "endnotes-sectionHeader", children: [
          /* @__PURE__ */ jsx5("h2", { className: "endnotes-sectionHeader-name", children: resolvedHeading }),
          /* @__PURE__ */ jsx5("div", { className: "endnotes-sectionHeader-divider", "aria-hidden": "true" })
        ] }),
        /* @__PURE__ */ jsx5("ol", { className: "endnotes-list", children: context.notes.map((note) => {
          const kind = inferEndnoteKind(note.source);
          const sanitizedHref = sanitizeHref(note.source.href);
          const titleText = note.source.title ?? note.source.href ?? (kind === "note" ? "Note" : "Untitled source");
          const sentence = supportingSentence(note);
          return /* @__PURE__ */ jsx5(
            "li",
            {
              id: context.noteIdFor(note.key),
              value: note.number,
              tabIndex: -1,
              className: joinClassNames2(
                "endnotes-item",
                `endnotes-item--${kind}`,
                context.activeNoteKey === note.key ? "is-active" : void 0
              ),
              "data-endnote-kind": kind,
              children: /* @__PURE__ */ jsxs2("p", { className: "endnotes-footnote-p", children: [
                sanitizedHref ? /* @__PURE__ */ jsx5(
                  "a",
                  {
                    className: "endnotes-title endnotes-title-link",
                    href: sanitizedHref,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    children: titleText
                  }
                ) : /* @__PURE__ */ jsx5("span", { className: "endnotes-title", children: titleText }),
                sentence ? /* @__PURE__ */ jsxs2("span", { className: "endnotes-sentence", children: [
                  " ",
                  sentence
                ] }) : null,
                " ",
                /* @__PURE__ */ jsxs2("span", { className: "endnotes-links", children: [
                  note.instances.length > 1 ? /* @__PURE__ */ jsx5("span", { className: "endnotes-backlink-prefix", "aria-hidden": "true", children: "\u21A9" }) : null,
                  note.instances.map((instance, index) => /* @__PURE__ */ jsx5(
                    "a",
                    {
                      href: `#${context.markerIdFor(instance.instanceId)}`,
                      className: joinClassNames2(
                        "endnotes-backref",
                        note.instances.length > 1 ? "endnotes-backlink--index" : void 0
                      ),
                      onClick: (event) => {
                        event.preventDefault();
                        context.scrollToMarker(instance.instanceId);
                      },
                      "aria-label": `Return to citation ${note.number}${note.instances.length > 1 ? ` (${index + 1})` : ""}`,
                      children: note.instances.length > 1 ? index + 1 : "\u21A9\uFE0E"
                    },
                    instance.instanceId
                  ))
                ] })
              ] })
            },
            note.key
          );
        }) })
      ]
    }
  );
}

// src/components/Toaster.tsx
import { useEffect as useEffect4, useMemo as useMemo4, useRef as useRef3 } from "react";

// src/toaster/store.ts
import { useEffect as useEffect3, useState as useState3 } from "react";
var REMOVE_DELAY_MS = 180;
var DEFAULT_DURATION_MS = 4e3;
var MAX_TOASTS_FALLBACK = 3;
var LOADING_DURATION_MS = 24 * 60 * 60 * 1e3;
var runtime = globalThis.__endnotesToastRuntime ?? {
  subscribers: /* @__PURE__ */ new Set(),
  state: {
    toasts: [],
    defaults: {
      position: "bottom-right",
      maxVisible: MAX_TOASTS_FALLBACK,
      closeButton: false,
      richColors: true,
      offset: "16px",
      gap: "10px",
      duration: DEFAULT_DURATION_MS
    }
  },
  idCounter: 0
};
globalThis.__endnotesToastRuntime = runtime;
function emit() {
  runtime.subscribers.forEach((subscriber) => subscriber());
}
function subscribe2(subscriber) {
  runtime.subscribers.add(subscriber);
  return () => {
    runtime.subscribers.delete(subscriber);
  };
}
function snapshot() {
  return runtime.state;
}
function isToastObject(content) {
  return typeof content === "object" && content !== null && ("title" in content || "description" in content);
}
function normalizeContent(content) {
  if (isToastObject(content)) {
    return {
      title: content.title,
      description: content.description
    };
  }
  return {
    title: content
  };
}
function normalizeId(id) {
  if (id !== void 0) {
    return String(id);
  }
  runtime.idCounter += 1;
  return `endnotes-toast-${runtime.idCounter}`;
}
function scheduleRemoval(id) {
  window.setTimeout(() => {
    runtime.state = {
      ...runtime.state,
      toasts: runtime.state.toasts.filter((toast) => toast.id !== id)
    };
    emit();
  }, REMOVE_DELAY_MS);
}
function upsertToast(content, options = {}) {
  const id = normalizeId(options.id);
  const normalized = normalizeContent(content);
  const existing = runtime.state.toasts.find((toast2) => toast2.id === id);
  const nextDuration = options.duration ?? existing?.duration ?? runtime.state.defaults.duration ?? DEFAULT_DURATION_MS;
  const nextType = options.type ?? existing?.type ?? "default";
  if (existing) {
    runtime.state = {
      ...runtime.state,
      toasts: runtime.state.toasts.map(
        (toast2) => toast2.id === id ? {
          ...toast2,
          ...normalized,
          duration: nextDuration,
          type: nextType,
          dismissible: options.dismissible ?? toast2.dismissible,
          action: options.action ?? toast2.action,
          cancel: options.cancel ?? toast2.cancel,
          visible: true
        } : toast2
      )
    };
    emit();
    return id;
  }
  const toast = {
    id,
    createdAt: Date.now(),
    duration: nextDuration,
    type: nextType,
    dismissible: options.dismissible ?? true,
    visible: true,
    action: options.action,
    cancel: options.cancel,
    ...normalized
  };
  runtime.state = {
    ...runtime.state,
    toasts: [toast, ...runtime.state.toasts]
  };
  emit();
  return id;
}
function dismissToast(id) {
  if (id === void 0) {
    const visibleToasts = runtime.state.toasts.filter((toast) => toast.visible);
    if (visibleToasts.length === 0) {
      return;
    }
    runtime.state = {
      ...runtime.state,
      toasts: runtime.state.toasts.map((toast) => ({ ...toast, visible: false }))
    };
    emit();
    visibleToasts.forEach((toast) => scheduleRemoval(toast.id));
    return;
  }
  const normalized = String(id);
  const target = runtime.state.toasts.find((toast) => toast.id === normalized);
  if (!target || !target.visible) {
    return;
  }
  runtime.state = {
    ...runtime.state,
    toasts: runtime.state.toasts.map((toast) => toast.id === normalized ? { ...toast, visible: false } : toast)
  };
  emit();
  scheduleRemoval(normalized);
}
function updateToast(id, content, options = {}) {
  return upsertToast(content, { ...options, id });
}
function configureDefaults(props) {
  runtime.state = {
    ...runtime.state,
    defaults: {
      ...runtime.state.defaults,
      ...props
    }
  };
  emit();
}
function limitToasts(toasts) {
  const maxVisible = runtime.state.defaults.maxVisible ?? MAX_TOASTS_FALLBACK;
  return toasts.slice(0, maxVisible);
}
function promiseToast(promise, messages, options = {}) {
  const id = upsertToast(messages.loading, { ...options, type: "loading", duration: LOADING_DURATION_MS });
  return promise.then((value) => {
    const next = typeof messages.success === "function" ? messages.success(value) : messages.success;
    upsertToast(next, { ...options, id, type: "success", duration: options.duration ?? runtime.state.defaults.duration });
    return value;
  }).catch((error) => {
    const next = typeof messages.error === "function" ? messages.error(error) : messages.error;
    upsertToast(next, { ...options, id, type: "error", duration: options.duration ?? runtime.state.defaults.duration });
    throw error;
  });
}
function typedToast(type, content, options = {}) {
  return upsertToast(content, { ...options, type });
}
var toaster = Object.assign(
  (content, options) => upsertToast(content, options),
  {
    success: (content, options) => typedToast("success", content, options),
    info: (content, options) => typedToast("info", content, options),
    warning: (content, options) => typedToast("warning", content, options),
    error: (content, options) => typedToast("error", content, options),
    loading: (content, options) => typedToast("loading", content, options),
    dismiss: dismissToast,
    update: updateToast,
    promise: promiseToast
  }
);
function useToastStore() {
  const [snapshotState2, setSnapshotState] = useState3(snapshot());
  useEffect3(() => {
    const unsubscribe = subscribe2(() => setSnapshotState(snapshot()));
    setSnapshotState(snapshot());
    return unsubscribe;
  }, []);
  return {
    toasts: limitToasts(snapshotState2.toasts),
    defaults: snapshotState2.defaults
  };
}
function setToasterDefaults(props) {
  configureDefaults(props);
}

// src/components/Toaster.tsx
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
var SWIPE_DISMISS_THRESHOLD = 72;
function classNames(...values) {
  return values.filter(Boolean).join(" ");
}
function isReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function ToastItem({ toast, closeButton }) {
  const timeoutRef = useRef3(null);
  const startedAtRef = useRef3(Date.now());
  const remainingRef = useRef3(toast.duration);
  const pointerStartRef = useRef3(null);
  useEffect4(() => {
    if (!toast.visible || !Number.isFinite(toast.duration) || toast.duration <= 0) {
      return;
    }
    const runTimer = () => {
      startedAtRef.current = Date.now();
      timeoutRef.current = window.setTimeout(() => {
        toaster.dismiss(toast.id);
      }, remainingRef.current);
    };
    runTimer();
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [toast.duration, toast.id, toast.visible]);
  const pauseTimer = () => {
    if (timeoutRef.current === null || !Number.isFinite(toast.duration)) {
      return;
    }
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(150, remainingRef.current - elapsed);
  };
  const resumeTimer = () => {
    if (timeoutRef.current !== null || !Number.isFinite(toast.duration) || !toast.visible) {
      return;
    }
    startedAtRef.current = Date.now();
    timeoutRef.current = window.setTimeout(() => {
      toaster.dismiss(toast.id);
    }, remainingRef.current);
  };
  const swipeEnabled = toast.dismissible;
  const onPointerDown = (event) => {
    if (!swipeEnabled || event.pointerType === "mouse") {
      return;
    }
    pointerStartRef.current = event.clientX;
  };
  const onPointerUp = (event) => {
    if (!swipeEnabled || pointerStartRef.current === null) {
      return;
    }
    const delta = event.clientX - pointerStartRef.current;
    pointerStartRef.current = null;
    if (Math.abs(delta) >= SWIPE_DISMISS_THRESHOLD) {
      toaster.dismiss(toast.id);
    }
  };
  return /* @__PURE__ */ jsxs3(
    "li",
    {
      className: classNames("endnotes-toast", `endnotes-toast--${toast.type}`, !toast.visible && "is-hidden"),
      onMouseEnter: pauseTimer,
      onMouseLeave: resumeTimer,
      onFocus: pauseTimer,
      onBlur: resumeTimer,
      onPointerDown,
      onPointerUp,
      children: [
        /* @__PURE__ */ jsxs3("div", { className: "endnotes-toast-content", children: [
          toast.title ? /* @__PURE__ */ jsx6("div", { className: "endnotes-toast-title", children: toast.title }) : null,
          toast.description ? /* @__PURE__ */ jsx6("div", { className: "endnotes-toast-description", children: toast.description }) : null
        ] }),
        (toast.action || toast.cancel) && /* @__PURE__ */ jsxs3("div", { className: "endnotes-toast-actions", children: [
          toast.cancel ? /* @__PURE__ */ jsx6(
            "button",
            {
              className: "endnotes-toast-button endnotes-toast-button--cancel",
              type: "button",
              onClick: () => {
                toast.cancel?.onClick();
                toaster.dismiss(toast.id);
              },
              children: toast.cancel.label
            }
          ) : null,
          toast.action ? /* @__PURE__ */ jsx6(
            "button",
            {
              className: "endnotes-toast-button",
              type: "button",
              onClick: () => {
                toast.action?.onClick();
                toaster.dismiss(toast.id);
              },
              children: toast.action.label
            }
          ) : null
        ] }),
        (closeButton || toast.dismissible) && /* @__PURE__ */ jsx6("button", { className: "endnotes-toast-close", type: "button", "aria-label": "Dismiss notification", onClick: () => toaster.dismiss(toast.id), children: "\xD7" })
      ]
    }
  );
}
function positionClass(position) {
  return `endnotes-toaster--${position}`;
}
function Toaster({
  position = "bottom-right",
  maxVisible = 3,
  closeButton = false,
  richColors = true,
  offset = "16px",
  gap = "10px",
  duration = 4e3
}) {
  const reduceMotion = useMemo4(() => isReducedMotion(), []);
  useEffect4(() => {
    setToasterDefaults({ position, maxVisible, closeButton, richColors, offset, gap, duration });
  }, [closeButton, duration, gap, maxVisible, offset, position, richColors]);
  const { toasts, defaults } = useToastStore();
  const currentPosition = defaults.position ?? position;
  return /* @__PURE__ */ jsx6(
    "section",
    {
      className: classNames(
        "endnotes-toaster",
        positionClass(currentPosition),
        defaults.richColors ? "endnotes-toaster--rich" : "endnotes-toaster--neutral",
        reduceMotion && "endnotes-toaster--reduce-motion"
      ),
      style: {
        "--endnotes-toast-offset": defaults.offset ?? offset,
        "--endnotes-toast-gap": defaults.gap ?? gap
      },
      "aria-live": "polite",
      "aria-atomic": "false",
      children: /* @__PURE__ */ jsx6("ol", { className: "endnotes-toast-list", role: "status", children: toasts.map((toast) => /* @__PURE__ */ jsx6(ToastItem, { toast, closeButton: Boolean(defaults.closeButton) }, toast.id)) })
    }
  );
}

// src/api/client.ts
var EndnotesApiError = class extends Error {
  constructor(message, details) {
    super(message);
    this.name = "EndnotesApiError";
    this.code = details.code;
    this.status = details.status;
    this.retryable = details.retryable;
  }
};
var EndnotesClient = class {
  constructor(options) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://api.endnotes.ai/v1";
    this.timeoutMs = options.timeoutMs ?? 1e4;
    this.appName = options.appName;
    this.appVersion = options.appVersion;
    this.onMetric = options.onMetric;
    this.onTrace = options.onTrace;
    this.onSourceAttribution = options.onSourceAttribution;
  }
  buildReplayRequest(request) {
    return {
      method: "POST",
      url: `${this.baseUrl}/endnotes:generate`,
      headers: {
        "content-type": "application/json",
        authorization: "Bearer <ENDNOTES_API_KEY>",
        "x-endnotes-client": this.clientHeader()
      },
      body: JSON.stringify(request)
    };
  }
  async generate(request) {
    const traceId = this.traceId();
    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    this.onTrace?.({
      phase: "request_started",
      traceId,
      route: "/v1/endnotes:generate"
    });
    try {
      const response = await fetch(`${this.baseUrl}/endnotes:generate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
          "x-endnotes-client": this.clientHeader()
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });
      if (!response.ok) {
        const payload2 = await response.json().catch(() => null);
        this.onTrace?.({
          phase: "request_failed",
          traceId,
          route: "/v1/endnotes:generate",
          status: response.status,
          durationMs: Date.now() - startedAt,
          errorCode: payload2?.error.code ?? "unknown_error"
        });
        this.onMetric?.({
          name: "endnotes.activation.failure",
          value: 1,
          tags: { code: payload2?.error.code ?? "unknown_error" }
        });
        throw new EndnotesApiError(payload2?.error.message ?? "Endnotes API request failed", {
          code: payload2?.error.code ?? "unknown_error",
          status: response.status,
          retryable: payload2?.error.retryable ?? response.status >= 500
        });
      }
      this.onMetric?.({ name: "endnotes.activation.success", value: 1 });
      const payload = await response.json();
      this.onMetric?.({
        name: payload.reliability.citationsBelowThreshold === 0 ? "endnotes.trust.publishable" : "endnotes.trust.needs_review",
        value: 1
      });
      this.onMetric?.({
        name: "endnotes.trust.citations_below_threshold",
        value: payload.reliability.citationsBelowThreshold
      });
      this.onMetric?.({
        name: "endnotes.trust.stale_citations",
        value: payload.reliability.staleCitationCount
      });
      const sourceById = new Map(payload.sources.map((source) => [source.id, source]));
      this.onTrace?.({
        phase: "request_succeeded",
        traceId,
        route: "/v1/endnotes:generate",
        status: response.status,
        durationMs: Date.now() - startedAt
      });
      this.onSourceAttribution?.({
        requestId: payload.requestId,
        mapping: payload.citations.map((citation) => {
          const source = sourceById.get(citation.sourceId);
          return {
            citationId: citation.citationId,
            sourceId: citation.sourceId,
            sourceUrl: citation.sourceUrl,
            confidence: citation.confidence,
            stale: citation.stale,
            sourceQualityTier: source?.qualityTier,
            staleWarningReason: citation.staleWarning?.reason
          };
        })
      });
      return payload;
    } catch (error) {
      if (error instanceof EndnotesApiError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === "AbortError") {
        this.onTrace?.({
          phase: "request_failed",
          traceId,
          route: "/v1/endnotes:generate",
          status: 408,
          durationMs: Date.now() - startedAt,
          errorCode: "timeout"
        });
        throw new EndnotesApiError("Endnotes API request timed out", {
          code: "timeout",
          status: 408,
          retryable: true
        });
      }
      this.onTrace?.({
        phase: "request_failed",
        traceId,
        route: "/v1/endnotes:generate",
        status: 0,
        durationMs: Date.now() - startedAt,
        errorCode: "network_error"
      });
      throw new EndnotesApiError("Network error while calling Endnotes API", {
        code: "network_error",
        status: 0,
        retryable: true
      });
    } finally {
      this.onMetric?.({
        name: "endnotes.request.latency_ms",
        value: Date.now() - startedAt
      });
      clearTimeout(timeout);
    }
  }
  clientHeader() {
    const version = "endnotes-ts/0.1.0";
    if (!this.appName) {
      return version;
    }
    const appVersion = this.appVersion ? `/${this.appVersion}` : "";
    return `${version} ${this.appName}${appVersion}`;
  }
  traceId() {
    return `trace_${Date.now().toString(36)}`;
  }
};

// src/api/trust.ts
var DEFAULT_POLICY = {
  minAverageConfidence: 0.8,
  minCitationConfidence: 0.7,
  allowLowTierSources: false,
  maxStaleCitations: 0,
  maxCitationsBelowThreshold: 0
};
function evaluateTrustPolicy(response, options = {}) {
  const policy = { ...DEFAULT_POLICY, ...options };
  const reasons = [];
  const lowTierSourceCount = countLowTierSources(response.sources);
  const citationsBelowConfidence = countCitationsBelowConfidence(
    response.citations,
    policy.minCitationConfidence
  );
  if (response.reliability.averageConfidence < policy.minAverageConfidence) {
    reasons.push("average_confidence_below_threshold");
  }
  if (response.reliability.citationsBelowThreshold > policy.maxCitationsBelowThreshold) {
    reasons.push("citations_below_threshold_present");
  }
  if (response.reliability.staleCitationCount > policy.maxStaleCitations) {
    reasons.push("stale_citations_present");
  }
  if (!policy.allowLowTierSources && lowTierSourceCount > 0) {
    reasons.push("low_tier_sources_present");
  }
  if (citationsBelowConfidence > 0) {
    reasons.push("citation_confidence_below_policy");
  }
  return {
    canPublish: reasons.length === 0,
    needsReview: reasons.length > 0,
    reasons,
    summary: {
      averageConfidence: response.reliability.averageConfidence,
      citationsBelowThreshold: response.reliability.citationsBelowThreshold,
      staleCitationCount: response.reliability.staleCitationCount,
      lowTierSourceCount
    }
  };
}
function countLowTierSources(sources) {
  return sources.filter((source) => source.qualityTier === "low").length;
}
function countCitationsBelowConfidence(citations, minCitationConfidence) {
  return citations.filter((citation) => citation.confidence < minCitationConfidence).length;
}

// src/markdown/index.ts
var MARKER_PATTERN = /\[\^endnote\s+([^\]]+)\]/g;
var ATTRIBUTE_PATTERN = /([a-zA-Z_]+)="([^"]*)"/g;
function parseAttributes(raw) {
  const attributes = {};
  let match = ATTRIBUTE_PATTERN.exec(raw);
  while (match) {
    attributes[match[1]] = match[2];
    match = ATTRIBUTE_PATTERN.exec(raw);
  }
  ATTRIBUTE_PATTERN.lastIndex = 0;
  return attributes;
}
function normalizeKind(value) {
  if (value === "citation" || value === "note") {
    return value;
  }
  return "citation";
}
function transformMarkdownEndnotes(input, options = {}) {
  const endnotes = [];
  let nextIndex = 1;
  const markdownBody = input.replace(MARKER_PATTERN, (_token, rawAttributes) => {
    const attrs = parseAttributes(rawAttributes);
    const title = attrs.title?.trim();
    if (!title) {
      return _token;
    }
    const note = {
      index: nextIndex,
      title,
      href: attrs.href?.trim() || void 0,
      kind: normalizeKind(attrs.kind)
    };
    endnotes.push(note);
    nextIndex += 1;
    return `[^${note.index}]`;
  });
  if (endnotes.length === 0) {
    return { markdown: input, endnotes };
  }
  const definitions = endnotes.map((note) => {
    const label = note.href ? `[${note.title}](${note.href})` : note.title;
    const kindSuffix = note.kind === "note" ? " (note)" : "";
    return `[^${note.index}]: ${label}${kindSuffix}`;
  });
  const appendDefinitions = options.appendDefinitions ?? true;
  const markdown = appendDefinitions ? `${markdownBody.trimEnd()}

${definitions.join("\n")}
` : markdownBody;
  return { markdown, endnotes };
}
function createMarkdownEndnotesTransformer(options = {}) {
  return (input) => transformMarkdownEndnotes(input, options).markdown;
}

// src/html/index.ts
var HTML_ENDNOTE_TAG = /<endnote\s+([^>]*)>([\s\S]*?)<\/endnote>/gi;
var ATTRIBUTE_PATTERN2 = /([a-zA-Z_]+)="([^"]*)"/g;
function parseAttributes2(raw) {
  const attributes = {};
  let match = ATTRIBUTE_PATTERN2.exec(raw);
  while (match) {
    attributes[match[1]] = match[2];
    match = ATTRIBUTE_PATTERN2.exec(raw);
  }
  ATTRIBUTE_PATTERN2.lastIndex = 0;
  return attributes;
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function transformHtmlEndnotes(input, options = {}) {
  let markerCounter = 0;
  let markdownProxy = input.replace(HTML_ENDNOTE_TAG, (_full, rawAttributes, content) => {
    markerCounter += 1;
    const attrs = parseAttributes2(rawAttributes);
    const title = (attrs.title ?? content ?? "").trim();
    const href = attrs.href?.trim();
    const kind = attrs.kind === "note" ? "note" : "citation";
    if (!title) {
      return _full;
    }
    const segments = [`title="${title.replace(/"/g, '\\"')}"`];
    if (href) {
      segments.push(`href="${href.replace(/"/g, '\\"')}"`);
    }
    if (kind === "note") {
      segments.push(`kind="note"`);
    }
    return `[^endnote ${segments.join(" ")}]`;
  });
  if (markerCounter === 0) {
    return { html: input, endnotes: [] };
  }
  const transformed = transformMarkdownEndnotes(markdownProxy);
  if (transformed.endnotes.length === 0) {
    return { html: input, endnotes: [] };
  }
  let body = transformed.markdown;
  transformed.endnotes.forEach((note) => {
    body = body.replace(
      `[^${note.index}]`,
      `<sup class="endnotes-marker"><a href="#endnote-${note.index}" id="endnote-ref-${note.index}">${note.index}</a></sup>`
    );
  });
  const listItems = transformed.endnotes.map((note) => {
    const content = note.href ? `<a href="${escapeHtml(note.href)}">${escapeHtml(note.title)}</a>` : escapeHtml(note.title);
    const kind = note.kind === "note" ? "note" : "citation";
    return `<li id="endnote-${note.index}" data-endnote-kind="${kind}">${content} <a href="#endnote-ref-${note.index}" aria-label="Back to reference ${note.index}">\u21A9</a></li>`;
  });
  const includeSection = options.includeSection ?? true;
  const section = `<section class="endnotes-html" aria-label="Endnotes"><ol>${listItems.join("")}</ol></section>
`;
  const html = `${body.replace(/\[\^\d+\]:[^\n]*(\n|$)/g, "").trimEnd()}
${includeSection ? section : ""}`;
  return { html, endnotes: transformed.endnotes };
}
function createHtmlEndnotesTransformer(options = {}) {
  return (input) => transformHtmlEndnotes(input, options).html;
}
export {
  Endnote,
  Endnotes,
  EndnotesApiError,
  EndnotesClient,
  EndnotesProvider,
  Note,
  Toaster,
  createHtmlEndnotesTransformer,
  createMarkdownEndnotesTransformer,
  evaluateTrustPolicy,
  toaster,
  transformHtmlEndnotes,
  transformMarkdownEndnotes,
  useEndnotes
};
//# sourceMappingURL=index.js.map