<template>
  <form @submit.prevent="onSubmitHandler" class="space-y-4">
    <div class="space-y-1 mb-2">
      <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">
        Buat akun baru
      </h1>
      <p class="text-sm text-slate-700">Daftar untuk mulai mengelola cash flow.</p>
    </div>

    <div>
      <label
        for="register-name-input"
        class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
      >
        Nama Lengkap
      </label>
      <div class="relative">
        <User
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
          aria-hidden="true"
        />
        <input
          id="register-name-input"
          type="text"
          data-testid="register-name-input"
          v-model="name"
          placeholder="Nama Lengkap Anda"
          class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          required
        />
      </div>
    </div>

    <div>
      <label
        for="register-email-input"
        class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
      >
        Alamat Email
      </label>
      <div class="relative">
        <Mail
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
          aria-hidden="true"
        />
        <input
          id="register-email-input"
          type="email"
          data-testid="register-email-input"
          v-model="email"
          placeholder="nama@email.com"
          class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          required
        />
      </div>
    </div>

    <div>
      <label
        for="register-password-input"
        class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
      >
        Kata Sandi
      </label>
      <div class="relative">
        <Lock
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
          aria-hidden="true"
        />
        <input
          id="register-password-input"
          type="password"
          data-testid="register-password-input"
          v-model="password"
          placeholder="Minimal 6 karakter"
          class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          required
        />
      </div>
    </div>

    <div class="pt-2">
      <button
        type="submit"
        data-testid="register-submit-button"
        :disabled="loading"
        class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
      >
        <template v-if="loading">
          <Loader2 :size="18" class="animate-spin" aria-hidden="true" />
          <span>Mendaftarkan Akun...</span>
        </template>
        <template v-else>
          <UserPlus :size="18" :stroke-width="2.5" aria-hidden="true" />
          <span>Daftar Akun</span>
        </template>
      </button>
    </div>
  </form>
</template>