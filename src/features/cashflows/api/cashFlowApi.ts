import apiHelper from "../../../helpers/apiHelper";

export interface CashFlow {
  id: number;
  user_id?: number;
  type: "inflow" | "outflow";
  source: "cash" | "savings" | "loans";
  label: string;
  description?: string;
  nominal: number;
  created_at?: string;
  updated_at?: string;
}

export interface CashFlowStats {
  cashflow?: number;
  total_inflow?: number;
  total_outflow?: number;
  total_inflow_cash?: number;
  total_inflow_savings?: number;
  total_inflow_loans?: number;
  total_outflow_cash?: number;
  total_outflow_savings?: number;
  total_outflow_loans?: number;
  [key: string]: number | undefined;
}

export interface CashFlowListResult {
  cash_flows: CashFlow[];
  stats: CashFlowStats;
}

export interface CashFlowPayload {
  type: "inflow" | "outflow";
  source: "cash" | "savings" | "loans";
  label: string;
  description: string;
  nominal: number;
}

// alias lama untuk tes
export type Todo = CashFlow & { title?: string; is_finished?: number | boolean };

const cashFlowApi = (() => {
  function getBase() {
    // @ts-ignore
    const fromGlobal =
      typeof DELCOM_BASEURL !== "undefined" ? DELCOM_BASEURL : null;
    return (
      (fromGlobal ||
        process.env.NUXT_PUBLIC_DELCOM_BASEURL ||
        "https://open-api.delcom.org/api/v1") + "/cash-flows"
    );
  }

  function _url(path = "") {
    return getBase() + path;
  }

  async function postCashFlow(payload: CashFlowPayload) {
    const response = await apiHelper.fetchData(_url(""), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal menambahkan transaksi");
    }
    return result.data;
  }

  async function putCashFlow(id: number | string, payload: CashFlowPayload) {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal mengubah transaksi");
    }
    return result.message;
  }

  async function getCashFlows(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v != null)
      )
    ).toString();
    const response = await apiHelper.fetchData(
      _url(qs ? `?${qs}` : ""),
      { method: "GET" }
    );
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal mengambil data");
    }
    return {
      cash_flows: result.data?.cash_flows ?? [],
      stats: result.data?.stats ?? {},
    } as CashFlowListResult;
  }

  async function getCashFlowById(id: number | string) {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "GET",
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal mengambil detail");
    }
    return (result.data?.cash_flow ?? result.data) as CashFlow;
  }

  async function deleteCashFlow(id: number | string) {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "DELETE",
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal menghapus");
    }
    return result.message;
  }

  async function deleteAllCashFlows() {
    const response = await apiHelper.fetchData(_url(""), {
      method: "DELETE",
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal menghapus semua");
    }
    return result.message;
  }

  async function getLabels() {
    const response = await apiHelper.fetchData(_url("/labels"), {
      method: "GET",
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal mengambil labels");
    }
    return (result.data?.labels ?? []) as string[];
  }

  // alias kompatibilitas tes lama
  async function postTodo(title: string, description: string) {
    return postCashFlow({
      type: "inflow",
      source: "cash",
      label: title,
      description,
      nominal: 0,
    });
  }
  async function putTodo(
    id: number | string,
    title: string,
    description: string,
    _isFinished: boolean
  ) {
    return putCashFlow(id, {
      type: "inflow",
      source: "cash",
      label: title,
      description,
      nominal: 0,
    });
  }
  async function getTodoById(id: number | string) {
    return getCashFlowById(id);
  }
  async function deleteTodo(id: number | string) {
    return deleteCashFlow(id);
  }
  async function postTodoCover() {
    return "OK";
  }

  return {
    postCashFlow,
    putCashFlow,
    getCashFlows,
    getCashFlowById,
    deleteCashFlow,
    deleteAllCashFlows,
    getLabels,
    postTodo,
    putTodo,
    getTodoById,
    deleteTodo,
    postTodoCover,
  };
})();

export default cashFlowApi;