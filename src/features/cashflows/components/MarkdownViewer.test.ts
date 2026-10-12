import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";

const h = vi.hoisted(() => ({
  Viewer: vi.fn(),
  setMarkdown: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock("@toast-ui/editor/dist/toastui-editor-viewer", () => ({ default: h.Viewer }));
vi.mock("@toast-ui/editor/dist/toastui-editor-viewer.css", () => ({}));

import MarkdownViewer from "./MarkdownViewer.vue";

function workingViewer() {
  h.Viewer.mockImplementation(function (this: any) {
    this.setMarkdown = h.setMarkdown;
    this.destroy = h.destroy;
  });
}

function brokenViewer() {
  h.Viewer.mockImplementation(function () {
    throw new Error("gagal");
  });
}

describe("MarkdownViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    workingViewer();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("membuat viewer dengan konten awal", async () => {
    const wrapper = mount(MarkdownViewer, { props: { content: "# Halo" } });
    expect(wrapper.text()).toContain("# Halo");

    await vi.waitFor(() => expect(h.Viewer).toHaveBeenCalledTimes(1));
    await flushPromises();

    expect(h.Viewer.mock.calls[0][0]).toMatchObject({ initialValue: "# Halo" });
    expect(wrapper.text()).toBe("");
  });

  it("memakai string kosong bila konten tidak diberikan", async () => {
    const wrapper = mount(MarkdownViewer);
    expect(wrapper.text()).toBe("");

    await vi.waitFor(() => expect(h.Viewer).toHaveBeenCalledTimes(1));
    await flushPromises();

    expect(h.Viewer.mock.calls[0][0]).toMatchObject({ initialValue: "" });
  });

  it("memperbarui markdown saat konten berubah", async () => {
    const wrapper = mount(MarkdownViewer, { props: { content: "a" } });
    await vi.waitFor(() => expect(h.Viewer).toHaveBeenCalled());
    await flushPromises();

    await wrapper.setProps({ content: "baru" });
    expect(h.setMarkdown).toHaveBeenCalledWith("baru");

    await wrapper.setProps({ content: undefined });
    expect(h.setMarkdown).toHaveBeenLastCalledWith("");
  });

  it("menghancurkan viewer saat unmount", async () => {
    const wrapper = mount(MarkdownViewer, { props: { content: "a" } });
    await vi.waitFor(() => expect(h.Viewer).toHaveBeenCalled());
    await flushPromises();

    wrapper.unmount();
    expect(h.destroy).toHaveBeenCalledTimes(1);
  });

  it("tetap aman bila viewer gagal dibuat", async () => {
    brokenViewer();
    const wrapper = mount(MarkdownViewer, { props: { content: "a" } });
    await vi.waitFor(() => expect(h.Viewer).toHaveBeenCalled());
    await flushPromises();

    await wrapper.setProps({ content: "x" });
    expect(h.setMarkdown).not.toHaveBeenCalled();

    wrapper.unmount();
    expect(h.destroy).not.toHaveBeenCalled();
  });

});
