import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";

vi.mock("@toast-ui/editor", () => ({
  default: { factory: vi.fn(() => ({ destroy: vi.fn(), setMarkdown: vi.fn() })) },
}));
vi.mock("@toast-ui/editor/dist/toastui-editor-viewer", () => ({
  default: vi.fn(() => ({ destroy: vi.fn(), setMarkdown: vi.fn() })),
}));

import MarkdownViewer from "./MarkdownViewer.vue";

describe("MarkdownViewer", () => {
  it("should render viewer host", () => {
    const wrapper = mount(MarkdownViewer, { props: { content: "# Halo" } });
    expect(wrapper.find('[data-testid="markdown-viewer"]').exists()).toBe(true);
  });
});
