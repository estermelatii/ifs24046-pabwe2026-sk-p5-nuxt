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
    // alias tes lama
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
      this.cashFlows = list;
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

    async asyncSetCashFlows(params: Record<string, string> = {}) {
      this.isLoading = true;
      try {
        const data = await cashFlowApi.getCashFlows(params);
        this.setCashFlows(data.cash_flows);
        this.setStats(data.stats);
      } catch {
        this.setCashFlows([]);
        this.setStats({});
      } finally {
        this.isLoading = false;
      }
    },

    async asyncSetLabels() {
      try {
        const labels = await cashFlowApi.getLabels();
        this.setLabels(labels);
      } catch {
        this.setLabels([]);
      }
    },

    async asyncSetCashFlow(id: number | string) {
      try {
        const item = await cashFlowApi.getCashFlowById(id);
        this.setCashFlow(item);
      } catch {
        this.setCashFlow(null);
      } finally {
        this.setIsTodo(true);
      }
    },

    async asyncSetTodo(id: number | string) {
      return this.asyncSetCashFlow(id);
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
      return this.asyncAddCashFlow({
        type: "inflow",
        source: "cash",
        label: title,
        description,
        nominal: 0,
      });
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
      _finished: number
    ) {
      return this.asyncUpdateCashFlow(id, {
        type: "inflow",
        source: "cash",
        label: title,
        description,
        nominal: 0,
      });
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
      return this.asyncDeleteCashFlow(id);
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

    async asyncSetIsTodoChangeCover() {
      this.setIsTodoChangeCover(true);
      this.setIsTodoChangedCover(true);
    },
  },
});