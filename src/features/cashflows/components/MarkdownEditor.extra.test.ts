import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

const h = vi.hoisted(() => ({
  mode: "normal" as "normal" | "nogetter" | "throw",
  options: null as any,
  setMarkdown: vi.fn(),
  destroy: vi.fn(),
  getMarkdown: vi.fn(() => "dari editor"),
}));

vi.mock("@toast-ui/editor", () => ({
  default: vi.fn().mockImplementation(function (this: any, options: any) {
    if (h.mode === "throw") throw new Error("gagal");
    h.options = options;
    this.setMarkdown = h.setMarkdown;
    this.destroy = h.destroy;
    if (h.mode === "normal") this.getMarkdown = h.getMarkdown;
  }),
}));

import MarkdownEditor from "./MarkdownEditor.vue";

describe("MarkdownEditor tambahan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.mode = "normal";
    h.options = null;
  });

  it("memakai tinggi 100% sebagai 280px di editor dan 240px di textarea", () => {
    const wrapper = mount(MarkdownEditor, { props: { height: "100%" } });
    expect(h.options.height).toBe("280px");
    expect(wrapper.find("textarea").attributes("style")).toContain("min-height: 240px");
  });

  it("memakai tinggi kustom apa adanya", () => {
    const wrapper = mount(MarkdownEditor, { props: { height: "300px" } });
    expect(h.options.height).toBe("300px");
    expect(wrapper.find("textarea").attributes("style")).toContain("min-height: 300px");
  });

  it("memakai initialValue bila modelValue kosong", () => {
    mount(MarkdownEditor, { props: { modelValue: "", initialValue: "awal" } });
    expect(h.options.initialValue).toBe("awal");
  });

  it("memakai string kosong bila modelValue dan initialValue kosong", () => {
    mount(MarkdownEditor);
    expect(h.options.initialValue).toBe("");
  });

  it("mengutamakan modelValue dibanding initialValue", () => {
    mount(MarkdownEditor, { props: { modelValue: "mv", initialValue: "awal" } });
    expect(h.options.initialValue).toBe("mv");
  });

  it("tetap memperbarui editor bila editor tidak punya getMarkdown", async () => {
    h.mode = "nogetter";
    const wrapper = mount(MarkdownEditor, { props: { modelValue: "" } });
    await wrapper.setProps({ modelValue: "baru" });
    expect(h.setMarkdown).toHaveBeenCalledWith("baru");
  });

  it("mengabaikan modelValue yang bukan string", async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: "a" } });
    await wrapper.setProps({ modelValue: null as any });
    expect(h.setMarkdown).not.toHaveBeenCalled();
  });

  it("tetap berfungsi sebagai textarea bila editor gagal dibuat", async () => {
    h.mode = "throw";
    const wrapper = mount(MarkdownEditor, { props: { modelValue: "" } });

    await wrapper.setProps({ modelValue: "x" });
    expect(h.setMarkdown).not.toHaveBeenCalled();

    await wrapper.find("textarea").setValue("ketik");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["ketik"]);
    expect(h.setMarkdown).not.toHaveBeenCalled();

    wrapper.unmount();
    expect(h.destroy).not.toHaveBeenCalled();
  });
});
