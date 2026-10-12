import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ChangeModal from "./ChangeModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const mockCashFlow = {
  id: 1,
  type: "outflow",
  source: "savings",
  label: "Belanja",
  description: "Belanja bulanan",
  nominal: 150000,
};

function setup(props: Record<string, any> = {}, state: Record<string, any> = {}) {
  const result = renderWithProviders(ChangeModal, {
    props: { show: true, cashFlowId: 1, ...props },
    preloadedState: { cashFlow: mockCashFlow, ...state },
  });
  vi.spyOn(result.cashFlowsStore, "asyncSetCashFlow").mockResolvedValue(undefined);
  vi.spyOn(result.cashFlowsStore, "asyncSetCashFlows").mockResolvedValue(undefined);
  vi.spyOn(result.cashFlowsStore, "asyncUpdateCashFlow").mockResolvedValue(undefined);
  return result;
}

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("tidak merender saat show false", () => {
    const { wrapper } = setup({ show: false });
    expect(wrapper.find('[data-testid="edit-todo-modal"]').exists()).toBe(false);
  });

  it("mengisi form dari data transaksi", () => {
    const { wrapper } = setup();
    expect((wrapper.find('[data-testid="edit-todo-title-input"]').element as HTMLInputElement).value).toBe("Belanja");
    expect((wrapper.find('[data-testid="edit-todo-description-input"]').element as HTMLTextAreaElement).value).toBe("Belanja bulanan");
    expect((wrapper.find("#edit-source").element as HTMLSelectElement).value).toBe("savings");
    expect((wrapper.find("#edit-nominal").element as HTMLInputElement).value).toBe("150000");

    const outflowBtn = wrapper.findAll("button").find((b) => b.text().includes("Outflow"))!;
    expect(outflowBtn.classes()).toContain("bg-rose-50");
  });

  it("memakai title lama dan nilai default bila field baru kosong", () => {
    const { wrapper } = setup({}, { cashFlow: { id: 1, title: "Judul Lama" } });
    expect((wrapper.find('[data-testid="edit-todo-title-input"]').element as HTMLInputElement).value).toBe("Judul Lama");
    expect((wrapper.find("#edit-source").element as HTMLSelectElement).value).toBe("cash");
    expect((wrapper.find("#edit-nominal").element as HTMLInputElement).value).toBe("0");
  });

  it("mengosongkan form bila tidak ada data", () => {
    const { wrapper } = setup({}, { cashFlow: null, todo: null });
    expect((wrapper.find('[data-testid="edit-todo-title-input"]').element as HTMLInputElement).value).toBe("");
  });

  it("memuat detail saat modal dibuka", async () => {
    const { wrapper, cashFlowsStore } = setup({ show: false });
    await wrapper.setProps({ show: true });
    expect(cashFlowsStore.asyncSetCashFlow).toHaveBeenCalledWith(1);
  });

  it("menolak label kosong", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper, cashFlowsStore } = setup();

    await wrapper.find('[data-testid="edit-todo-title-input"]').setValue("   ");
    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Label tidak boleh kosong");
    expect(cashFlowsStore.asyncUpdateCashFlow).not.toHaveBeenCalled();
  });

  it("mengirim data apa adanya saat disimpan", async () => {
    const { wrapper, cashFlowsStore } = setup();
    await wrapper.find("form").trigger("submit");

    expect(cashFlowsStore.asyncUpdateCashFlow).toHaveBeenCalledWith(1, {
      type: "outflow",
      source: "savings",
      label: "Belanja",
      description: "Belanja bulanan",
      nominal: 150000,
    });
    expect(wrapper.text()).toContain("Menyimpan...");
  });

  it("mengirim perubahan tipe, sumber, nominal, dan deskripsi", async () => {
    const { wrapper, cashFlowsStore } = setup();

    const inflowBtn = wrapper.findAll("button").find((b) => b.text().includes("Inflow"))!;
    await inflowBtn.trigger("click");
    await wrapper.find("#edit-source").setValue("loans");
    await wrapper.find("#edit-nominal").setValue(250);
    await wrapper.find('[data-testid="edit-todo-description-input"]').setValue("  catatan  ");
    await wrapper.find("form").trigger("submit");

    expect(cashFlowsStore.asyncUpdateCashFlow).toHaveBeenCalledWith(1, {
      type: "inflow",
      source: "loans",
      label: "Belanja",
      description: "catatan",
      nominal: 250,
    });
  });

  it("memakai todoId bila cashFlowId tidak diberikan", async () => {
    const { wrapper, cashFlowsStore } = setup({ cashFlowId: null, todoId: 7 });
    await wrapper.find("form").trigger("submit");
    expect(cashFlowsStore.asyncUpdateCashFlow).toHaveBeenCalledWith(7, expect.any(Object));
  });

  it("menutup modal dan memuat ulang data setelah berhasil diubah", async () => {
    const { wrapper, cashFlowsStore } = setup();

    cashFlowsStore.setIsCashFlowChange(true);
    cashFlowsStore.setIsCashFlowChanged(true);
    await flushPromises();

    expect(wrapper.emitted("close")).toBeTruthy();
    expect(cashFlowsStore.asyncSetCashFlows).toHaveBeenCalled();
  });

  it("tetap terbuka bila perubahan gagal", async () => {
    const { wrapper, cashFlowsStore } = setup();

    cashFlowsStore.setIsCashFlowChange(true);
    cashFlowsStore.setIsCashFlowChanged(false);
    await flushPromises();

    expect(wrapper.emitted("close")).toBeFalsy();
    expect(wrapper.find('[data-testid="edit-todo-modal"]').exists()).toBe(true);
  });

  it("menutup modal lewat tombol close dan Batal", async () => {
    const { wrapper } = setup();

    await wrapper.find('[data-testid="close-edit-modal-btn"]').trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(1);

    const cancelBtn = wrapper.findAll("button").find((b) => b.text() === "Batal")!;
    await cancelBtn.trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(2);
  });
});
