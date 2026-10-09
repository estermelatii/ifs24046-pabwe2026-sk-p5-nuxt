<template>
  <div v-if="!profile || !todo" class="flex flex-col items-center justify-center py-20">
    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>

  <div v-else class="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
    <!-- Back button & Action buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <RouterLink
        to="/"
        data-testid="back-to-cashFlows-link"
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft :size="18" />
        Kembali ke Todo
      </RouterLink>

      <div class="flex items-center gap-2">
        <button
          type="button"
          data-testid="edit-cover-btn"
          @click="showCoverModal = true"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
        >
          <ImagePlus :size="16" />
          Ubah Cover
        </button>
        <button
          type="button"
          data-testid="edit-detail-todo-btn"
          @click="showEditModal = true"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
        >
          <Edit3 :size="16" />
          Ubah Data
        </button>
        <button
          type="button"
          data-testid="delete-detail-todo-btn"
          @click="handleDelete"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
        >
          <Trash2 :size="16" />
          Hapus
        </button>
      </div>
    </div>

    <!-- Main Detail Card -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div v-if="todo.cover" class="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
        <img
          :src="todo.cover"
          :alt="todo.title"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
      </div>

      <div class="p-6 sm:p-8 space-y-6">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="font-mono text-xs font-bold text-slate-400">
              #{{ todo.id }}
            </span>
            <span
              v-if="todo.is_finished"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <CheckCircle2 :size="14" />
              Selesai
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
            >
              <Clock :size="14" />
              Sedang Proses
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ todo.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <div class="flex items-center gap-1.5">
              <Calendar :size="14" class="shrink-0" />
              <span>Dibuat: <strong class="text-slate-500">{{ formatDate(todo.created_at) }}</strong></span>
            </div>
            <div class="flex items-center gap-1.5">
              <Calendar :size="14" class="shrink-0" />
              <span>Diperbarui: <strong class="text-slate-500">{{ formatDate(todo.updated_at) }}</strong></span>
            </div>
          </div>
        </div>

        <div
          data-testid="todo-detail-description"
          class="prose max-w-none text-slate-600 bg-slate-50/60 p-6 rounded-2xl border border-slate-100 leading-relaxed"
        >
          <MarkdownViewer v-if="todo.description" :content="todo.description" />
          <p v-else class="italic text-slate-400">Tidak ada deskripsi rinci untuk todo ini.</p>
        </div>
      </div>
    </div>

    <!-- Cover Modal -->
    <ChangeCoverModal
      :show="showCoverModal"
      :todo="todo"
      @close="showCoverModal = false"
    />

    <!-- Edit Modal -->
    <ChangeModal
      :show="showEditModal"
      :todo-id="todo.id"
      @close="showEditModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import MarkdownViewer from "../components/MarkdownViewer.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { useUsersStore } from "../../users/states/usersStore";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import {
  ArrowLeft,
  ImagePlus,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const cashFlowsStore = useCashFlowsStore();
const usersStore = useUsersStore();

const cashFlowId = computed(() => route.params.cashFlowId as string);
const profile = computed(() => usersStore.profile);
const todo = computed(() => cashFlowsStore.todo);
const isTodo = computed(() => cashFlowsStore.isTodo);
const isTodoDeleted = computed(() => cashFlowsStore.isTodoDeleted);

const showCoverModal = ref(false);
const showEditModal = ref(false);

onMounted(() => {
  if (cashFlowId.value) {
    cashFlowsStore.asyncSetTodo(cashFlowId.value);
  }
});

watch(cashFlowId, (newId) => {
  if (newId) {
    cashFlowsStore.asyncSetTodo(newId);
  }
});

watch(
  () => [isTodo.value, todo.value],
  ([isT, t]) => {
    if (isT) {
      cashFlowsStore.setIsTodo(false);
      if (!t) {
        router.push("/");
      }
    }
  }
);

watch(isTodoDeleted, (isDel) => {
  if (isDel) {
    cashFlowsStore.setIsTodoDeleted(false);
    router.push("/");
  }
});

async function handleDelete() {
  const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus todo ini?");
  if (result.isConfirmed && todo.value) {
    cashFlowsStore.asyncSetIsTodoDelete(todo.value.id);
  }
}
</script>
