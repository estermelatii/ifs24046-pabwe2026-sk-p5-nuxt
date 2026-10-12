import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import cashFlowApi from "../api/cashFlowApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { useCashFlowsStore } from "./cashFlowsStore";

type Store = ReturnType<typeof useCashFlowsStore>;
const api = cashFlowApi as any;
const payload: any = { type: "inflow", source: "cash", label: "Gaji", description: "", nominal: 1 };

describe("cashFlowsStore", () => {
  let store: Store;
  let success: any;
  let error: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    setActivePinia(createPinia());
    store = useCashFlowsStore();
    success = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation((() => {}) as any);
    error = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation((() => {}) as any);
  });

  describe("setter", () => {
    it("menormalkan nilai kosong", () => {
      store.setCashFlows(null as any);
      expect(store.cashFlows).toEqual([]);
      store.setCashFlows([{ id: 1 }] as any);
      expect(store.cashFlows).toEqual([{ id: 1 }]);

      store.setStats(null as any);
      expect(store.stats).toEqual({});
      store.setStats({ cashflow: 5 });
      expect(store.stats).toEqual({ cashflow: 5 });

      store.setLabels(null as any);
      expect(store.labels).toEqual([]);
      store.setLabels(["a"]);
      expect(store.labels).toEqual(["a"]);
    });

    it("setCashFlow dan setTodo saling menyinkronkan", () => {
      store.setCashFlow({ id: 1 } as any);
      expect(store.cashFlow).toEqual({ id: 1 });
      expect(store.todo).toEqual({ id: 1 });
      store.setTodo({ id: 2 } as any);
      expect(store.cashFlow).toEqual({ id: 2 });
      expect(store.todo).toEqual({ id: 2 });
    });

    it("setIsTodo mengisi isTodo dan isCashFlow", () => {
      store.setIsTodo(true);
      expect(store.isTodo).toBe(true);
      expect(store.isCashFlow).toBe(true);
    });

    it("flag cover", () => {
      store.setIsTodoChangeCover(true);
      store.setIsTodoChangedCover(true);
      expect(store.isTodoChangeCover).toBe(true);
      expect(store.isTodoChangedCover).toBe(true);
    });

    const pairs: [string, string, string][] = [
      ["setIsCashFlowAdd", "isCashFlowAdd", "isTodoAdd"],
      ["setIsCashFlowAdded", "isCashFlowAdded", "isTodoAdded"],
      ["setIsCashFlowChange", "isCashFlowChange", "isTodoChange"],
      ["setIsCashFlowChanged", "isCashFlowChanged", "isTodoChanged"],
      ["setIsCashFlowDelete", "isCashFlowDelete", "isTodoDelete"],
      ["setIsCashFlowDeleted", "isCashFlowDeleted", "isTodoDeleted"],
      ["setIsTodoAdd", "isCashFlowAdd", "isTodoAdd"],
      ["setIsTodoAdded", "isCashFlowAdded", "isTodoAdded"],
      ["setIsTodoChange", "isCashFlowChange", "isTodoChange"],
      ["setIsTodoChanged", "isCashFlowChanged", "isTodoChanged"],
      ["setIsTodoDelete", "isCashFlowDelete", "isTodoDelete"],
      ["setIsTodoDeleted", "isCashFlowDeleted", "isTodoDeleted"],
    ];

    it.each(pairs)("%s mengisi %s dan %s", (action, a, b) => {
      const s = store as any;
      s[action](true);
      expect(s[a]).toBe(true);
      expect(s[b]).toBe(true);
      s[action](false);
      expect(s[a]).toBe(false);
      expect(s[b]).toBe(false);
    });
  });

  describe("asyncSetCashFlows", () => {
    it("menyimpan daftar dari API dan meneruskan parameter", async () => {
      const spy = vi.spyOn(api, "getCashFlows").mockResolvedValue([{ id: 1 }]);
      await store.asyncSetCashFlows({ type: "inflow" });
      expect(spy).toHaveBeenCalledWith({ type: "inflow" });
      expect(store.cashFlows).toEqual([{ id: 1 }]);
    });

    it("mengosongkan daftar bila respons bukan array", async () => {
      vi.spyOn(api, "getCashFlows").mockResolvedValue({});
      await store.asyncSetCashFlows();
      expect(store.cashFlows).toEqual([]);
    });

    it("mengosongkan daftar bila API gagal", async () => {
      vi.spyOn(api, "getCashFlows").mockRejectedValue(new Error("x"));
      store.setCashFlows([{ id: 1 }] as any);
      await store.asyncSetCashFlows();
      expect(store.cashFlows).toEqual([]);
    });
  });

  describe("detail", () => {
    it("asyncSetCashFlow sukses", async () => {
      vi.spyOn(api, "getCashFlowById").mockResolvedValue({ id: 1 });
      await store.asyncSetCashFlow(1);
      expect(store.cashFlow).toEqual({ id: 1 });
      expect(store.isTodo).toBe(true);
    });

    it("asyncSetCashFlow gagal", async () => {
      vi.spyOn(api, "getCashFlowById").mockRejectedValue(new Error("x"));
      await store.asyncSetCashFlow(1);
      expect(store.cashFlow).toBeNull();
      expect(store.isTodo).toBe(true);
    });

    it("asyncSetTodo sukses", async () => {
      vi.spyOn(api, "getTodoById").mockResolvedValue({ id: 2 });
      await store.asyncSetTodo(2);
      expect(store.todo).toEqual({ id: 2 });
      expect(store.isTodo).toBe(true);
    });

    it("asyncSetTodo gagal", async () => {
      vi.spyOn(api, "getTodoById").mockRejectedValue(new Error("x"));
      await store.asyncSetTodo(2);
      expect(store.todo).toBeNull();
      expect(store.isTodo).toBe(true);
    });
  });

  const addCases: any[] = [
    ["asyncAddCashFlow", "postCashFlow", (s: Store) => s.asyncAddCashFlow(payload), "Transaksi berhasil ditambahkan!", "Gagal menambah transaksi", "isCashFlowAdded", "isCashFlowAdd"],
    ["asyncSetIsTodoAdd", "postTodo", (s: Store) => s.asyncSetIsTodoAdd("t", "d"), "Todo berhasil ditambahkan!", "Gagal menambah todo", "isTodoAdded", "isTodoAdd"],
  ];

  describe.each(addCases)("%s", (_n, apiName, run, okMessage, failDefault, resultFlag, doneFlag) => {
    it("sukses", async () => {
      vi.spyOn(api, apiName).mockResolvedValue({ id: 1 });
      await run(store);
      expect(success).toHaveBeenCalledWith(okMessage);
      expect((store as any)[resultFlag]).toBe(true);
      expect((store as any)[doneFlag]).toBe(true);
    });

    it("gagal dengan pesan error", async () => {
      vi.spyOn(api, apiName).mockRejectedValue(new Error("boom"));
      await run(store);
      expect(error).toHaveBeenCalledWith("boom");
      expect((store as any)[resultFlag]).toBe(false);
      expect((store as any)[doneFlag]).toBe(true);
    });

    it("gagal tanpa pesan memakai pesan bawaan", async () => {
      vi.spyOn(api, apiName).mockRejectedValue({});
      await run(store);
      expect(error).toHaveBeenCalledWith(failDefault);
    });
  });

  const msgCases: any[] = [
    ["asyncUpdateCashFlow", "putCashFlow", (s: Store) => s.asyncUpdateCashFlow(1, payload), "Transaksi berhasil diubah!", "Gagal mengubah transaksi", "isCashFlowChanged", "isCashFlowChange"],
    ["asyncSetIsTodoChange", "putTodo", (s: Store) => s.asyncSetIsTodoChange(1, "t", "d", 1), "Todo berhasil diperbarui!", "Gagal mengubah todo", "isTodoChanged", "isTodoChange"],
    ["asyncDeleteCashFlow", "deleteCashFlow", (s: Store) => s.asyncDeleteCashFlow(1), "Transaksi dihapus!", "Gagal menghapus", "isCashFlowDeleted", "isCashFlowDelete"],
    ["asyncSetIsTodoDelete", "deleteTodo", (s: Store) => s.asyncSetIsTodoDelete(1), "Todo berhasil dihapus!", "Gagal menghapus todo", "isTodoDeleted", "isTodoDelete"],
    ["asyncSetIsTodoChangeCover", "postTodoCover", (s: Store) => s.asyncSetIsTodoChangeCover(1, new Blob(["x"])), "Cover berhasil diperbarui!", "Gagal mengubah cover", "isTodoChangedCover", "isTodoChangeCover"],
  ];

  describe.each(msgCases)("%s", (_n, apiName, run, okDefault, failDefault, resultFlag, doneFlag) => {
    it("sukses dengan pesan dari server", async () => {
      vi.spyOn(api, apiName).mockResolvedValue("pesan server");
      await run(store);
      expect(success).toHaveBeenCalledWith("pesan server");
      expect((store as any)[resultFlag]).toBe(true);
      expect((store as any)[doneFlag]).toBe(true);
    });

    it("sukses tanpa pesan memakai pesan bawaan", async () => {
      vi.spyOn(api, apiName).mockResolvedValue(undefined);
      await run(store);
      expect(success).toHaveBeenCalledWith(okDefault);
    });

    it("gagal dengan pesan error", async () => {
      vi.spyOn(api, apiName).mockRejectedValue(new Error("boom"));
      await run(store);
      expect(error).toHaveBeenCalledWith("boom");
      expect((store as any)[resultFlag]).toBe(false);
      expect((store as any)[doneFlag]).toBe(true);
    });

    it("gagal tanpa pesan memakai pesan bawaan", async () => {
      vi.spyOn(api, apiName).mockRejectedValue({});
      await run(store);
      expect(error).toHaveBeenCalledWith(failDefault);
    });
  });

  it("asyncSetIsTodoChange mengubah angka finished menjadi boolean", async () => {
    const spy = vi.spyOn(api, "putTodo").mockResolvedValue("ok");
    await store.asyncSetIsTodoChange(1, "t", "d", 1);
    expect(spy).toHaveBeenCalledWith(1, "t", "d", true);
    await store.asyncSetIsTodoChange(1, "t", "d", 0);
    expect(spy).toHaveBeenLastCalledWith(1, "t", "d", false);
  });

  describe("asyncDeleteAll", () => {
    it("sukses dengan pesan lalu memuat ulang daftar", async () => {
      vi.spyOn(api, "deleteAllCashFlows").mockResolvedValue("pesan semua");
      vi.spyOn(api, "getCashFlows").mockResolvedValue([{ id: 1 }]);
      await store.asyncDeleteAll();
      expect(success).toHaveBeenCalledWith("pesan semua");
      expect(store.cashFlows).toEqual([{ id: 1 }]);
    });

    it("sukses tanpa pesan memakai pesan bawaan", async () => {
      vi.spyOn(api, "deleteAllCashFlows").mockResolvedValue(undefined);
      vi.spyOn(api, "getCashFlows").mockResolvedValue([]);
      await store.asyncDeleteAll();
      expect(success).toHaveBeenCalledWith("Semua data dihapus!");
    });

    it("gagal dengan pesan error", async () => {
      vi.spyOn(api, "deleteAllCashFlows").mockRejectedValue(new Error("boom"));
      await store.asyncDeleteAll();
      expect(error).toHaveBeenCalledWith("boom");
    });

    it("gagal tanpa pesan memakai pesan bawaan", async () => {
      vi.spyOn(api, "deleteAllCashFlows").mockRejectedValue({});
      await store.asyncDeleteAll();
      expect(error).toHaveBeenCalledWith("Gagal menghapus semua");
    });
  });
});
