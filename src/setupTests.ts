import "@testing-library/jest-dom";
import { vi } from "vitest";

if (typeof (globalThis as any).DELCOM_BASEURL === "undefined") {
  (globalThis as any).DELCOM_BASEURL = "https://open-api.delcom.org/api/v1";
}

const memoryStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) =>
    Object.prototype.hasOwnProperty.call(memoryStore, key)
      ? memoryStore[key]
      : null,
  setItem: (key: string, value: string) => {
    memoryStore[key] = String(value);
  },
  removeItem: (key: string) => {
    delete memoryStore[key];
  },
  clear: () => {
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
  },
  key: (index: number) => Object.keys(memoryStore)[index] ?? null,
  get length() {
    return Object.keys(memoryStore).length;
  },
};

// @ts-ignore
globalThis.localStorage = localStorageMock;
if (typeof window !== "undefined") {
  // @ts-ignore
  window.localStorage = localStorageMock;
}

if (typeof document !== "undefined") {
  if (typeof document.elementFromPoint !== "function") {
    document.elementFromPoint = () => null;
  }
  if (!Range.prototype.getClientRects) {
    Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  }
}

if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    window.matchMedia = () =>
      ({
        matches: false,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as any;
  }
  if (!window.getComputedStyle) {
    (window as any).getComputedStyle = () => ({
      getPropertyValue: () => "0",
    });
  }
}

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(async () => ({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false,
    })),
    close: vi.fn(),
    getPopup: vi.fn(() => null),
    isVisible: vi.fn(() => false),
  },
}));