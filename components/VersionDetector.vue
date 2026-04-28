<template>
  <div class="version-detector">
    <Dialog 
      v-model:visible="showVersionDialog" 
      modal 
      class="!w-11/12 !max-w-sm border border-exd-gray-44 overflow-hidden"
      :style="{
        background: settings?.global?.modal?.background_color || '#ffffff',
      }"
    >
      <template #container="{ closeCallback }">
        <div class="relative pt-20">
          <h3 class="text-lg font-bold text-gray-700 absolute top-5 left-5">Version Information</h3>
          <img :src="$imgV(close)"
            alt="close"
            width="30"
            height="30"
            class="cursor-pointer hover:opacity-80 transition-opacity absolute top-2 right-2"
            @click="closeCallback"
          />

          <div class="flex flex-col gap-4 text-sm p-6">
            <div class="flex justify-between items-center border-b border-gray-100 pb-2">
              <span class="font-semibold text-gray-700">Application:</span>
              <span class="text-gray-500 font-mono">{{ appName }}</span>
            </div>

            <div class="relative flex justify-between items-center border-b border-gray-100 pb-2">
              <span class="font-semibold text-gray-700">Version:</span>
              <div @click="copyToClipboard" class="flex items-center gap-2 cursor-pointer group">
                <span class="text-gray-500 font-mono">
                  {{ version }} 
                  <!-- <small class="text-gray-400">({{ commit }})</small> -->
                </span>
                <i :class="isCopied ? 'pi pi-check text-green-500' : 'pi pi-copy text-gray-400'" class="text-[10px]"></i>
                
                <transition name="fade">
                  <span v-if="isCopied" class="absolute right-[30%] bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    Copied!
                  </span>
                </transition>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-700">Build Date:</span>
              <span class="text-gray-500 font-mono text-[11px]">{{ formattedBuildDate }}</span>
            </div>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import close from '~/assets/images/close.svg'

const showVersionDialog = ref(false)
const clickCount = ref(0)
const clickTimer = ref(null)

// Version information
const version = ref('1.0.0')
const appName = ref('Gacharary App')
const commit = ref('')

const settings = useState('settings')

const config = useRuntimeConfig()
const isCopied = ref(false)

const formattedBuildDate = computed(() => {
  return new Date(config.public.BUILD_TIME).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: config.public.TIME_ZONE,
  }).replace(/\./g, ':')
})

const copyToClipboard = async () => {
  try {
    const text = commit.value ? `${version.value} (${commit.value})` : version.value
    await navigator.clipboard.writeText(text)
    
    isCopied.value = true
    setTimeout(() => (isCopied.value = false), 2000)
  } catch (err) {
    console.error('Failed to copy', err)
  }
}

// Triple click detection
const handleTripleClick = () => {
  clickCount.value++
  
  if (clickCount.value === 1) {
    clickTimer.value = setTimeout(() => {
      clickCount.value = 0
      showVersionInfo()
    }, 500)
  } else if (clickCount.value === 3) {
    clearTimeout(clickTimer.value)
    clickCount.value = 0
    showVersionInfo()
  }
}

// Show version information
const showVersionInfo = () => {
  showVersionDialog.value = true
}

const handleClose = () => {
  showVersionDialog.value = false
}

// Expose method to parent components
defineExpose({
  handleTripleClick
})

onMounted(() => {
  appName.value = config.public.V_APP_NAME
  version.value = config.public.VERSION
  commit.value = config.public.COMMIT_HASH
})
</script>

<style scoped>
.version-detector {
  position: relative;
}

.version-item small {
  color: #9ca3af; /* Warna lebih pudar untuk commit hash */
  margin-left: 4px;
}

.version-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.version-modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.version-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.version-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.version-content {
  padding: 1.5rem;
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.version-item:last-child {
  border-bottom: none;
}

.version-item strong {
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
}

.version-item span {
  color: #6b7280;
  font-family: monospace;
  font-size: 0.875rem;
}

.version-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.close-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.close-button:hover {
  background-color: #2563eb;
}

.version-copy-zone {
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 6px;
  margin-right: -6px;
  border-radius: 4px;
  transition: background 0.2s;
}

.version-copy-zone:hover {
  background-color: #f3f4f6;
}

.commit-hash {
  color: #9ca3af;
  font-family: monospace;
}

.copy-badge {
  font-size: 10px;
  background: #10b981;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  position: absolute;
  right: -60px; /* Atur posisi sesuai kebutuhan */
}

/* Animasi transisi teks Copied! */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateX(-5px);
}
</style>
