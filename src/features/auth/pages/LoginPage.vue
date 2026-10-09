<template>
  <form class="space-y-5" @submit.prevent="onSubmitHandler">
    <div class="space-y-1">
      <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">
        Selamat datang kembali
      </h2>
      <p class="text-sm text-slate-600">
        Masuk untuk mengelola cash flow Anda di Delcom.
      </p>
    </div>

    <div>
      <label
        for="login-email-input"
        class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
      >
        Alamat Email
      </label>
      <div class="relative">
        <Mail
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
        <input
          id="login-email-input"
          v-model="email"
          type="email"
          data-testid="login-email-input"
          placeholder="nama@email.com"
          class="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600 transition-all shadow-sm"
          required
          autocomplete="email"
        />
      </div>
    </div>

    <div>
      <label
        for="login-password-input"
        class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
      >
        Kata Sandi
      </label>
      <div class="relative">
        <Lock
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
        <input
          id="login-password-input"
          v-model="password"
          type="password"
          data-testid="login-password-input"
          placeholder="••••••••"
          class="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600 transition-all shadow-sm"
          required
          autocomplete="current-password"
        />
      </div>
    </div>

    <div class="pt-1">
      <button
        id="login-submit-button"
        type="submit"
        data-testid="login-submit-button"
        :disabled="loading"
        class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:from-indigo-800 active:to-violet-800 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60"
      >
        <template v-if="loading">
          <Loader2 :size="18" class="animate-spin" />
          <span>Sedang Masuk...</span>
        </template>
        <template v-else>
          <LogIn :size="18" :stroke-width="2.5" />
          <span>Masuk Sekarang</span>
        </template>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Mail, Lock, Loader2, LogIn } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import apiHelper from "../../../helpers/apiHelper";

const authStore = useAuthStore();
const usersStore = useUsersStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

watch(
  () => authStore.isAuthLogin,
  (isAuthLogin) => {
    if (isAuthLogin === true) {
      const authToken = apiHelper.getAccessToken();
      if (authToken) {
        usersStore.asyncSetProfile();
      } else {
        loading.value = false;
        authStore.setIsAuthLogin(false);
      }
    }
  }
);

watch(
  () => usersStore.isProfile,
  (isProfile) => {
    if (isProfile) {
      loading.value = false;
      authStore.setIsAuthLogin(false);
      usersStore.setIsProfile(false);
    }
  }
);

async function onSubmitHandler() {
  loading.value = true;
  try {
    await authStore.asyncSetIsAuthLogin(email.value, password.value);
    if (!apiHelper.getAccessToken()) {
      loading.value = false;
    }
  } catch {
    loading.value = false;
  }
}
</script>
