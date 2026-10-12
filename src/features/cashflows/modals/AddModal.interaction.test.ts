import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.vue";
import { renderWithProviders } from "../../../test-utils";

describe("AddModal interaksi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("mengirim tipe outflow dan sumber yang dipilih", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(AddModal, { props: { show: true } });
    const addSpy = vi.spyOn(cashFlowsStore, "asyncAddCashFlow").mockResolvedValue(undefined as any);

    const outflowBtn = wrapper.findAll("button").find((b) => b.text().includes("Pengeluaran"))!;
    await outflowBtn.trigger("click");
    expect(outflowBtn.classes()).toContain("bg-rose-50");

    await wrapper.find("#cf-source").setValue("savings");
    await wrapper.find('[data-testid="add-todo-title-input"]').setValue("Belanja");
    await wrapper.find("#cf-nominal").setValue(150);
    await wrapper.find("form").trigger("submit");

    expect(addSpy).toHaveBeenCalledWith({
      type: "outflow",
      source: "savings",
      label: "Belanja",
      description: "",
      nominal: 150,
    });
    expect(wrapper.text()).toContain("Menyimpan...");
  });

  it("bisa kembali ke tipe inflow", async () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });
    const outflowBtn = wrapper.findAll("button").find((b) => b.text().includes("Pengeluaran"))!;
    const inflowBtn = wrapper.findAll("button").find((b) => b.text().includes("Pemasukan"))!;

    await outflowBtn.trigger("click");
    await inflowBtn.trigger("click");
    expect(inflowBtn.classes()).toContain("bg-emerald-50");
  });

  it("mereset form setiap modal dibuka ulang", async () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: false } });
    await wrapper.setProps({ show: true });

    const title = wrapper.find('[data-testid="add-todo-title-input"]');
    await title.setValue("Sisa isian");
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });

    expect((wrapper.find('[data-testid="add-todo-title-input"]').element as HTMLInputElement).value).toBe("");
  });
});
