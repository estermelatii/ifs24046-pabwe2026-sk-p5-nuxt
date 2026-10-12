import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import cashFlowApi from "../api/cashFlowApi";
import apiHelper from "../../../helpers/apiHelper";
import { useCashFlowsStore } from "./cashFlowsStore";

describe("cashFlowsStore: labels dan filter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setActivePinia(createPinia());
  });

  it("asyncSetLabels menyimpan label dari API", async () => {
    vi.spyOn(cashFlowApi, "getLabels").mockResolvedValue(["Gaji", "Belanja"]);
    const store = useCashFlowsStore();
    await store.asyncSetLabels();
    expect(store.labels).toEqual(["Gaji", "Belanja"]);
  });

  it("asyncSetLabels mengosongkan label jika API gagal", async () => {
    vi.spyOn(cashFlowApi, "getLabels").mockRejectedValue(new Error("gagal"));
    const store = useCashFlowsStore();
    store.setLabels(["Lama"]);
    await store.asyncSetLabels();
    expect(store.labels).toEqual([]);
  });

  it("asyncSetLabels mengosongkan label jika respons bukan array", async () => {
    vi.spyOn(cashFlowApi, "getLabels").mockResolvedValue(null as any);
    const store = useCashFlowsStore();
    await store.asyncSetLabels();
    expect(store.labels).toEqual([]);
  });

  it("asyncSetCashFlows meneruskan parameter filter ke API", async () => {
    const spy = vi.spyOn(cashFlowApi, "getCashFlows").mockResolvedValue([]);
    const store = useCashFlowsStore();
    await store.asyncSetCashFlows({ type: "inflow" });
    expect(spy).toHaveBeenCalledWith({ type: "inflow" });
  });

  it("getCashFlows membangun query string dari objek filter", async () => {
    const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ status: "success", data: { cashFlows: [] } }),
    } as any);
    await cashFlowApi.getCashFlows({ type: "inflow", source: "cash" });
    expect(String(fetchSpy.mock.calls[0][0])).toContain("?type=inflow&source=cash");
  });

  it("getCashFlows tidak menambah query untuk objek kosong", async () => {
    const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ status: "success", data: { cashFlows: [] } }),
    } as any);
    await cashFlowApi.getCashFlows({});
    expect(String(fetchSpy.mock.calls[0][0])).not.toContain("?");
  });
});
