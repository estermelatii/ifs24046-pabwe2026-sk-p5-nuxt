const apiHelper = (() => {
  function getStorage(): Storage | null {
    try {
      if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
        return (globalThis as any).localStorage as Storage;
      }
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage;
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  async function fetchData(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const urlQuery = url.includes("?") ? url.split("?")[1] : "";
    const urlWithoutQuery = url.replace(`?${urlQuery}`, "");
    const fixUrl = urlWithoutQuery.endsWith("/")
      ? urlWithoutQuery.slice(0, -1)
      : urlWithoutQuery;
    const fullUrl = fixUrl + (urlQuery ? `?${urlQuery}` : "");

    const token = getAccessToken();
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(fullUrl, {
      ...options,
      mode: "cors",
      headers,
    });
  }

  function putAccessToken(token: string | null): void {
    const storage = getStorage();
    if (!storage) return;
    if (!token) {
      storage.removeItem("accessToken");
    } else {
      storage.setItem("accessToken", token);
    }
  }

  function getAccessToken(): string | null {
    const storage = getStorage();
    if (!storage) return null;
    return storage.getItem("accessToken");
  }

  return {
    fetchData,
    putAccessToken,
    getAccessToken,
  };
})();

export default apiHelper;