import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.vue";
import { renderWithProviders } from "../../../test-utils";

function setup(props: Record<string, any>, state: Record<string, any>) {
  const result = renderWithProviders(ChangeModal, { props, preloadedState: state });
  vi.spyOn(result.cashFlowsStore, "asyncSetCashFlow").mockResolvedValue(undefined);
  vi.spyOn(result.cashFlowsStore, "asyncSetCashFlows").mockResolvedValue(undefined);
  vi.spyOn(result.cashFlowsStore, "asyncUpdateCashFlow").mockResolvedValue(undefined);
  return result;
}

describe("ChangeModal tambahan", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("mengubah tipe ke outflow lewat tombol", async () => {
    const { wrapper, cashFlowsStore } = setup(
      { show: true, cashFlowId: 1 },
      { cashFlow: { id: 1, type: "inflow", source: "cash", label: "Gaji", nominal: 10 } }
    );

    const outflowBtn = wrapper.findAll("button").find((b) => b.text().includes("Outflow"))!;
    await outflowBtn.trigger("click");
    expect(outflowBtn.classes()).toContain("bg-rose-50");

    await wrapper.find("form").trigger("submit");
    expect(cashFlowsStore.asyncUpdateCashFlow).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ type: "outflow" })
    );
  });

  it("mengosongkan label bila data tidak punya label maupun title", () => {
    const { wrapper } = setup({ show: true, cashFlowId: 1 }, { cashFlow: { id: 1 } });
    expect((wrapper.find('[data-testid="edit-todo-title-input"]').element as HTMLInputElement).value).toBe("");
  });

  it("tidak memuat detail bila tidak ada id", async () => {
    const { wrapper, cashFlowsStore } = setup({ show: false }, { cashFlow: null });
    await wrapper.setProps({ show: true });
    expect(cashFlowsStore.asyncSetCashFlow).not.toHaveBeenCalled();
  });
});
