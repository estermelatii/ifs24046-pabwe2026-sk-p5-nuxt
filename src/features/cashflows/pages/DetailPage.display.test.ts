import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import DetailPage from "./DetailPage.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";

const mockRouter = { push: vi.fn() };

vi.mock("vue-router", async () => {
  const actual = await vi.importActual<any>("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
    useRoute: () => ({ params: { cashFlowId: "1" } }),
  };
});

function heading(todo: any) {
  const { pinia, cashFlowsStore } = createMockPinia({
    profile: { id: 1, name: "A", email: "a@b.c" },
    todo,
  });
  vi.spyOn(cashFlowsStore, "asyncSetTodo").mockResolvedValue(undefined);
  const { wrapper } = renderWithProviders(DetailPage, { pinia });
  return wrapper.find("h1").text();
}

describe("DetailPage judul", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("memakai title bila ada", async () => {
    expect(heading({ id: 5, title: "Judul Lama", label: "Gaji" })).toBe("Judul Lama");
    await flushPromises();
  });

  it("memakai label bila title kosong", async () => {
    expect(heading({ id: 5, label: "Gaji" })).toBe("Gaji");
    await flushPromises();
  });

  it("memakai nomor transaksi bila title dan label kosong", async () => {
    expect(heading({ id: 5 })).toBe("Transaksi #5");
    await flushPromises();
  });
});
