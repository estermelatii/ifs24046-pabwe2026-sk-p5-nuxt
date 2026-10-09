export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  (globalThis as any).DELCOM_BASEURL =
    config.public.delcomBaseUrl || "https://open-api.delcom.org/api/v1";
});
