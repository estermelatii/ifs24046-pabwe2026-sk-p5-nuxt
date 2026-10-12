<template>
  <div
    ref="viewerEl"
    data-testid="markdown-viewer"
    class="toast-viewer-host prose max-w-none text-sm text-slate-800"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";

const props = defineProps<{
  content?: string;
}>();

const viewerEl = ref<HTMLElement | null>(null);
let viewer: any = null;

onMounted(() => {
  if (!viewerEl.value) return;
  try {
    viewer = new Viewer({
      el: viewerEl.value,
      initialValue: props.content || "",
    });
  } catch {
    // ignore
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