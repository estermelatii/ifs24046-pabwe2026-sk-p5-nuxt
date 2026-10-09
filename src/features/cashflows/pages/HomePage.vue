<template>
  <div v-if="profile" class="space-y-6 animate-in fade-in duration-300">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ringkasan Arus Kas
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Pantau pendapatan, pengeluaran, dan saldo aset Anda
        </p>
      </div>
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          class="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
          @click="handleResetAll"
        >
          Reset Semua
        </button>
        <button
          type="button"
          data-testid="add-todo-btn"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 transition-all"
          @click="showAddModal = true"
        >
          <Plus :size="18" :stroke-width="2.5" />
          Tambah Transaksi
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Saldo Bersih</p>
        <p class="text-lg font-black text-slate-800 mt-1">{{ formatRp(stats.cashflow) }}</p>
      </div>
      <div class="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-100">
        <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Total Inflow</p>
        <p class="text-lg font-black text-emerald-700 mt-1">{{ formatRp(stats.total_inflow) }}</p>
      </div>
      <div class="bg-rose-50/80 rounded-2xl p-4 border border-rose-100">
        <p class="text-[11px] font-bold uppercase tracking-wider text-rose-600">Total Outflow</p>
        <p class="text-lg font-black text-rose-700 mt-1">{{ formatRp(stats.total_outflow) }}</p>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kas (Cash)</p>
        <p class="text-lg font-black text-slate-800 mt-1">
          {{ formatRp((stats.total_inflow_cash || 0) - (stats.total_outflow_cash || 0)) }}
        </p>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tabungan</p>
        <p class="text-lg font-black text-slate-800 mt-1">
          {{ formatRp((stats.total_inflow_savings || 0) - (stats.total_outflow_savings || 0)) }}
        </p>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pinjaman</p>
        <p class="text-lg font-black text-slate-800 mt-1">
          {{ formatRp((stats.total_inflow_loans || 0) - (stats.total_outflow_loans || 0)) }}
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Transaksi</p>
        <button
          type="button"
          class="text-xs font-semibold text-blue-600 hover:underline"
          @click="resetFilters"
        >
          Reset Filter
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label for="f-type" class="block text-xs font-medium text-slate-500 mb-1">Tipe</label>
          <select
            id="f-type"
            v-model="filters.type"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          >
            <option value="">Semua Tipe</option>
            <option value="inflow">Inflow</option>
            <option value="outflow">Outflow</option>
          </select>
        </div>
        <div>
          <label for="f-source" class="block text-xs font-medium text-slate-500 mb-1">Sumber</label>
          <select
            id="f-source"
            v-model="filters.source"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          >
            <option value="">Semua Sumber</option>
            <option value="cash">Cash</option>
            <option value="savings">Savings</option>
            <option value="loans">Loans</option>
          </select>
        </div>
        <div>
          <label for="f-label" class="block text-xs font-medium text-slate-500 mb-1">Label</label>
          <select
            id="f-label"
            v-model="filters.label"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          >
            <option value="">Semua Label</option>
            <option v-for="l in labels" :key="l" :value="l">{{ l }}</option>
          </select>
        </div>
        <div>
          <label for="f-start" class="block text-xs font-medium text-slate-500 mb-1">Dari Tanggal</label>
          <input
            id="f-start"
            v-model="filters.start_date"
            type="date"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>
        <div>
          <label for="f-end" class="block text-xs font-medium text-slate-500 mb-1">Sampai Tanggal</label>
          <input
            id="f-end"
            v-model="filters.end_date"
            type="date"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>
      </div>
    </div>

    <!-- List -->
    <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 text-xs uppercase tracking-wider font-semibold text-slate-500 border-b">
            <tr>
              <th class="px-4 py-3">Tipe</th>
              <th class="px-4 py-3">Label</th>
              <th class="px-4 py-3 hidden sm:table-cell">Sumber</th>
              <th class="px-4 py-3">Nominal</th>
              <th class="px-4 py-3 hidden md:table-cell">Tanggal</th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                <Loader2 :size="32" class="mx-auto animate-spin text-blue-600 mb-2" />
                Memuat data...
              </td>
            </tr>
            <tr v-else-if="cashFlows.length === 0">
              <td colspan="6" class="px-6 py-14 text-center">
                <p class="font-semibold text-slate-700">Belum ada catatan arus kas</p>
                <p class="text-sm text-slate-400 mt-1 mb-4">
                  Mulai catat transaksi pertama Anda.
                </p>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
                  @click="showAddModal = true"
                >
                  <Plus :size="16" /> Tambah Transaksi
                </button>
              </td>
            </tr>
            <tr
              v-for="item in cashFlows"
              :key="item.id"
              :data-testid="`todo-row-${item.id}`"
              class="hover:bg-slate-50/80"
            >
              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border"
                  :class="
                    item.type === 'inflow'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  "
                >
                  {{ item.type === "inflow" ? "Inflow" : "Outflow" }}
                </span>
              </td>
              <td class="px-4 py-3">
                <p class="font-semibold text-slate-800">{{ item.label }}</p>
                <p v-if="item.description" class="text-xs text-slate-400 line-clamp-1">
                  {{ item.description }}
                </p>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell capitalize text-xs">{{ item.source }}</td>
              <td
                class="px-4 py-3 font-bold"
                :class="item.type === 'inflow' ? 'text-emerald-600' : 'text-rose-600'"
              >
                {{ item.type === "inflow" ? "+" : "-" }}{{ formatRp(item.nominal) }}
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-xs text-slate-500">
                {{ formatDate(item.created_at) }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex gap-1">
                  <button
                    type="button"
                    :data-testid="`edit-todo-${item.id}`"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                    title="Ubah"
                    @click="openEdit(item.id)"
                  >
                    <Pencil :size="17" />
                  </button>
                  <button
                    type="button"
                    :data-testid="`delete-todo-${item.id}`"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                    title="Hapus"
                    @click="handleDelete(item.id)"
                  >
                    <Trash2 :size="17" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AddModal :show="showAddModal" @close="showAddModal = false" />
    <ChangeModal
      :show="showChangeModal"
      :cash-flow-id="selectedId"
      @close="showChangeModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from "vue";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { useUsersStore } from "../../users/states/usersStore";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-vue-next";

const store = useCashFlowsStore();
const usersStore = useUsersStore();

const profile = computed(() => usersStore.profile);
const cashFlows = computed(() => store.cashFlows || []);
const stats = computed(() => store.stats || {});
const labels = computed(() => store.labels || []);

const loading = ref(false);
const showAddModal = ref(false);
const showChangeModal = ref(false);
const selectedId = ref<number | string | null>(null);

const filters = reactive({
  type: "",
  source: "",
  label: "",
  start_date: "",
  end_date: "",
});

function formatRp(n?: number) {
  const val = Number(n || 0);
  return "Rp " + val.toLocaleString("id-ID");
}

function toApiDate(dateStr: string, end = false) {
  if (!dateStr) return "";
  return end ? `${dateStr} 23:59:59` : `${dateStr} 00:00:00`;
}

async function loadData() {
  loading.value = true;
  const params: Record<string, string> = {};
  if (filters.type) params.type = filters.type;
  if (filters.source) params.source = filters.source;
  if (filters.label) params.label = filters.label;
  if (filters.start_date) params.start_date = toApiDate(filters.start_date);
  if (filters.end_date) params.end_date = toApiDate(filters.end_date, true);
  await store.asyncSetCashFlows(params);
  await store.asyncSetLabels();
  loading.value = false;
}

function resetFilters() {
  filters.type = "";
  filters.source = "";
  filters.label = "";
  filters.start_date = "";
  filters.end_date = "";
}

function openEdit(id: number | string) {
  selectedId.value = id;
  showChangeModal.value = true;
}

async function handleDelete(id: number | string) {
  const res = await showConfirmDialog("Hapus transaksi ini?");
  if (res.isConfirmed) {
    await store.asyncDeleteCashFlow(id);
    loadData();
  }
}

async function handleResetAll() {
  const res = await showConfirmDialog("Hapus SEMUA transaksi? Tindakan ini tidak bisa dibatalkan.");
  if (res.isConfirmed) {
    await store.asyncDeleteAll();
    loadData();
  }
}

onMounted(loadData);
watch(filters, loadData, { deep: true });
watch(
  () => [store.isCashFlowDeleted, store.isCashFlowAdded, store.isCashFlowChanged],
  () => loadData()
);
</script>