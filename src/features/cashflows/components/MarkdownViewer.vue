<template>
  <div
    ref="viewerEl"
    data-testid="markdown-viewer"
    class="toast-viewer-host prose max-w-none text-sm text-slate-800"
  >
    <div v-if="!ready" class="text-sm text-slate-500">{{ content || "" }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps<{
  content?: string;
}>();

const viewerEl = ref<HTMLElement | null>(null);
const ready = ref(false);
let viewer: any = null;

onMounted(async () => {
  if (!viewerEl.value || typeof window === "undefined") {
    ready.value = true;
    return;
  }
  try {
    const Viewer = (
      await import("@toast-ui/editor/dist/toastui-editor-viewer")
    ).default;
    await import("@toast-ui/editor/dist/toastui-editor-viewer.css");
    viewer = new Viewer({
      el: viewerEl.value,
      initialValue: props.content || "",
    });
    ready.value = true;
  } catch {
    ready.value = true;
  }
});

watch(
  () => props.content,
  (val) => {
    if (viewer) {
      viewer.setMarkdown(val || "");
    }
  }
);

onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
});
</script>