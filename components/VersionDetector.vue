<template>
  <div class="version-detector">
    <!-- Simple Modal Dialog -->
    <div v-if="showVersionDialog" class="version-modal-overlay" @click="closeVersionDialog">
      <div class="version-modal" @click.stop>
        <div class="version-modal-header">
          <h3>Version Information</h3>
          <button @click="closeVersionDialog" class="close-btn">&times;</button>
        </div>
        <div class="version-content">
          <div class="version-item">
            <strong>Application:</strong>
            <span>{{ packageJson.name }}</span>
          </div>
          <div class="version-item">
            <strong>Version:</strong>
            <span>{{ packageJson.version }}</span>
          </div>
          <div class="version-item">
            <strong>Build Date:</strong>
            <span>{{ packageJson.updated }}</span>
          </div>
          <!-- <div class="version-item">
            <strong>Environment:</strong>
            <span>{{ environment }}</span>
          </div> -->
        </div>
        <!-- <div class="version-modal-footer">
          <button @click="closeVersionDialog" class="close-button">Close</button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import packageJson from '~/package.json'

const showVersionDialog = ref(false)
const clickCount = ref(0)
const clickTimer = ref(null)

// Version information
const version = ref('1.0.0')
const appName = ref('Gacharary App')
const buildDate = ref(new Date().toISOString().split('T')[0])
const environment = ref(process.env.NODE_ENV || 'development')

// Load version from /version.json endpoint
onMounted(async () => {
  try {
    const versionData = await $fetch('/api/version.json')
    
    version.value = packageJson.version || '1.0.0'
    appName.value = packageJson.name || 'Gacharary App'
    buildDate.value = versionData.buildDate || new Date().toISOString().split('T')[0]
  } catch (error) {
    console.warn('Could not load version from /api/version.json:', error)
    // Fallback to hardcoded values
    version.value = '1.0.0'
    appName.value = 'Gacharary App'
    buildDate.value = new Date().toISOString().split('T')[0]
    environment.value = 'development'
  }
})

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

// Close version dialog
const closeVersionDialog = () => {
  showVersionDialog.value = false
}

// Expose method to parent components
defineExpose({
  handleTripleClick
})
</script>

<style scoped>
.version-detector {
  position: relative;
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
</style>
