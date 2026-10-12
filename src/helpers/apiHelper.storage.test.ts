import { describe, it, expect, vi, afterEach } from "vitest";
import apiHelper from "./apiHelper";

const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  if (originalDescriptor) Object.defineProperty(globalThis, "localStorage", originalDescriptor);
  else delete (globalThis as any).localStorage;
  apiHelper.putAccessToken(null);
});

describe("apiHelper storage", () => {
  it("mengembalikan null bila tidak ada storage sama sekali", () => {
    vi.stubGlobal("localStorage", undefined);
    vi.stubGlobal("window", undefined);
    expect(apiHelper.getAccessToken()).toBeNull();
    expect(() => apiHelper.putAccessToken("abc")).not.toThrow();
  });

  it("memakai window.localStorage bila globalThis.localStorage tidak ada", () => {
    const fake = {
      getItem: vi.fn(() => "tok-window"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal("localStorage", undefined);
    vi.stubGlobal("window", { localStorage: fake });

    expect(apiHelper.getAccessToken()).toBe("tok-window");
    apiHelper.putAccessToken("baru");
    expect(fake.setItem).toHaveBeenCalledWith("accessToken", "baru");
    apiHelper.putAccessToken(null);
    expect(fake.removeItem).toHaveBeenCalledWith("accessToken");
  });

  it("mengembalikan null bila mengakses storage melempar error", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new Error("denied");
      },
    });
    expect(apiHelper.getAccessToken()).toBeNull();
  });
});

describe("apiHelper.fetchData", () => {
  function mockFetch() {
    const f = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", f);
    return f;
  }

  it("membuang slash di akhir dan memakai opsi bawaan", async () => {
    const f = mockFetch();
    await apiHelper.fetchData("https://x.test/api/");
    expect(f).toHaveBeenCalledWith("https://x.test/api", { mode: "cors", headers: {} });
  });

  it("mempertahankan query string, method, dan header", async () => {
    const f = mockFetch();
    await apiHelper.fetchData("https://x.test/api/?a=1&b=2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    expect(f).toHaveBeenCalledWith("https://x.test/api?a=1&b=2", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("menambahkan Authorization bila token tersimpan", async () => {
    const f = mockFetch();
    apiHelper.putAccessToken("rahasia");
    await apiHelper.fetchData("https://x.test/a");
    expect(f).toHaveBeenCalledWith("https://x.test/a", {
      mode: "cors",
      headers: { Authorization: "Bearer rahasia" },
    });
  });
});
