import { defineNuxtPlugin } from '#app'
import type { DirectiveBinding } from 'vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('only-numeric', {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      if (binding.value === false) return

      let isComposing = false

      // Track composing state (mobile IME / virtual keyboard)
      const handleCompositionStart = () => { isComposing = true }
      const handleCompositionEnd = (event: Event) => {
        isComposing = false
        // Clean up non-numeric characters after composition ends
        const input = event.target as HTMLInputElement
        const numericValue = input.value.replace(/\D/g, '')
        if (input.value !== numericValue) {
          // Use nativeInputValueSetter to avoid triggering double Vue reactivity
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set
          nativeInputValueSetter?.call(input, numericValue)
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }

      // For non-composing input (desktop physical keyboard)
      const handleInput = (event: Event) => {
        if (isComposing) return // Let compositionend handle it
        const input = event.target as HTMLInputElement
        const value = input.value
        const numericValue = value.replace(/\D/g, '')

        if (value !== numericValue) {
          // Preserve cursor position
          const selectionStart = input.selectionStart ?? numericValue.length
          const diff = value.length - numericValue.length
          const newCursor = Math.max(0, selectionStart - diff)

          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set
          nativeInputValueSetter?.call(input, numericValue)
          input.setSelectionRange(newCursor, newCursor)
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }

      ;(el as any).__handleInput__ = handleInput
      ;(el as any).__handleCompositionStart__ = handleCompositionStart
      ;(el as any).__handleCompositionEnd__ = handleCompositionEnd

      el.addEventListener('compositionstart', handleCompositionStart)
      el.addEventListener('compositionend', handleCompositionEnd)
      el.addEventListener('input', handleInput)
    },
    updated(el: HTMLElement, binding: DirectiveBinding) {
      if (binding.value === binding.oldValue) return

      const { __handleInput__, __handleCompositionStart__, __handleCompositionEnd__ } = el as any

      if (binding.value === false) {
        el.removeEventListener('input', __handleInput__)
        el.removeEventListener('compositionstart', __handleCompositionStart__)
        el.removeEventListener('compositionend', __handleCompositionEnd__)
      } else {
        el.addEventListener('compositionstart', __handleCompositionStart__)
        el.addEventListener('compositionend', __handleCompositionEnd__)
        el.addEventListener('input', __handleInput__)
      }
    },
    unmounted(el: HTMLElement) {
      el.removeEventListener('input', (el as any).__handleInput__)
      el.removeEventListener('compositionstart', (el as any).__handleCompositionStart__)
      el.removeEventListener('compositionend', (el as any).__handleCompositionEnd__)
      delete (el as any).__handleInput__
      delete (el as any).__handleCompositionStart__
      delete (el as any).__handleCompositionEnd__
    },
  })
})
