import { describe, it, expect } from "vitest";
import ProfilePage from "./ProfilePage.vue";
import { renderWithProviders } from "../../../test-utils";

describe("ProfilePage foto tanpa nama", () => {
  it("memakai alt bawaan bila nama kosong", () => {
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: {
        profile: { id: 1, name: "", email: "a@b.c", photo: "https://x.test/foto.png" },
      },
    });
    expect(wrapper.find("img").attributes("alt")).toBe("Foto profil");
  });
});
