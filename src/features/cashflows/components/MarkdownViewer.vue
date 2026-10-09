<template>
  <ClientOnly>
    <div ref="viewerEl" class="toast-viewer-host prose max-w-none" />
    <template #fallback>
      <div class="text-sm text-slate-500">Memuat konten...</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps<{
  content?: string;
}>();

const viewerEl = ref<HTMLElement | null>(null);
let viewer: any = null;

onMounted(async () => {
  if (!viewerEl.value) return;
  const Viewer = (await import("@toast-ui/editor/dist/toastui-editor-viewer"))
    .default;
  await import("@toast-ui/editor/dist/toastui-editor-viewer.css");

  viewer = new Viewer({
    el: viewerEl.value,
    initialValue: props.content || "",
  });
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