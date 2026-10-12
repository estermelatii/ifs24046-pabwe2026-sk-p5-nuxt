import { defineStore } from "pinia";
import cashFlowApi, {
  type CashFlow,
  type CashFlowStats,
  type CashFlowPayload,
} from "../api/cashFlowApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export const useCashFlowsStore = defineStore("cashFlows", {
  state: () => ({
    cashFlows: [] as CashFlow[],
    stats: {} as CashFlowStats,
    labels: [] as string[],
    cashFlow: null as CashFlow | null,
    isLoading: false,
    isCashFlow: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    todo: null as CashFlow | null,
    isTodo: false,
    isTodoAdd: false,
    isTodoAdded: false,
    isTodoChange: false,
    isTodoChanged: false,
    isTodoChangeCover: false,
    isTodoChangedCover: false,
    isTodoDelete: false,
    isTodoDeleted: false,
  }),
  actions: {
    setCashFlows(list: CashFlow[]) {
      this.cashFlows = list || [];
    },
    setStats(stats: CashFlowStats) {
      this.stats = stats || {};
    },
    setLabels(labels: string[]) {
      this.labels = labels || [];
    },
    setCashFlow(item: CashFlow | null) {
      this.cashFlow = item;
      this.todo = item;
    },
    setTodo(item: CashFlow | null) {
      this.todo = item;
      this.cashFlow = item;
    },
    setIsCashFlowAdd(v: boolean) {
      this.isCashFlowAdd = v;
      this.isTodoAdd = v;
    },
    setIsCashFlowAdded(v: boolean) {
      this.isCashFlowAdded = v;
      this.isTodoAdded = v;
    },
    setIsCashFlowChange(v: boolean) {
      this.isCashFlowChange = v;
      this.isTodoChange = v;
    },
    setIsCashFlowChanged(v: boolean) {
      this.isCashFlowChanged = v;
      this.isTodoChanged = v;
    },
    setIsCashFlowDelete(v: boolean) {
      this.isCashFlowDelete = v;
      this.isTodoDelete = v;
    },
    setIsCashFlowDeleted(v: boolean) {
      this.isCashFlowDeleted = v;
      this.isTodoDeleted = v;
    },
    setIsTodo(v: boolean) {
      this.isTodo = v;
      this.isCashFlow = v;
    },
    setIsTodoAdd(v: boolean) {
      this.setIsCashFlowAdd(v);
    },
    setIsTodoAdded(v: boolean) {
      this.setIsCashFlowAdded(v);
    },
    setIsTodoChange(v: boolean) {
      this.setIsCashFlowChange(v);
    },
    setIsTodoChanged(v: boolean) {
      this.setIsCashFlowChanged(v);
    },
    setIsTodoDelete(v: boolean) {
      this.setIsCashFlowDelete(v);
    },
    setIsTodoDeleted(v: boolean) {
      this.setIsCashFlowDeleted(v);
    },
    setIsTodoChangeCover(v: boolean) {
      this.isTodoChangeCover = v;
    },
    setIsTodoChangedCover(v: boolean) {
      this.isTodoChangedCover = v;
    },

    async asyncSetCashFlows(is_finished?: string | number | boolean) {
      try {
        const list = await cashFlowApi.getCashFlows(is_finished as any);
        this.setCashFlows(Array.isArray(list) ? list : []);
      } catch {
        this.setCashFlows([]);
      }
    },

    async asyncSetCashFlow(id: number | string) {
      try {
        const item = await cashFlowApi.getCashFlowById(id);
        this.setCashFlow(item);
        this.setIsTodo(true);
      } catch {
        this.setCashFlow(null);
        this.setIsTodo(true);
      }
    },

    async asyncSetTodo(id: number | string) {
      try {
        const item = await cashFlowApi.getTodoById(id);
        this.setTodo(item);
        this.setIsTodo(true);
      } catch {
        this.setTodo(null);
        this.setIsTodo(true);
      }
    },

    async asyncAddCashFlow(payload: CashFlowPayload) {
      try {
        await cashFlowApi.postCashFlow(payload);
        showSuccessDialog("Transaksi berhasil ditambahkan!");
        this.setIsCashFlowAdded(true);
      } catch (e: any) {
        showErrorDialog(e?.message || "Gagal menambah transaksi");
        this.setIsCashFlowAdded(false);
      } finally {
        this.setIsCashFlowAdd(true);
      }
    },

    async asyncSetIsTodoAdd(title: string, description: string) {
      try {
        await cashFlowApi.postTodo(title, description);
        showSuccessDialog("Todo berhasil ditambahkan!");
        this.setIsTodoAdded(true);
      } catch (e: any) {
        showErrorDialog(e?.message || "Gagal menambah todo");
        this.setIsTodoAdded(false);
      } finally {
        this.setIsTodoAdd(true);
      }
    },

    async asyncUpdateCashFlow(id: number | string, payload: CashFlowPayload) {
      try {
        const msg = await cashFlowApi.putCashFlow(id, payload);
        showSuccessDialog(msg || "Transaksi berhasil diubah!");
        this.setIsCashFlowChanged(true);
      } catch (e: any) {
        showErrorDialog(e?.message || "Gagal mengubah transaksi");
        this.setIsCashFlowChanged(false);
      } finally {
        this.setIsCashFlowChange(true);
      }
    },

    async asyncSetIsTodoChange(
      id: number | string,
      title: string,
      description: string,
      finished: number | boolean
    ) {
      try {
        const msg = await cashFlowApi.putTodo(
          id,
          title,
          description,
          Boolean(finished)
        );
        showSuccessDialog(msg || "Todo berhasil diperbarui!");
        this.setIsTodoChanged(true);
      } catch (e: any) {
        showErrorDialog(e?.message || "Gagal mengubah todo");
        this.setIsTodoChanged(false);
      } finally {
        this.setIsTodoChange(true);
      }
    },

    async asyncDeleteCashFlow(id: number | string) {
      try {
        const msg = await cashFlowApi.deleteCashFlow(id);
        showSuccessDialog(msg || "Transaksi dihapus!");
        this.setIsCashFlowDeleted(true);
      } catch (e: any) {
        showErrorDialog(e?.message || "Gagal menghapus");
        this.setIsCashFlowDeleted(false);
      } finally {
        this.setIsCashFlowDelete(true);
      }
    },

    async asyncSetIsTodoDelete(id: number | string) {
      try {
        const msg = await cashFlowApi.deleteTodo(id);
        showSuccessDialog(msg || "Todo berhasil dihapus!");
        this.setIsTodoDeleted(true);
      } catch (e: any) {
        showErrorDialog(e?.message || "Gagal menghapus todo");
        this.setIsTodoDeleted(false);
      } finally {
        this.setIsTodoDelete(true);
      }
    },

    async asyncSetIsTodoChangeCover(
      id: number | string,
      cover: File | Blob
    ) {
      try {
        const msg = await cashFlowApi.postTodoCover(id, cover);
        showSuccessDialog(msg || "Cover berhasil diperbarui!");
        this.setIsTodoChangedCover(true);
      } catch (e: any) {
        showErrorDialog(e?.message || "Gagal mengubah cover");
        this.setIsTodoChangedCover(false);
      } finally {
        this.setIsTodoChangeCover(true);
      }
    },

    async asyncDeleteAll() {
      try {
        const msg = await cashFlowApi.deleteAllCashFlows();
        showSuccessDialog(msg || "Semua data dihapus!");
        await this.asyncSetCashFlows();
      } catch (e: any) {
        showErrorDialog(e?.message || "Gagal menghapus semua");
      }
    },
  },
});