import { describe, it, expect, vi, beforeEach } from "vitest";
import cashFlowApi from "./cashFlowApi";
import apiHelper from "../../../helpers/apiHelper";

describe("cashFlowApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postTodo", () => {
    it("should create new todo and return data", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { todo_id: 10 },
        }),
      } as any);

      const res = await cashFlowApi.postTodo("Title", "Description");
      expect(res).toEqual({ todo_id: 10 });
    });

    it("should throw error if creation fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
        }),
      } as any);

      await expect(cashFlowApi.postTodo("", "")).rejects.toThrow("Data tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      } as any);

      await expect(cashFlowApi.postTodo("", "")).rejects.toThrow("Gagal menambahkan todo");
    });
  });

  describe("postTodoCover", () => {
    it("should upload cover with FormData and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah cover",
        }),
      } as any);

      const dummyFile = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      const msg = await cashFlowApi.postTodoCover(1, dummyFile);
      expect(msg).toBe("Berhasil mengubah cover");
    });

    it("should handle cover file without name property properly", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil",
        }),
      } as any);

      const dummyBlob = new Blob(["dummy"], { type: "image/jpeg" });
      const msg = await cashFlowApi.postTodoCover(1, dummyBlob);
      expect(msg).toBe("Berhasil");
    });

    it("should throw error on upload cover fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Format tidak didukung",
        }),
      } as any);

      const dummyFile = new File(["dummy"], "cover.jpg");
      await expect(cashFlowApi.postTodoCover(1, dummyFile)).rejects.toThrow(
        "Format tidak didukung"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      } as any);

      const dummyFile = new File(["dummy"], "cover.jpg");
      await expect(cashFlowApi.postTodoCover(1, dummyFile)).rejects.toThrow(
        "Gagal mengubah cover"
      );
    });
  });

  describe("putTodo", () => {
    it("should update todo and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah data",
        }),
      } as any);

      const msg = await cashFlowApi.putTodo(1, "Updated", "Desc", true);
      expect(msg).toBe("Berhasil mengubah data");
    });

    it("should correctly handle boolean false for is_finished", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah data",
        }),
      } as any);

      const msg = await cashFlowApi.putTodo(1, "Updated", "Desc", false);
      expect(msg).toBe("Berhasil mengubah data");
    });

    it("should throw error on update failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal update todo",
        }),
      } as any);

      await expect(cashFlowApi.putTodo(1, "", "", false)).rejects.toThrow("Gagal update todo");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      } as any);

      await expect(cashFlowApi.putTodo(1, "", "", false)).rejects.toThrow("Gagal mengubah todo");
    });
  });

  describe("getCashFlows", () => {
    it("should fetch all cashFlows without filter", async () => {
      const mockCashFlows = [{ id: 1, title: "Todo 1", description: "desc", is_finished: 0 }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { cashFlows: mockCashFlows },
        }),
      } as any);

      const cashFlows = await cashFlowApi.getCashFlows();
      expect(cashFlows).toEqual(mockCashFlows);
    });

    it("should fetch filtered cashFlows when is_finished parameter provided", async () => {
      const mockCashFlows = [{ id: 2, title: "Todo 2", description: "desc", is_finished: 1 }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { cashFlows: mockCashFlows },
        }),
      } as any);

      const cashFlows = await cashFlowApi.getCashFlows("1");
      expect(cashFlows).toEqual(mockCashFlows);
    });

    it("should return empty array if data.cashFlows is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: {},
        }),
      } as any);

      const cashFlows = await cashFlowApi.getCashFlows();
      expect(cashFlows).toEqual([]);
    });

    it("should throw error on fetch cashFlows fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Akses tidak diizinkan",
        }),
      } as any);

      await expect(cashFlowApi.getCashFlows()).rejects.toThrow("Akses tidak diizinkan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      } as any);

      await expect(cashFlowApi.getCashFlows()).rejects.toThrow("Gagal mengambil data todo");
    });
  });

  describe("getTodoById", () => {
    it("should return single todo object on success", async () => {
      const mockTodo = { id: 5, title: "Single", description: "desc", is_finished: 0 };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { todo: mockTodo },
        }),
      } as any);

      const res = await cashFlowApi.getTodoById(5);
      expect(res).toEqual(mockTodo);
    });

    it("should throw error on detail fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Todo tidak ditemukan",
        }),
      } as any);

      await expect(cashFlowApi.getTodoById(999)).rejects.toThrow("Todo tidak ditemukan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      } as any);

      await expect(cashFlowApi.getTodoById(999)).rejects.toThrow("Gagal mengambil detail todo");
    });
  });

  describe("deleteTodo", () => {
    it("should delete todo and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus data",
        }),
      } as any);

      const msg = await cashFlowApi.deleteTodo(1);
      expect(msg).toBe("Berhasil menghapus data");
    });

    it("should throw error on delete fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal menghapus",
        }),
      } as any);

      await expect(cashFlowApi.deleteTodo(1)).rejects.toThrow("Gagal menghapus");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      } as any);

      await expect(cashFlowApi.deleteTodo(1)).rejects.toThrow("Gagal menghapus todo");
    });
  });
});
