<template>
  <div
    v-if="show"
    data-testid="edit-todo-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    @click.self="onClose"
  >
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 class="text-base font-bold text-slate-900">Ubah Transaksi</h2>
        <button
          type="button"
          data-testid="close-edit-modal-btn"
          class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          @click="onClose"
        >
          <X :size="18" />
        </button>
      </div>

      <form class="p-5 space-y-4" @submit.prevent="handleSave">
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipe</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="py-2.5 rounded-xl text-sm font-semibold border"
              :class="type === 'inflow' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'border-slate-200 text-slate-600'"
              @click="type = 'inflow'"
            >
              + Inflow
            </button>
            <button
              type="button"
              class="py-2.5 rounded-xl text-sm font-semibold border"
              :class="type === 'outflow' ? 'bg-rose-50 text-rose-700 border-rose-300' : 'border-slate-200 text-slate-600'"
              @click="type = 'outflow'"
            >
              − Outflow
            </button>
          </div>
        </div>

        <div>
          <label for="edit-source" class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sumber</label>
          <select
            id="edit-source"
            v-model="source"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
          >
            <option value="cash">Tunai (Cash)</option>
            <option value="savings">Tabungan (Savings)</option>
            <option value="loans">Pinjaman (Loans)</option>
          </select>
        </div>

        <div>
          <label for="edit-todo-title-input" class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Label</label>
          <input
            id="edit-todo-title-input"
            v-model="label"
            type="text"
            data-testid="edit-todo-title-input"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            required
          />
        </div>

        <div>
          <label for="edit-nominal" class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nominal (Rp)</label>
          <input
            id="edit-nominal"
            v-model.number="nominal"
            type="number"
            min="0"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            required
          />
        </div>

        <div>
          <label for="edit-todo-description-input" class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Deskripsi</label>
          <textarea
            id="edit-todo-description-input"
            v-model="description"
            data-testid="edit-todo-description-input"
            rows="3"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div class="flex justify-end gap-2 pt-1">
          <button type="button" class="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100" @click="onClose">
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-edit-todo-btn"
            :disabled="loading"
            class="px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {{ loading ? "Menyimpan..." : "Simpan" }}
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

const props = withDefaults(
  defineProps<{
    show?: boolean;
    cashFlowId?: number | string | null;
    todoId?: number | string | null;
  }>(),
  { show: false, cashFlowId: null, todoId: null }
);

const emit = defineEmits<{ (e: "close"): void }>();
const store = useCashFlowsStore();

const type = ref<"inflow" | "outflow">("inflow");
const source = ref<"cash" | "savings" | "loans">("cash");
const label = ref("");
const nominal = ref(0);
const description = ref("");
const loading = ref(false);

const activeId = () => props.cashFlowId ?? props.todoId;

function onClose() {
  emit("close");
}

function sync() {
  const item = store.cashFlow || store.todo;
  if (item && props.show) {
    type.value = (item.type as any) || "inflow";
    source.value = (item.source as any) || "cash";
    label.value = item.label || (item as any).title || "";
    nominal.value = Number(item.nominal || 0);
    description.value = item.description || "";
  }
}

watch(
  () => [activeId(), props.show],
  ([id, show]) => {
    if (id && show) store.asyncSetCashFlow(id as string | number);
  }
);

watch(() => [store.cashFlow, store.todo, props.show], sync, {
  immediate: true,
  deep: true,
});

watch(
  () => [store.isCashFlowChange, store.isCashFlowChanged],
  ([changing, changed]) => {
    if (changing) {
      loading.value = false;
      store.setIsCashFlowChange(false);
      if (changed) {
        store.setIsCashFlowChanged(false);
        store.asyncSetCashFlows();
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
  loading.value = true;
  store.asyncUpdateCashFlow(activeId() as string | number, {
    type: type.value,
    source: source.value,
    label: label.value.trim(),
    description: description.value.trim(),
    nominal: Number(nominal.value),
  });
}
</script>