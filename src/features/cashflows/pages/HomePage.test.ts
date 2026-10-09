import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import type { Todo } from "../api/cashFlowApi";

const mockRouter = {
  push: vi.fn(),
};

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

describe("HomePage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockCashFlows: Todo[] = [
    {
      id: 1,
      title: "Todo Pertama",
      description: "Deskripsi pertama",
      is_finished: 0,
      cover: "https://example.com/cover1.jpg",
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
    },
    {
      id: 2,
      title: "Todo Kedua Selesai",
      description: "Deskripsi kedua",
      is_finished: 1,
      cover: null,
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null/empty if profile is not present", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: null },
    });
    expect(wrapper.find('[data-testid="add-todo-btn"]').exists()).toBe(false);
  });

  it("should render cashFlows stats, rows, and empty state when empty", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        cashFlows: [],
      },
    });

    vi.spyOn(cashFlowsStore, "asyncSetCashFlows").mockResolvedValue();

    expect(wrapper.text()).toContain("Arus Kas");
    expect(wrapper.text()).toContain("Belum ada data todo yang cocok.");
  });

  it("should display loading indicator while loading cashFlows", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        cashFlows: [],
      },
    });

    vi.spyOn(cashFlowsStore, "asyncSetCashFlows").mockReturnValue(new Promise(() => {}) as any);
    const filterPendingBtn = wrapper.find('[data-testid="filter-pending-btn"]');
    await filterPendingBtn.trigger("click");

    expect(wrapper.text()).toContain("Memuat daftar todo...");
  });

  it("should display stats count and filter/search cashFlows", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        cashFlows: mockCashFlows,
      },
    });

    expect(wrapper.text()).toContain("Total Todo");
    expect(wrapper.text()).toContain("Todo Pertama");
    expect(wrapper.text()).toContain("Todo Kedua Selesai");

    // Test search filter by title
    const searchInput = wrapper.find<HTMLInputElement>('[data-testid="search-todo-input"]');
    await searchInput.setValue("Pertama");

    expect(wrapper.text()).toContain("Todo Pertama");
    expect(wrapper.text()).not.toContain("Todo Kedua Selesai");

    // Test search filter by description
    await searchInput.setValue("kedua");
    expect(wrapper.text()).toContain("Todo Kedua Selesai");

    // Test status filter buttons
    const filterFinishedBtn = wrapper.find('[data-testid="filter-finished-btn"]');
    await filterFinishedBtn.trigger("click");

    const filterPendingBtn = wrapper.find('[data-testid="filter-pending-btn"]');
    await filterPendingBtn.trigger("click");

    const filterAllBtn = wrapper.find('[data-testid="filter-all-btn"]');
    await filterAllBtn.trigger("click");
  });

  it("should handle search against cashFlows with null title and description", async () => {
    vi.spyOn(toolsHelper, "formatDate").mockReturnValue("-");

    const { pinia, cashFlowsStore } = createMockPinia({
      profile: mockProfile,
      cashFlows: [{ id: 99, title: null, description: null, is_finished: 0 }],
    });
    vi.spyOn(cashFlowsStore, "asyncSetCashFlows").mockResolvedValue();

    const { wrapper } = renderWithProviders(HomePage, { pinia });

    const searchInput = wrapper.find<HTMLInputElement>('[data-testid="search-todo-input"]');
    await searchInput.setValue("xyz");
    expect(wrapper.text()).toContain("Belum ada data todo yang cocok.");
  });

  it("should open and close AddModal when Tambah Todo button clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        cashFlows: mockCashFlows,
      },
    });

    const addBtn = wrapper.find('[data-testid="add-todo-btn"]');
    await addBtn.trigger("click");

    expect(wrapper.find('[data-testid="add-todo-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="add-todo-modal"]').exists()).toBe(false);
  });

  it("should navigate to detail page when view icon clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        cashFlows: mockCashFlows,
      },
    });

    const viewBtn = wrapper.find('[data-testid="view-todo-1"]');
    await viewBtn.trigger("click");

    expect(mockRouter.push).toHaveBeenCalledWith("/cash-flows/1");
  });

  it("should open and close edit modal when edit icon clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        cashFlows: mockCashFlows,
      },
    });

    const editBtn = wrapper.find('[data-testid="edit-todo-1"]');
    await editBtn.trigger("click");

    expect(wrapper.find('[data-testid="edit-todo-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-todo-modal"]').exists()).toBe(false);
  });

  it("should trigger confirm dialog and dispatch delete when delete icon confirmed", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        cashFlows: mockCashFlows,
      },
    });

    const deleteActionSpy = vi
      .spyOn(cashFlowsStore, "asyncSetIsTodoDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);

    const deleteBtn = wrapper.find('[data-testid="delete-todo-1"]');
    await deleteBtn.trigger("click");

    expect(deleteActionSpy).toHaveBeenCalledWith(1);
  });

  it("should not dispatch delete when cancelled", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        cashFlows: mockCashFlows,
      },
    });

    const deleteActionSpy = vi
      .spyOn(cashFlowsStore, "asyncSetIsTodoDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);

    const deleteBtn = wrapper.find('[data-testid="delete-todo-1"]');
    await deleteBtn.trigger("click");

    expect(toolsHelper.showConfirmDialog).toHaveBeenCalled();
    expect(deleteActionSpy).not.toHaveBeenCalled();
  });

  it("should reload cashFlows when isTodoDeleted is true", async () => {
    const { cashFlowsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        cashFlows: mockCashFlows,
        isTodoDeleted: false,
      },
    });

    const asyncSetCashFlowsSpy = vi
      .spyOn(cashFlowsStore, "asyncSetCashFlows")
      .mockReturnValue(Promise.resolve());

    cashFlowsStore.setIsTodoDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(asyncSetCashFlowsSpy).toHaveBeenCalled();
  });

  it("should not update loading state after unmount", async () => {
    let resolveLoad: () => void = () => {};
    const pendingPromise = new Promise<void>((resolve) => {
      resolveLoad = resolve;
    });

    const { wrapper, cashFlowsStore } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, cashFlows: [] },
    });

    vi.spyOn(cashFlowsStore, "asyncSetCashFlows").mockReturnValue(pendingPromise as any);

    const filterPendingBtn = wrapper.find('[data-testid="filter-pending-btn"]');
    await filterPendingBtn.trigger("click");

    wrapper.unmount();
    resolveLoad();
    await pendingPromise;
  });

  it("should handle null cashFlows in cashFlowsStore gracefully", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, cashFlows: null },
    });

    expect(wrapper.text()).toContain("Arus Kas");
  });
});
