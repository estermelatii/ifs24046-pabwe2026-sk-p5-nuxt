import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import cashFlowApi from "./cashFlowApi";
import apiHelper from "../../../helpers/apiHelper";

const payload: any = { type: "inflow", source: "cash", label: "Gaji", description: "d", nominal: 100 };

function mockFetch(result: any) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => result,
  } as any);
}
const ok = (data?: any, message?: string) => ({ status: "success", data, message });
const fail = (message?: string) => ({ status: "fail", message });
const urlOf = (spy: any) => String(spy.mock.calls[0][0]);
const optsOf = (spy: any) => spy.mock.calls[0][1] as any;

describe("cashFlowApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("base URL", () => {
    const g = globalThis as any;
    const originalGlobal = g.DELCOM_BASEURL;
    const originalEnv = process.env.NUXT_PUBLIC_DELCOM_BASEURL;

    afterEach(() => {
      g.DELCOM_BASEURL = originalGlobal;
      if (originalEnv === undefined) delete process.env.NUXT_PUBLIC_DELCOM_BASEURL;
      else process.env.NUXT_PUBLIC_DELCOM_BASEURL = originalEnv;
    });

    it("memakai DELCOM_BASEURL global bila ada", async () => {
      g.DELCOM_BASEURL = "https://global.test/api";
      const spy = mockFetch(ok({ cashFlows: [] }));
      await cashFlowApi.getCashFlows();
      expect(urlOf(spy)).toBe("https://global.test/api/cash-flows");
    });

    it("memakai env NUXT_PUBLIC_DELCOM_BASEURL bila global tidak ada", async () => {
      g.DELCOM_BASEURL = undefined;
      process.env.NUXT_PUBLIC_DELCOM_BASEURL = "https://env.test/api";
      const spy = mockFetch(ok({ cashFlows: [] }));
      await cashFlowApi.getCashFlows();
      expect(urlOf(spy)).toBe("https://env.test/api/cash-flows");
    });

    it("memakai URL bawaan bila global dan env tidak ada", async () => {
      g.DELCOM_BASEURL = undefined;
      delete process.env.NUXT_PUBLIC_DELCOM_BASEURL;
      const spy = mockFetch(ok({ cashFlows: [] }));
      await cashFlowApi.getCashFlows();
      expect(urlOf(spy)).toBe("https://open-api.delcom.org/api/v1/cash-flows");
    });
  });

  describe("getCashFlows", () => {
    it.each([
      [undefined, ""],
      [null, ""],
      ["", ""],
      [1, "?is_finished=1"],
      [false, "?is_finished=false"],
      [{ type: "inflow", source: "cash" }, "?type=inflow&source=cash"],
      [{}, ""],
    ])("argumen %j menghasilkan query %j", async (arg, query) => {
      const spy = mockFetch(ok({ cashFlows: [] }));
      await cashFlowApi.getCashFlows(arg as any);
      expect(urlOf(spy).endsWith("/cash-flows" + query)).toBe(true);
      expect(optsOf(spy).method).toBe("GET");
    });

    it.each([
      ["cashFlows", { cashFlows: [{ id: 1 }] }, [{ id: 1 }]],
      ["cash_flows", { cash_flows: [{ id: 2 }] }, [{ id: 2 }]],
      ["array langsung", [{ id: 3 }], [{ id: 3 }]],
      ["objek tanpa daftar", {}, []],
      ["tanpa data", undefined, []],
    ])("membaca daftar dari bentuk %s", async (_n, data, expected) => {
      mockFetch(ok(data));
      expect(await cashFlowApi.getCashFlows()).toEqual(expected);
    });
  });

  describe("getCashFlowById dan getTodoById", () => {
    it.each([
      ["cash_flow", { cash_flow: { id: 1 } }, { id: 1 }],
      ["todo", { todo: { id: 2 } }, { id: 2 }],
      ["data langsung", { id: 3 }, { id: 3 }],
    ])("getCashFlowById membaca %s", async (_n, data, expected) => {
      const spy = mockFetch(ok(data));
      expect(await cashFlowApi.getCashFlowById(7)).toEqual(expected);
      expect(urlOf(spy).endsWith("/cash-flows/7")).toBe(true);
    });

    it.each([
      ["todo", { todo: { id: 1 } }, { id: 1 }],
      ["cash_flow", { cash_flow: { id: 2 } }, { id: 2 }],
      ["data langsung", { id: 3 }, { id: 3 }],
    ])("getTodoById membaca %s", async (_n, data, expected) => {
      mockFetch(ok(data));
      expect(await cashFlowApi.getTodoById(7)).toEqual(expected);
    });
  });

  describe("getLabels", () => {
    it("mengembalikan labels", async () => {
      const spy = mockFetch(ok({ labels: ["Gaji"] }));
      expect(await cashFlowApi.getLabels()).toEqual(["Gaji"]);
      expect(urlOf(spy).endsWith("/cash-flows/labels")).toBe(true);
    });

    it("mengembalikan array kosong bila labels tidak ada", async () => {
      mockFetch(ok({}));
      expect(await cashFlowApi.getLabels()).toEqual([]);
    });
  });

  describe("operasi tulis", () => {
    it("postCashFlow mengirim payload dan mengembalikan data", async () => {
      const spy = mockFetch(ok({ id: 1 }));
      expect(await cashFlowApi.postCashFlow(payload)).toEqual({ id: 1 });
      expect(optsOf(spy).method).toBe("POST");
      expect(JSON.parse(optsOf(spy).body)).toEqual(payload);
    });

    it("putCashFlow mengirim payload dan mengembalikan pesan", async () => {
      const spy = mockFetch(ok(undefined, "diubah"));
      expect(await cashFlowApi.putCashFlow(5, payload)).toBe("diubah");
      expect(urlOf(spy).endsWith("/cash-flows/5")).toBe(true);
      expect(optsOf(spy).method).toBe("PUT");
    });

    it("deleteCashFlow dan deleteTodo memakai DELETE ke id", async () => {
      const spy1 = mockFetch(ok(undefined, "hapus 1"));
      expect(await cashFlowApi.deleteCashFlow(5)).toBe("hapus 1");
      expect(optsOf(spy1).method).toBe("DELETE");
      expect(urlOf(spy1).endsWith("/cash-flows/5")).toBe(true);

      vi.restoreAllMocks();
      const spy2 = mockFetch(ok(undefined, "hapus 2"));
      expect(await cashFlowApi.deleteTodo(6)).toBe("hapus 2");
      expect(urlOf(spy2).endsWith("/cash-flows/6")).toBe(true);
    });

    it("deleteAllCashFlows memakai DELETE ke koleksi", async () => {
      const spy = mockFetch(ok(undefined, "semua"));
      expect(await cashFlowApi.deleteAllCashFlows()).toBe("semua");
      expect(optsOf(spy).method).toBe("DELETE");
      expect(urlOf(spy).endsWith("/cash-flows")).toBe(true);
    });

    it("postTodo memetakan judul ke label", async () => {
      const spy = mockFetch(ok({ id: 9 }));
      expect(await cashFlowApi.postTodo("Judul", "Isi")).toEqual({ id: 9 });
      expect(JSON.parse(optsOf(spy).body)).toEqual({
        type: "inflow",
        source: "cash",
        label: "Judul",
        description: "Isi",
        nominal: 0,
      });
    });

    it("putTodo memetakan judul ke label", async () => {
      const spy = mockFetch(ok(undefined, "ok"));
      expect(await cashFlowApi.putTodo(3, "Judul", "Isi", true)).toBe("ok");
      expect(urlOf(spy).endsWith("/cash-flows/3")).toBe(true);
      expect(JSON.parse(optsOf(spy).body).label).toBe("Judul");
    });
  });

  describe("postTodoCover", () => {
    it("memakai nama asli bila File", async () => {
      const spy = mockFetch(ok(undefined, "cover ok"));
      const file = new File(["x"], "foto.png", { type: "image/png" });
      expect(await cashFlowApi.postTodoCover(1, file)).toBe("cover ok");
      const body = optsOf(spy).body as FormData;
      expect((body.get("cover") as File).name).toBe("foto.png");
      expect(urlOf(spy).endsWith("/cash-flows/1/cover")).toBe(true);
    });

    it("memakai cover.jpg bila Blob", async () => {
      const spy = mockFetch(ok(undefined, "cover ok"));
      await cashFlowApi.postTodoCover(1, new Blob(["x"]));
      const body = optsOf(spy).body as FormData;
      expect((body.get("cover") as File).name).toBe("cover.jpg");
    });
  });

  const errorCases: [string, () => Promise<any>, string][] = [
    ["postCashFlow", () => cashFlowApi.postCashFlow(payload), "Gagal menambahkan transaksi"],
    ["putCashFlow", () => cashFlowApi.putCashFlow(1, payload), "Gagal mengubah transaksi"],
    ["getCashFlows", () => cashFlowApi.getCashFlows(), "Gagal mengambil data todo"],
    ["getCashFlowById", () => cashFlowApi.getCashFlowById(1), "Gagal mengambil detail"],
    ["deleteCashFlow", () => cashFlowApi.deleteCashFlow(1), "Gagal menghapus"],
    ["deleteAllCashFlows", () => cashFlowApi.deleteAllCashFlows(), "Gagal menghapus semua"],
    ["getLabels", () => cashFlowApi.getLabels(), "Gagal mengambil labels"],
    ["postTodo", () => cashFlowApi.postTodo("a", "b"), "Gagal menambahkan todo"],
    ["putTodo", () => cashFlowApi.putTodo(1, "a", "b", false), "Gagal mengubah todo"],
    ["getTodoById", () => cashFlowApi.getTodoById(1), "Gagal mengambil detail todo"],
    ["deleteTodo", () => cashFlowApi.deleteTodo(1), "Gagal menghapus todo"],
    ["postTodoCover", () => cashFlowApi.postTodoCover(1, new Blob(["x"])), "Gagal mengubah cover"],
  ];

  describe.each(errorCases)("%s gagal", (_name, call, defaultMessage) => {
    it("memakai pesan dari server", async () => {
      mockFetch(fail("pesan server"));
      await expect(call()).rejects.toThrow("pesan server");
    });

    it("memakai pesan bawaan bila server tidak mengirim pesan", async () => {
      mockFetch(fail());
      await expect(call()).rejects.toThrow(defaultMessage);
    });
  });
});
