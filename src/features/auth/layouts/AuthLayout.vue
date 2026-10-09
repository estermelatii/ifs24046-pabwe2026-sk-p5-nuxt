<template>
  <div class="min-h-screen flex bg-slate-50">
    <!-- Left panel -->
    <aside
      class="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 text-white"
    >
      <div class="absolute inset-0 opacity-30">
        <div class="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        <div class="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-fuchsia-400/30 blur-3xl" />
      </div>
      <div class="relative z-10 flex flex-col justify-between p-10 w-full">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
            <Wallet :size="22" :stroke-width="2.2" />
          </div>
          <div>
            <p class="text-lg font-extrabold tracking-tight">Delcom Cash Flow</p>
            <p class="text-xs text-white/70">PABWE 2026 · Nuxt</p>
          </div>
        </div>

        <div class="space-y-4 max-w-md">
          <h1 class="text-3xl xl:text-4xl font-black leading-tight tracking-tight">
            Kelola arus kas dengan lebih rapi dan cepat.
          </h1>
          <p class="text-sm text-white/80 leading-relaxed">
            Catat pemasukan, pengeluaran, dan pantau status transaksi dalam satu
            dashboard modern berbasis Nuxt 3.
          </p>
        </div>

        <p class="text-xs text-white/60">© 2026 Delcom · ifs24046</p>
      </div>
    </aside>

    <!-- Right panel -->
    <main class="flex-1 flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md">
        <div class="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <Wallet :size="20" />
          </div>
          <span class="text-lg font-extrabold text-slate-900">Delcom Cash Flow</span>
        </div>

        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-7 sm:p-8">
          <nav
            class="flex p-1 mb-6 rounded-2xl bg-slate-100 border border-slate-200/80"
            aria-label="Auth navigation"
          >
            <RouterLink
              to="/auth/login"
              class="flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all"
              :class="
                isLoginActive
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              "
            >
              Masuk Akun
            </RouterLink>
            <RouterLink
              to="/auth/register"
              class="flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all"
              :class="
                !isLoginActive
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              "
            >
              Daftar Baru
            </RouterLink>
          </nav>

          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter, RouterLink, RouterView } from "vue-router";
import { Wallet } from "lucide-vue-next";
import { useUsersStore } from "../../users/states/usersStore";
import apiHelper from "../../../helpers/apiHelper";

const route = useRoute();
const router = useRouter();
const usersStore = useUsersStore();

const isLoginActive = computed(() => route.path === "/auth/login");

onMounted(() => {
  const authToken = apiHelper.getAccessToken();
  if (authToken) {
    usersStore.asyncSetProfile();
  }
});

watch(
  () => [usersStore.isProfile, usersStore.profile],
  ([isProfile, profile]) => {
    if (isProfile) {
      usersStore.setIsProfile(false);
      if (profile) {
        router.push("/");
      }
    }
  }
);
</script>
