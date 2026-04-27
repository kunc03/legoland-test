export default defineNuxtRouteMiddleware(async (to, from) => {
  // Ambil state setting
  const settings = useState('settings');
  
  // Langsung panggil logika navigasi Anda di sini
  // Pastikan logic handleGoToCharacter ada di store atau composable agar bisa diakses
  const hideCharacter = false;
  
  if (!hideCharacter) {
    return navigateTo(`/spin/character/${to.params.randomCode}`);
  } else {
    return navigateTo('/dashboard');
  }
})