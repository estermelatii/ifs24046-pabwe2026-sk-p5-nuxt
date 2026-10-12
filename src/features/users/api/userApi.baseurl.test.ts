import { describe, it, expect, vi, afterEach } from "vitest";

const g = globalThis as any;
const originalGlobal = g.DELCOM_BASEURL;
const originalEnv = process.env.NUXT_PUBLIC_DELCOM_BASEURL;

async function calledUrl() {
  vi.resetModules();
  const apiHelper = (await import("../../../helpers/apiHelper")).default;
  const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => ({ status: "success", data: { users: [] } }),
  } as any);
  const userApi = (await import("./userApi")).default;
  await userApi.getUsers();
  return String(spy.mock.calls[0][0]);
}

describe("userApi base URL", () => {
  afterEach(() => {
    g.DELCOM_BASEURL = originalGlobal;
    if (originalEnv === undefined) delete process.env.NUXT_PUBLIC_DELCOM_BASEURL;
    else process.env.NUXT_PUBLIC_DELCOM_BASEURL = originalEnv;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("memakai DELCOM_BASEURL global", async () => {
    g.DELCOM_BASEURL = "https://global.test/api";
    expect(await calledUrl()).toBe("https://global.test/api/users/");
  });

  it("memakai env bila global tidak ada", async () => {
    g.DELCOM_BASEURL = undefined;
    process.env.NUXT_PUBLIC_DELCOM_BASEURL = "https://env.test/api";
    expect(await calledUrl()).toBe("https://env.test/api/users/");
  });

  it("memakai URL bawaan bila global dan env tidak ada", async () => {
    g.DELCOM_BASEURL = undefined;
    delete process.env.NUXT_PUBLIC_DELCOM_BASEURL;
    expect(await calledUrl()).toBe("https://open-api.delcom.org/api/v1/users/");
  });
});
