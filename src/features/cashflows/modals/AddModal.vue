<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    data-testid="add-todo-modal"
    @click.self="onClose"
  >
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 class="text-base font-bold text-slate-900">Tambah Transaksi Baru</h2>
        <button
          type="button"
          data-testid="close-add-modal-btn"
          class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          @click="onClose"
        >
          <X :size="18" />
        </button>
      </div>

      <form class="p-5 space-y-4" @submit.prevent="handleSave">
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Tipe Transaksi
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="py-2.5 rounded-xl text-sm font-semibold border transition-all"
              :class="
                type === 'inflow'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              "
              @click="type = 'inflow'"
            >
              + Pemasukan (Inflow)
            </button>
            <button
              type="button"
              class="py-2.5 rounded-xl text-sm font-semibold border transition-all"
              :class="
                type === 'outflow'
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              "
              @click="type = 'outflow'"
            >
              − Pengeluaran (Outflow)
            </button>
          </div>
        </div>

        <div>
          <label for="cf-source" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Sumber Dana
          </label>
          <select
            id="cf-source"
            v-model="source"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          >
            <option value="cash">Tunai (Cash)</option>
            <option value="savings">Tabungan (Savings)</option>
            <option value="loans">Pinjaman (Loans)</option>
          </select>
        </div>

        <div>
          <label for="cf-label" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Label / Kategori
          </label>
          <input
            id="cf-label"
            v-model="label"
            type="text"
            data-testid="add-todo-title-input"
            placeholder="cth: Gaji, Belanja, Transportasi"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            required
          />
        </div>

        <div>
          <label for="cf-nominal" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Nominal (Rp)
          </label>
          <input
            id="cf-nominal"
            v-model.number="nominal"
            type="number"
            min="0"
            step="1"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            required
          />
        </div>

        <div>
          <label for="cf-desc" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Deskripsi (Opsional)
          </label>
          <textarea
            id="cf-desc"
            v-model="description"
            data-testid="add-todo-description-input"
            rows="3"
            placeholder="Catatan tambahan transaksi..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-y"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            @click="onClose"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-add-todo-btn"
            :disabled="loading"
            class="px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {{ loading ? "Menyimpan..." : "Simpan Transaksi" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { X } from "lucide-vue-next";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const props = withDefaults(defineProps<{ show?: boolean }>(), { show: false });
const emit = defineEmits<{ (e: "close"): void }>();
const store = useCashFlowsStore();

const type = ref<"inflow" | "outflow">("inflow");
const source = ref<"cash" | "savings" | "loans">("cash");
const label = ref("");
const nominal = ref(0);
const description = ref("");
const loading = ref(false);

function onClose() {
  emit("close");
}

watch(
  () => props.show,
  (v) => {
    if (v) {
      type.value = "inflow";
      source.value = "cash";
      label.value = "";
      nominal.value = 0;
      description.value = "";
      loading.value = false;
    }
  }
);

watch(
  () => [store.isCashFlowAdd, store.isCashFlowAdded],
  ([adding, added]) => {
    if (adding) {
      loading.value = false;
      store.setIsCashFlowAdd(false);
      if (added) {
        store.setIsCashFlowAdded(false);
        store.asyncSetCashFlows();
        store.asyncSetLabels();
        onClose();
      }
    }
  }
);

function handleSave() {
  if (!label.value.trim()) {
    showErrorDialog("Label tidak boleh kosong");
    return;
  }
  if (nominal.value < 0 || Number.isNaN(nominal.value)) {
    showErrorDialog("Nominal tidak valid");
    return;
  }
  loading.value = true;
  store.asyncAddCashFlow({
    type: type.value,
    source: source.value,
    label: label.value.trim(),
    description: description.value.trim(),
    nominal: Number(nominal.value),
  });
}
</script>