import { ReactNode, JSX } from 'react';

type EndnoteSourceType = "article" | "paper" | "book" | "report" | "website" | "dataset" | "internal" | "other";
type EndnoteSource = {
    id?: string;
    href?: string;
    title?: string;
    source?: string;
    author?: string;
    date?: string;
    accessed?: string;
    quote?: string;
    supports?: string;
    description?: string;
    type?: EndnoteSourceType;
};
type EndnoteTheme = {
    fontFamily?: string;
    foreground?: string;
    muted?: string;
    background?: string;
    border?: string;
    accent?: string;
    radius?: string;
    shadow?: string;
};
type EndnotesTheme = EndnoteTheme;
type EndnoteInstance = {
    instanceId: string;
    sourceKey: string;
};
type RegisteredEndnote = {
    key: string;
    number: number;
    source: EndnoteSource;
    instances: EndnoteInstance[];
};
type EndnotesProviderProps = {
    children: ReactNode;
    adapt?: boolean;
    theme?: EndnoteTheme;
    variant?: "default" | "compact";
    marker?: "superscript" | "bracket" | "pill";
    behavior?: "scroll";
};
type NoteProps = EndnoteSource & {
    children?: ReactNode;
    className?: string;
};
type EndnoteProps = NoteProps;
type EndnotesProps = {
    title?: string;
    heading?: string;
    className?: string;
};

declare function EndnotesProvider({ children, adapt, theme, variant, marker, behavior }: EndnotesProviderProps): JSX.Element;
declare function useEndnotes(): {
    notes: RegisteredEndnote[];
    scrollToNote: (sourceKey: string) => void;
    scrollToMarker: (instanceId: string) => void;
};

declare function Note({ children, title, className, ...source }: NoteProps): JSX.Element;

declare function Endnote(props: EndnoteProps): JSX.Element;

declare function Endnotes({ title, heading, className }: EndnotesProps): JSX.Element | null;

type ToastType = "default" | "success" | "info" | "warning" | "error" | "loading";
type ToastPosition = "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center";
type ToastAction = {
    label: string;
    onClick: () => void;
};
type ToastContent = ReactNode | {
    title?: ReactNode;
    description?: ReactNode;
};
type ToastOptions = {
    id?: string | number;
    description?: ReactNode;
    duration?: number;
    dismissible?: boolean;
    action?: ToastAction;
    cancel?: ToastAction;
    type?: ToastType;
};
type ToastRecord = {
    id: string;
    type: ToastType;
    title?: ReactNode;
    description?: ReactNode;
    createdAt: number;
    duration: number;
    dismissible: boolean;
    visible: boolean;
    action?: ToastAction;
    cancel?: ToastAction;
};
type ToasterProps = {
    position?: ToastPosition;
    maxVisible?: number;
    closeButton?: boolean;
    richColors?: boolean;
    offset?: string;
    gap?: string;
    duration?: number;
};

declare function Toaster({ position, maxVisible, closeButton, richColors, offset, gap, duration }: ToasterProps): JSX.Element;

type ToastStoreState = {
    toasts: ToastRecord[];
    defaults: Pick<ToasterProps, "position" | "maxVisible" | "closeButton" | "richColors" | "offset" | "gap" | "duration">;
};
type ToastStoreRuntime = {
    subscribers: Set<() => void>;
    state: ToastStoreState;
    idCounter: number;
};
declare global {
    var __endnotesToastRuntime: ToastStoreRuntime | undefined;
}
declare function dismissToast(id?: string | number): void;
declare function updateToast(id: string | number, content: ToastContent, options?: ToastOptions): string;
declare function promiseToast<T>(promise: Promise<T>, messages: {
    loading: ToastContent;
    success: ToastContent | ((value: T) => ToastContent);
    error: ToastContent | ((error: unknown) => ToastContent);
}, options?: Omit<ToastOptions, "type">): Promise<T>;
declare const toaster: ((content: ToastContent, options?: ToastOptions) => string) & {
    success: (content: ToastContent, options?: ToastOptions) => string;
    info: (content: ToastContent, options?: ToastOptions) => string;
    warning: (content: ToastContent, options?: ToastOptions) => string;
    error: (content: ToastContent, options?: ToastOptions) => string;
    loading: (content: ToastContent, options?: ToastOptions) => string;
    dismiss: typeof dismissToast;
    update: typeof updateToast;
    promise: typeof promiseToast;
};

export { Endnote, Endnotes, type EndnotesProps, EndnotesProvider, type EndnotesTheme, Note, type NoteProps, type ToastOptions, type ToastPosition, type ToastType, Toaster, type ToasterProps, toaster, useEndnotes };
