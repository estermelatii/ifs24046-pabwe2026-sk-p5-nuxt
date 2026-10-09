import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCashFlowsStore } from "./cashFlowsStore";
import cashFlowApi, { type Todo } from "../api/cashFlowApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("cashFlowsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  const dummyTodo: Todo = {
    id: 1,
    title: "Test",
    description: "Desc",
    is_finished: 0,
  };

  it("should have correct default state", () => {
    const store = useCashFlowsStore();
    expect(store.cashFlows).toEqual([]);
    expect(store.todo).toBeNull();
    expect(store.isTodo).toBe(false);
    expect(store.isTodoAdd).toBe(false);
    expect(store.isTodoAdded).toBe(false);
    expect(store.isTodoChange).toBe(false);
    expect(store.isTodoChanged).toBe(false);
    expect(store.isTodoChangeCover).toBe(false);
    expect(store.isTodoChangedCover).toBe(false);
    expect(store.isTodoDelete).toBe(false);
    expect(store.isTodoDeleted).toBe(false);
  });

  it("should update state with setters", () => {
    const store = useCashFlowsStore();
    store.setCashFlows([dummyTodo]);
    expect(store.cashFlows).toEqual([dummyTodo]);

    store.setTodo(dummyTodo);
    expect(store.todo).toEqual(dummyTodo);

    store.setIsTodo(true);
    expect(store.isTodo).toBe(true);

    store.setIsTodoAdd(true);
    expect(store.isTodoAdd).toBe(true);

    store.setIsTodoAdded(true);
    expect(store.isTodoAdded).toBe(true);

    store.setIsTodoChange(true);
    expect(store.isTodoChange).toBe(true);

    store.setIsTodoChanged(true);
    expect(store.isTodoChanged).toBe(true);

    store.setIsTodoChangeCover(true);
    expect(store.isTodoChangeCover).toBe(true);

    store.setIsTodoChangedCover(true);
    expect(store.isTodoChangedCover).toBe(true);

    store.setIsTodoDelete(true);
    expect(store.isTodoDelete).toBe(true);

    store.setIsTodoDeleted(true);
    expect(store.isTodoDeleted).toBe(true);
  });

  describe("asyncSetCashFlows", () => {
    it("should set cashFlows on success", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "getCashFlows").mockResolvedValue([dummyTodo]);

      await store.asyncSetCashFlows("1");

      expect(store.cashFlows).toEqual([dummyTodo]);
    });

    it("should set empty array on error", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "getCashFlows").mockRejectedValue(new Error("Err"));

      await store.asyncSetCashFlows();

      expect(store.cashFlows).toEqual([]);
    });
  });

  describe("asyncSetTodo", () => {
    it("should set todo and setIsTodo on success", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "getTodoById").mockResolvedValue(dummyTodo);

      await store.asyncSetTodo(1);

      expect(store.todo).toEqual(dummyTodo);
      expect(store.isTodo).toBe(true);
    });

    it("should set null and setIsTodo on error", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "getTodoById").mockRejectedValue(new Error("Err"));

      await store.asyncSetTodo(99);

      expect(store.todo).toBeNull();
      expect(store.isTodo).toBe(true);
    });
  });

  describe("asyncSetIsTodoAdd", () => {
    it("should post todo, show success dialog, and set flags on success", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "postTodo").mockResolvedValue({ todo_id: 1 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsTodoAdd("Title", "Desc");

      expect(successSpy).toHaveBeenCalledWith("Todo berhasil ditambahkan!");
      expect(store.isTodoAdded).toBe(true);
      expect(store.isTodoAdd).toBe(true);
    });

    it("should show error dialog and set flags on failure", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "postTodo").mockRejectedValue(new Error("Gagal tambah"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsTodoAdd("Title", "Desc");

      expect(errorSpy).toHaveBeenCalledWith("Gagal tambah");
      expect(store.isTodoAdded).toBe(false);
      expect(store.isTodoAdd).toBe(true);
    });
  });

  describe("asyncSetIsTodoChange", () => {
    it("should update todo, show success dialog, and set flags on success", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "putTodo").mockResolvedValue("Todo diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsTodoChange(1, "Title", "Desc", true);

      expect(successSpy).toHaveBeenCalledWith("Todo diubah");
      expect(store.isTodoChanged).toBe(true);
      expect(store.isTodoChange).toBe(true);
    });

    it("should use fallback success message when api returns empty string", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "putTodo").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsTodoChange(1, "Title", "Desc", true);

      expect(successSpy).toHaveBeenCalledWith("Todo berhasil diperbarui!");
    });

    it("should show error dialog and set flags on failure", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "putTodo").mockRejectedValue(new Error("Gagal update"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsTodoChange(1, "Title", "Desc", true);

      expect(errorSpy).toHaveBeenCalledWith("Gagal update");
      expect(store.isTodoChanged).toBe(false);
      expect(store.isTodoChange).toBe(true);
    });
  });

  describe("asyncSetIsTodoChangeCover", () => {
    it("should upload cover, show success dialog, and set flags on success", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "postTodoCover").mockResolvedValue("Cover diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "cover.jpg");
      await store.asyncSetIsTodoChangeCover(1, dummyFile);

      expect(successSpy).toHaveBeenCalledWith("Cover diubah");
      expect(store.isTodoChangedCover).toBe(true);
      expect(store.isTodoChangeCover).toBe(true);
    });

    it("should use fallback success message if empty", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "postTodoCover").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "cover.jpg");
      await store.asyncSetIsTodoChangeCover(1, dummyFile);

      expect(successSpy).toHaveBeenCalledWith("Cover berhasil diperbarui!");
    });

    it("should show error dialog and set flags on failure", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "postTodoCover").mockRejectedValue(new Error("File corrupt"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "cover.jpg");
      await store.asyncSetIsTodoChangeCover(1, dummyFile);

      expect(errorSpy).toHaveBeenCalledWith("File corrupt");
      expect(store.isTodoChangedCover).toBe(false);
      expect(store.isTodoChangeCover).toBe(true);
    });
  });

  describe("asyncSetIsTodoDelete", () => {
    it("should delete todo, show success dialog, and set flags on success", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "deleteTodo").mockResolvedValue("Todo dihapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsTodoDelete(1);

      expect(successSpy).toHaveBeenCalledWith("Todo dihapus");
      expect(store.isTodoDeleted).toBe(true);
      expect(store.isTodoDelete).toBe(true);
    });

    it("should use fallback success message if empty", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "deleteTodo").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsTodoDelete(1);

      expect(successSpy).toHaveBeenCalledWith("Todo berhasil dihapus!");
    });

    it("should show error dialog and set flags on failure", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "deleteTodo").mockRejectedValue(new Error("Gagal hapus"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsTodoDelete(1);

      expect(errorSpy).toHaveBeenCalledWith("Gagal hapus");
      expect(store.isTodoDeleted).toBe(false);
      expect(store.isTodoDelete).toBe(true);
    });
  });
});
