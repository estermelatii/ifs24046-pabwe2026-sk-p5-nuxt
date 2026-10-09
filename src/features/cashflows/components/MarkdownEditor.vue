<template>
  <div class="w-full">
    <textarea
      v-if="useFallback"
      :id="textareaId"
      :data-testid="textareaTestId"
      :value="modelValue"
      :placeholder="placeholder"
      :style="{ minHeight: height === '100%' ? '240px' : height }"
      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-y"
      @input="onTextareaInput"
    />
    <div
      v-show="!useFallback"
      ref="editorEl"
      class="toast-editor-host w-full min-h-[220px] border border-slate-200 rounded-xl overflow-hidden bg-white"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    initialValue?: string;
    placeholder?: string;
    height?: string;
    textareaTestId?: string;
    textareaId?: string;
  }>(),
  {
    modelValue: "",
    initialValue: "",
    placeholder: "Tulis deskripsi...",
    height: "240px",
    textareaTestId: "markdown-editor-textarea",
    textareaId: "markdown-editor",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
}>();

const editorEl = ref<HTMLElement | null>(null);
const useFallback = ref(false);
let editor: any = null;

function emitValue(val: string) {
  emit("update:modelValue", val);
  emit("change", val);
}

function onTextareaInput(e: Event) {
  const val = (e.target as HTMLTextAreaElement).value;
  emitValue(val);
}

onMounted(async () => {
  await nextTick();
  // Hanya di client
  if (typeof window === "undefined" || !editorEl.value) {
    useFallback.value = true;
    return;
  }

  try {
    const Editor = (await import("@toast-ui/editor")).default;
    await import("@toast-ui/editor/dist/toastui-editor.css");

    editor = new Editor({
      el: editorEl.value,
      height: props.height === "100%" ? "280px" : props.height,
      initialEditType: "wysiwyg",
      previewStyle: "tab",
      placeholder: props.placeholder,
      initialValue: props.modelValue || props.initialValue || "",
    });

    editor.on("change", () => {
      emitValue(editor.getMarkdown());
    });
  } catch {
    useFallback.value = true;
  }
});

watch(
  () => props.modelValue,
  (val) => {
    if (editor && typeof val === "string" && val !== editor.getMarkdown()) {
      editor.setMarkdown(val);
    }
  }
);

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy();
    editor = null;
  }
});

defineExpose({
  getMarkdown: () =>
    editor ? editor.getMarkdown() : props.modelValue || "",
  setMarkdown: (v: string) => {
    if (editor) editor.setMarkdown(v || "");
  },
});
</script>