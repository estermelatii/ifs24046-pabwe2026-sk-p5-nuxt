import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: false } });
    expect(wrapper.find('[data-testid="add-todo-modal"]').exists()).toBe(false);
  });

  it("should show validation error if label is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });

    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Label tidak boleh kosong");
  });

  it("should show validation error if nominal is invalid", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });

    await wrapper.find('[data-testid="add-todo-title-input"]').setValue("Gaji");
    await wrapper.find("#cf-nominal").setValue(-5);
    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Nominal tidak valid");
  });

  it("should call asyncAddCashFlow with form data on submit", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(AddModal, { props: { show: true } });
    const addSpy = vi.spyOn(cashFlowsStore, "asyncAddCashFlow").mockResolvedValue(undefined as any);

    await wrapper.find('[data-testid="add-todo-title-input"]').setValue("Gaji");
    await wrapper.find("#cf-nominal").setValue(5000);
    await wrapper.find('[data-testid="add-todo-description-input"]').setValue("Gaji bulanan");
    await wrapper.find("form").trigger("submit");

    expect(addSpy).toHaveBeenCalledWith({
      type: "inflow",
      source: "cash",
      label: "Gaji",
      description: "Gaji bulanan",
      nominal: 5000,
    });
  });

  it("should close modal after cash flow is added", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(AddModal, { props: { show: true } });
    vi.spyOn(cashFlowsStore, "asyncSetCashFlows").mockResolvedValue(undefined as any);
    vi.spyOn(cashFlowsStore, "asyncSetLabels").mockResolvedValue(undefined as any);

    cashFlowsStore.setIsCashFlowAdd(true);
    cashFlowsStore.setIsCashFlowAdded(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should stay open when add finished but not added", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(AddModal, { props: { show: true } });

    cashFlowsStore.setIsCashFlowAdd(true);
    cashFlowsStore.setIsCashFlowAdded(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="add-todo-modal"]').exists()).toBe(true);
    expect(wrapper.emitted("close")).toBeFalsy();
  });

  it("should close modal when close or cancel button clicked", async () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });

    await wrapper.find('[data-testid="close-add-modal-btn"]').trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(1);

    const cancelBtn = wrapper.findAll("button").find((b) => b.text() === "Batal");
    await cancelBtn!.trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(2);
  });
});
