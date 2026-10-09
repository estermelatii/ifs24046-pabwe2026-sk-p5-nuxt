<template>
  <div>
    <div
      v-if="isSidebarOpen"
      data-testid="sidebar-backdrop"
      class="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
      @click="$emit('close-mobile')"
    />
    <aside
      class="fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 p-4 transition-transform duration-200 ease-in-out md:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex flex-col h-full justify-between">
        <div class="space-y-6">
          <div>
            <p class="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </p>
            <nav class="mt-3 space-y-1">
              <RouterLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                custom
                v-slot="{ href, navigate, isActive, isExactActive }"
              >
                <a
                  :href="href"
                  class="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  :class="
                    (item.exact ? isExactActive : isActive)
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  "
                  @click="
                    navigate($event);
                    $emit('close-mobile');
                  "
                >
                  <div class="flex items-center gap-3">
                    <component
                      :is="item.icon"
                      :size="20"
                      :class="
                        (item.exact ? isExactActive : isActive)
                          ? 'text-blue-600'
                          : 'text-slate-400'
                      "
                    />
                    <span>{{ item.label }}</span>
                  </div>
                </a>
              </RouterLink>
            </nav>
          </div>
        </div>
        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-semibold text-slate-700">Delcom Cash Flow</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Versi 1.0</p>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { LayoutDashboard, Users, UserCircle } from "lucide-vue-next";

withDefaults(defineProps<{ isSidebarOpen?: boolean }>(), {
  isSidebarOpen: false,
});

defineEmits<{ (e: "close-mobile"): void }>();

const navItems = [
  { to: "/", label: "Ringkasan Arus Kas", icon: LayoutDashboard, exact: true },
  { to: "/users", label: "Direktori Pengguna", icon: Users, exact: false },
  { to: "/profile", label: "Profil Saya", icon: UserCircle, exact: false },
];
</script>