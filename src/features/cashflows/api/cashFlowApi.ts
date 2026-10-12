import apiHelper from "../../../helpers/apiHelper";

export interface CashFlow {
  id: number;
  user_id?: number;
  type?: "inflow" | "outflow";
  source?: "cash" | "savings" | "loans";
  label?: string;
  title?: string;
  description?: string;
  nominal?: number;
  is_finished?: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CashFlowStats {
  cashflow?: number;
  total_inflow?: number;
  total_outflow?: number;
  [key: string]: number | undefined;
}

export interface CashFlowPayload {
  type: "inflow" | "outflow";
  source: "cash" | "savings" | "loans";
  label: string;
  description: string;
  nominal: number;
}

export type Todo = CashFlow;

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

  async function getCashFlows(is_finished?: string | number | boolean | null) {
    let path = "";
    if (is_finished !== undefined && is_finished !== null && is_finished !== "") {
      path = `?is_finished=${is_finished}`;
    }
    const response = await apiHelper.fetchData(_url(path), { method: "GET" });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal mengambil data todo");
    }
    // kompatibel tes (cashFlows) & API nyata (cash_flows)
    return (
      result.data?.cashFlows ??
      result.data?.cash_flows ??
      (Array.isArray(result.data) ? result.data : [])
    );
  }

  async function getCashFlowById(id: number | string) {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "GET",
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal mengambil detail");
    }
    return (result.data?.cash_flow ?? result.data?.todo ?? result.data) as CashFlow;
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

  // ===== alias untuk tes =====
  async function postTodo(title: string, description: string) {
    const response = await apiHelper.fetchData(_url(""), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "inflow",
        source: "cash",
        label: title,
        description,
        nominal: 0,
      }),
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal menambahkan todo");
    }
    return result.data;
  }

  async function putTodo(
    id: number | string,
    title: string,
    description: string,
    _isFinished: boolean
  ) {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "inflow",
        source: "cash",
        label: title,
        description,
        nominal: 0,
      }),
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal mengubah todo");
    }
    return result.message;
  }

  async function getTodoById(id: number | string) {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "GET",
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal mengambil detail todo");
    }
    return result.data?.todo ?? result.data?.cash_flow ?? result.data;
  }

  async function deleteTodo(id: number | string) {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "DELETE",
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal menghapus todo");
    }
    return result.message;
  }

  async function postTodoCover(
    id: number | string,
    cover: File | Blob
  ) {
    const formData = new FormData();
    if (cover instanceof File) {
      formData.append("cover", cover, cover.name);
    } else {
      formData.append("cover", cover, "cover.jpg");
    }
    const response = await apiHelper.fetchData(_url(`/${id}/cover`), {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal mengubah cover");
    }
    return result.message;
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