import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import DetailPage from "./DetailPage.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";

vi.mock("vue-router", async () => {
  const actual = await vi.importActual<any>("vue-router");
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    useRoute: () => ({ params: { cashFlowId: "1" } }),
  };
});

describe("DetailPage displayTitle", () => {
  it("tetap aman saat data transaksi dikosongkan", async () => {
    const { pinia, cashFlowsStore } = createMockPinia({
      profile: { id: 1, name: "A", email: "a@b.c" },
      todo: { id: 5, label: "Gaji" },
    });
    vi.spyOn(cashFlowsStore, "asyncSetTodo").mockResolvedValue(undefined);
    const { wrapper } = renderWithProviders(DetailPage, { pinia });

    cashFlowsStore.setTodo(null);
    await flushPromises();

    expect((wrapper.vm as any).displayTitle).toBe("Transaksi #");
  });
});
