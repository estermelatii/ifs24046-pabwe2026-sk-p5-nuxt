import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import HomePage from "./HomePage.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const mockRouter = { push: vi.fn() };

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return { ...actual, useRouter: () => mockRouter };
});

const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
const mockCashFlows: any[] = [
  { id: 1, type: "inflow", source: "cash", label: "Gaji", description: "Gaji bulanan", nominal: 5000000, created_at: "2024-02-26T02:34:26.000000Z" },
  { id: 2, type: "outflow", source: "savings", label: "Belanja", description: "", nominal: 150000, created_at: "2024-02-26T02:34:26.000000Z" },
];
const mockStats = {
  cashflow: 4850000,
  total_inflow: 5000000,
  total_outflow: 150000,
  total_inflow_cash: 5000000,
  total_outflow_cash: 0,
  total_inflow_savings: 0,
  total_outflow_savings: 150000,
};

function setup(state: Record<string, any> = {}) {
  const { pinia, cashFlowsStore } = createMockPinia({ profile: mockProfile, ...state });
  const loadSpy = vi.spyOn(cashFlowsStore, "asyncSetCashFlows").mockResolvedValue(undefined);
  const labelsSpy = vi.spyOn(cashFlowsStore, "asyncSetLabels").mockResolvedValue(undefined);
  vi.spyOn(cashFlowsStore, "asyncSetCashFlow").mockResolvedValue(undefined);
  const { wrapper } = renderWithProviders(HomePage, { pinia });
  return { wrapper, cashFlowsStore, loadSpy, labelsSpy };
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("tidak merender konten jika profile kosong", () => {
    const { wrapper } = setup({ profile: null });
    expect(wrapper.find('[data-testid="add-todo-btn"]').exists()).toBe(false);
  });

  it("memuat data dan label saat mount", async () => {
    const { loadSpy, labelsSpy } = setup({ cashFlows: [] });
    await flushPromises();
    expect(loadSpy).toHaveBeenCalledWith({});
    expect(labelsSpy).toHaveBeenCalled();
  });

  it("menampilkan ringkasan, statistik, dan baris transaksi", async () => {
    const { wrapper } = setup({ cashFlows: mockCashFlows, stats: mockStats });
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain("Ringkasan Arus Kas");
    expect(text).toContain("Saldo Bersih");
    expect(text).toContain("Total Inflow");
    expect(text).toContain("Total Outflow");
    expect(text).toContain("Gaji");
    expect(text).toContain("Gaji bulanan");
    expect(text).toContain("Belanja");
    expect(text).toContain("Rp");
    expect(wrapper.find('[data-testid="todo-row-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="todo-row-2"]').exists()).toBe(true);
  });

  it("menampilkan keadaan kosong", async () => {
    const { wrapper } = setup({ cashFlows: [] });
    await flushPromises();
    expect(wrapper.text()).toContain("Belum ada catatan arus kas");
  });

  it("menampilkan indikator loading selama data dimuat", async () => {
    const { pinia, cashFlowsStore } = createMockPinia({ profile: mockProfile, cashFlows: [] });
    vi.spyOn(cashFlowsStore, "asyncSetCashFlows").mockReturnValue(new Promise(() => {}) as any);
    vi.spyOn(cashFlowsStore, "asyncSetLabels").mockResolvedValue(undefined);
    const { wrapper } = renderWithProviders(HomePage, { pinia });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Memuat data...");
  });

  it("menangani cashFlows, stats, dan labels bernilai null", async () => {
    const { wrapper } = setup({ cashFlows: null, stats: null, labels: null });
    await flushPromises();
    expect(wrapper.text()).toContain("Belum ada catatan arus kas");
  });

  it("mengirim semua filter sebagai parameter", async () => {
    const { wrapper, loadSpy } = setup({ cashFlows: mockCashFlows, labels: ["Gaji", "Belanja"] });
    await flushPromises();

    await wrapper.find("#f-type").setValue("inflow");
    await wrapper.find("#f-source").setValue("cash");
    await wrapper.find("#f-label").setValue("Gaji");
    await wrapper.find("#f-start").setValue("2024-01-01");
    await wrapper.find("#f-end").setValue("2024-01-31");
    await flushPromises();

    expect(loadSpy).toHaveBeenLastCalledWith({
      type: "inflow",
      source: "cash",
      label: "Gaji",
      start_date: "2024-01-01 00:00:00",
      end_date: "2024-01-31 23:59:59",
    });
  });

  it("mengosongkan filter saat Reset Filter diklik", async () => {
    const { wrapper, loadSpy } = setup({ cashFlows: mockCashFlows });
    await flushPromises();

    await wrapper.find("#f-type").setValue("outflow");
    await flushPromises();

    const resetBtn = wrapper.findAll("button").find((b) => b.text() === "Reset Filter")!;
    await resetBtn.trigger("click");
    await flushPromises();

    expect(loadSpy).toHaveBeenLastCalledWith({});
    expect((wrapper.find("#f-type").element as HTMLSelectElement).value).toBe("");
  });

  it("membuka dan menutup AddModal dari tombol header", async () => {
    const { wrapper } = setup({ cashFlows: mockCashFlows });
    await wrapper.find('[data-testid="add-todo-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="add-todo-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-add-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="add-todo-modal"]').exists()).toBe(false);
  });

  it("membuka AddModal dari tombol pada keadaan kosong", async () => {
    const { wrapper } = setup({ cashFlows: [] });
    await flushPromises();

    const buttons = wrapper.findAll("button").filter((b) => b.text().includes("Tambah Transaksi"));
    expect(buttons.length).toBe(2);
    await buttons[1].trigger("click");
    expect(wrapper.find('[data-testid="add-todo-modal"]').exists()).toBe(true);
  });

  it("menuju halaman detail saat ikon lihat diklik", async () => {
    const { wrapper } = setup({ cashFlows: mockCashFlows });
    await wrapper.find('[data-testid="view-todo-1"]').trigger("click");
    expect(mockRouter.push).toHaveBeenCalledWith("/cash-flows/1");
  });

  it("membuka dan menutup modal ubah", async () => {
    const { wrapper } = setup({ cashFlows: mockCashFlows });
    await wrapper.find('[data-testid="edit-todo-1"]').trigger("click");
    expect(wrapper.find('[data-testid="edit-todo-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-edit-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="edit-todo-modal"]').exists()).toBe(false);
  });

  it("menghapus transaksi setelah dikonfirmasi lalu memuat ulang", async () => {
    const { wrapper, cashFlowsStore, loadSpy } = setup({ cashFlows: mockCashFlows });
    await flushPromises();
    const deleteSpy = vi.spyOn(cashFlowsStore, "asyncDeleteCashFlow").mockResolvedValue(undefined);
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    const callsBefore = loadSpy.mock.calls.length;

    await wrapper.find('[data-testid="delete-todo-1"]').trigger("click");
    await flushPromises();

    expect(deleteSpy).toHaveBeenCalledWith(1);
    expect(loadSpy.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it("tidak menghapus transaksi jika dibatalkan", async () => {
    const { wrapper, cashFlowsStore } = setup({ cashFlows: mockCashFlows });
    const deleteSpy = vi.spyOn(cashFlowsStore, "asyncDeleteCashFlow").mockResolvedValue(undefined);
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);

    await wrapper.find('[data-testid="delete-todo-1"]').trigger("click");
    await flushPromises();

    expect(toolsHelper.showConfirmDialog).toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("menghapus semua transaksi setelah dikonfirmasi", async () => {
    const { wrapper, cashFlowsStore } = setup({ cashFlows: mockCashFlows });
    const deleteAllSpy = vi.spyOn(cashFlowsStore, "asyncDeleteAll").mockResolvedValue(undefined);
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);

    const resetAll = wrapper.findAll("button").find((b) => b.text() === "Reset Semua")!;
    await resetAll.trigger("click");
    await flushPromises();

    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("tidak menghapus semua transaksi jika dibatalkan", async () => {
    const { wrapper, cashFlowsStore } = setup({ cashFlows: mockCashFlows });
    const deleteAllSpy = vi.spyOn(cashFlowsStore, "asyncDeleteAll").mockResolvedValue(undefined);
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);

    const resetAll = wrapper.findAll("button").find((b) => b.text() === "Reset Semua")!;
    await resetAll.trigger("click");
    await flushPromises();

    expect(deleteAllSpy).not.toHaveBeenCalled();
  });

  it("memuat ulang data saat flag store berubah", async () => {
    const { cashFlowsStore, loadSpy } = setup({ cashFlows: mockCashFlows });
    await flushPromises();
    const callsBefore = loadSpy.mock.calls.length;

    cashFlowsStore.setIsCashFlowDeleted(true);
    await flushPromises();

    expect(loadSpy.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it("tidak error jika di-unmount saat data masih dimuat", async () => {
    let resolveLoad: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      resolveLoad = resolve;
    });
    const { pinia, cashFlowsStore } = createMockPinia({ profile: mockProfile, cashFlows: [] });
    vi.spyOn(cashFlowsStore, "asyncSetCashFlows").mockReturnValue(pending as any);
    vi.spyOn(cashFlowsStore, "asyncSetLabels").mockResolvedValue(undefined);
    const { wrapper } = renderWithProviders(HomePage, { pinia });

    wrapper.unmount();
    resolveLoad();
    await expect(pending).resolves.toBeUndefined();
    await flushPromises();
  });
});
