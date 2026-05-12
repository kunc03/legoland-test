<template>
  <div class="flex justify-center" :class="dynamicClasses">
    <p class="flex flex-col w-full p-2" :class="className" :style="dynamicBgStyle">
      <span v-if="copyrightText.includes('<p>')" v-for="(paragraph, index) in copyrightParagraphs" :key="index" class="block">
        {{ paragraph }}
      </span>
      <span v-else>{{ copyrightText }}</span>
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  className: {
    type: String,
    default: '',
  },
})

const settings = useState('settings')


const copyrightSettings = computed(() => settings.value?.copyright)

// Extract copyright settings with defaults
const alignment = computed(() => copyrightSettings.value?.alignment || 'center')
const backgroundColor = computed(() => copyrightSettings.value?.background_color || '#000000')
const fontColor = computed(() => copyrightSettings.value?.font_color || '#FFFFFF')
const fontSize = computed(() => copyrightSettings.value?.font_size || '8px')
const copyrightText = computed(() => copyrightSettings.value?.text || '<p>LEGO, the LEGO logo & LEGOLAND are trademarks of the LEGO Group.</p><p>2026 The LEGO Group. LEGOLAND is part of Merlin Entertainments Ltd.</p>')

// Parse HTML paragraphs to plain text for SSR-safe rendering
const copyrightParagraphs = computed(() => {
  const text = copyrightText.value
  if (!text.includes('<p>')) return [text]
  
  // Extract text content from p tags
  const matches = text.match(/<p[^>]*>(.*?)<\/p>/g) || []
  return matches.map(p => p.replace(/<p[^>]*>|<\/p>/g, '').trim()).filter(Boolean)
})

// SSR-safe dynamic background style
const dynamicBgStyle = computed(() => {
  if (process.client || copyrightSettings.value) {
    return { background: backgroundColor.value || '#000000', color: fontColor.value || '#FFFFFF' }
  }
  return { background: '#000000', color: '#FFFFFF' } // Fallback for SSR
})

// SSR-safe dynamic classes
const dynamicClasses = computed(() => {
  const classes = []
  // Only add dynamic classes if settings are available
  if (process.client || copyrightSettings.value) {
    classes.push(`text-${alignment.value}`)
    classes.push(`text-[${fontSize.value}]`)
  } else {
    // Fallback classes for SSR
    classes.push('text-center')
    classes.push('text-[8px]')
  }
  
  return classes
})
</script>