<template>
  <div
    :id="name"
    class="slideunlock"
    :class="{
      'is-disabled': disabled,
      'is-noanimate': noanimate,
      'is-circle': circle,
      'is-complete': Slider.IsComplete,
    }"
    :style="slideUnlockStyle"
    @mousemove="slideMoving"
    @mouseup="slideFinish"
    @touchmove="slideMoving"
    @touchend="slideFinish"
  >
    <div class="slideunlock-progressbar" :style="progressBarStyle" />
    <div class="slideunlock-text" :style="{ opacity: Slider.TextOpacity }">
      {{ message }}
    </div>

    <div
      class="slideunlock-handler"
      :style="handlerStyle"
      @mousedown="slideStart"
      @touchstart="slideStart"
    />
  </div>
</template>

<script lang="ts">
import ease from 'easy-ease'
import debounce from 'lodash.debounce'

export default defineComponent({
  name: 'SlideUnlock',
  props: {
    autoWidth: {
      type: Boolean,
      default: true,
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 60,
    },
    text: {
      type: String,
      default: 'slide to unlock',
    },
    successText: {
      type: String,
      default: 'success',
    },
    circle: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    noanimate: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: 'slideunlock',
    },
    position: {
      type: Number,
      default: 0,
    },
    bgColor: {
      type: String,
      default: '',
    },
  },

  setup(props, { emit }) {
    const Slider = reactive({
      CanMove: false,
      IsComplete: false,
      StartPositionWindow: 0,
      HandlerPosition: 0,
      ProgressWidth: 0,
      TextOpacity: 1,
    })

    const slideUnlockStyle = computed(() => {
      return {
        width: props.autoWidth ? 'auto' : props.width + 'px',
        height: props.height + 'px',
      }
    })

    const progressBarStyle = computed(() => {
      return {
        width: Slider.ProgressWidth + 'px',
        height: props.height + 'px',
        borderRadius: props.circle
          ? !Slider.IsComplete
            ? props.height / 2 + 'px 0 0 ' + props.height / 2 + 'px'
            : props.height / 2 + 'px '
          : 0,
      }
    })

    const handlerStyle = computed(() => {
      return {
        left: Slider.HandlerPosition + 'px',
        width: props.height + 'px',
        height: props.height + 'px',
      }
    })

    const message = computed(() => {
      return Slider.IsComplete ? props.successText : props.text
    })

    const sliderWidth = computed(() => {
      const h = document.getElementById(props.name) as HTMLElement
      return props.autoWidth
        ? h.clientWidth -
            parseInt(
              getComputedStyle(h)
                .getPropertyValue('--su-size-padding')
                .replace('px', ''),
              10
            ) *
              2
        : props.width
    })

    watch(
      () => props.autoWidth,
      () => {
        if (Slider.IsComplete) {
          setTimeout(() => {
            Slider.ProgressWidth = sliderWidth.value
          }, 1)
        }
      }
    )

    watch(
      () => props.width,
      () => {
        if (Slider.IsComplete) Slider.ProgressWidth = sliderWidth.value
      }
    )

    const fadeText = debounce(function (force: boolean = false) {
      const ReversePercent =
        ((sliderWidth.value - props.height) * (100 / Slider.HandlerPosition)) /
          1000 -
        0.1
      if (Slider.CanMove || force) Slider.TextOpacity = ReversePercent
    }, 5)

    const slideStart = (e: MouseEvent | TouchEvent) => {
      if (!Slider.IsComplete) {
        Slider.CanMove = true
        if (window.TouchEvent && e instanceof TouchEvent && e.touches)
          Slider.StartPositionWindow =
            e.touches[0].pageX - Slider.HandlerPosition
        else if (e instanceof MouseEvent)
          Slider.StartPositionWindow = e.pageX - Slider.HandlerPosition
      }
      document.onmousemove = (ev) => {
        const el = ev
        slideMoving(el)
        return false
      }
      document.onmouseup = (ev) => {
        const el = ev
        slideFinish(el)
        document.onmousemove = null
        return false
      }
    }

    const slideMoving = (e: unknown) => {
      if (Slider.CanMove && !Slider.IsComplete) {
        let pageX = Slider.StartPositionWindow
        if (window.TouchEvent && e instanceof TouchEvent && e.touches)
          pageX = e.touches[0].pageX
        else if (e instanceof MouseEvent) pageX = e.pageX

        if (pageX < Slider.StartPositionWindow) return
        else Slider.HandlerPosition = pageX - Slider.StartPositionWindow

        if (
          Slider.HandlerPosition > 0 &&
          Slider.HandlerPosition <= sliderWidth.value - props.height
        ) {
          Slider.ProgressWidth = Slider.HandlerPosition + props.height / 2
          fadeText()
        } else if (Slider.HandlerPosition > sliderWidth.value - props.height) {
          Slider.HandlerPosition = sliderWidth.value - props.height
          Slider.ProgressWidth = sliderWidth.value
          passVerify()
        }
      }
    }

    const slideFinish = (e: unknown) => {
      if (Slider.CanMove && !Slider.IsComplete) {
        let pageX = Slider.StartPositionWindow
        if (window.TouchEvent && e instanceof TouchEvent && e.touches)
          pageX = e.changedTouches[0].pageX
        else if (e instanceof MouseEvent) pageX = e.pageX

        if (pageX < Slider.StartPositionWindow) return
        else if (Slider.HandlerPosition < sliderWidth.value - props.height) {
          ease({
            startValue: Slider.HandlerPosition,
            endValue: 0,
            durationMs: 200,
            onStep: (value: number) => {
              Slider.HandlerPosition = value
              Slider.ProgressWidth = value + props.height / 2
            },
          })
          Slider.TextOpacity = 1
        }
        Slider.CanMove = false
      }
    }

    const emulateSlideFromProps = (pos: number) => {
      if (
        typeof pos !== 'number' ||
        pos < 0 ||
        Slider.IsComplete ||
        props.disabled
      )
        return

      const computedPosition = Math.round(
        ((sliderWidth.value - props.height) / 100) * pos
      )
      Slider.ProgressWidth = computedPosition + props.height / 2
      Slider.HandlerPosition = computedPosition
      fadeText(true)
      if (computedPosition >= sliderWidth.value - props.height) {
        complete()
        passVerify()
      }
    }

    const encodeSVGColor = (color: string): string => {
      const encoded = color.replace('#', '%23')
      return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='${encoded}' viewBox='0 0 13 22'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M1.50049 2.00153L10.5 11.0005L1.50049 19.9996'/%3E%3C/svg%3E")`
    }

    onMounted(() => {
      document.documentElement.style.setProperty(
        '--su-icon-handler',
        encodeSVGColor(props.bgColor)
      )
    })

    watch(
      () => props.position,
      () => {
        emulateSlideFromProps(props.position)
      }
    )

    const passVerify = () => {
      Slider.IsComplete = true
      Slider.CanMove = false
      emit('completed')
    }

    const reset = () => {
      Slider.CanMove = false
      Slider.IsComplete = false
      Slider.StartPositionWindow = 0
      Slider.HandlerPosition = 0
      Slider.ProgressWidth = 0
      Slider.TextOpacity = 1
    }

    const complete = () => {
      Slider.CanMove = false
      Slider.IsComplete = true
      Slider.StartPositionWindow = 0
      Slider.HandlerPosition = 0
      Slider.ProgressWidth = sliderWidth.value
      Slider.TextOpacity = 1
    }

    return {
      Slider,
      slideUnlockStyle,
      progressBarStyle,
      handlerStyle,
      message,
      sliderWidth,
      slideStart,
      slideMoving,
      slideFinish,
      reset,
      complete,
    }
  },
})
</script>

<style scoped>
.slideunlock {
  --su-size-text: 18px;
  --su-size-padding: 5px;
  --su-color-bg: var(--claim-bg-color);
  --su-color-progress-normal-bg: color-mix(
    in srgb,
    var(--claim-bg-color) 50%,
    white
  );
  --su-color-progress-complete-bg: color-mix(
    in srgb,
    var(--claim-bg-color) 50%,
    white
  );
  --su-color-text-normal: #4f4f4f;
  --su-color-text-complete: var(--claim-bg-color);
  --su-color-handler-bg: #ffffff;

  display: flex;
  position: relative;
  box-sizing: content-box;
  padding: var(--su-size-padding);
  background-color: var(--su-color-bg);
  text-align: center;
  overflow: hidden;
}

.slideunlock::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  transition: none;
  animation: shine 4s infinite;
  background-color: rgb(255 255 255 / 40%);
  overflow: hidden;
}

.slideunlock .slideunlock-progressbar {
  position: absolute;
  z-index: 1;
  width: 0;
  height: 34px;
  transition: background 1s ease-out;
  background-color: var(--su-color-progress-normal-bg);
}

.slideunlock .slideunlock-text {
  display: inline;
  z-index: 2;
  margin-left: 50px;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: background 1s ease, color 1s ease;
  /* animation: animated 2s linear infinite; */
  background: var(--su-color-text-normal)
    linear-gradient(90deg, rgb(255 255 255 / 0%), white, rgb(255 255 255 / 0%))
    no-repeat;
  background-clip: text;
  color: white;
  font-size: var(--su-size-text);
  user-select: none;
  font-weight: bold;
  line-height: 19px;
}

.slideunlock .slideunlock-text::before {
  content: '';
  display: inline-block;
  height: 100%;
  vertical-align: middle;
}

.slideunlock .slideunlock-handler {
  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  margin: var(--su-size-padding);
  transition: background 0.75s ease, transform 0.1s ease-in;
  background: var(--su-color-handler-bg) var(--su-icon-handler) no-repeat center;
  background-size: 0.75rem;
  cursor: grab;
  overflow: hidden;
}

.slideunlock .slideunlock-handler:active {
  transform: scale(1.05);
  cursor: grabbing;
}

.slideunlock.is-circle {
  border-radius: 50rem;
}

.slideunlock.is-circle::after {
  border-radius: 50rem 0 0 50rem;
}

.slideunlock.is-circle .slideunlock-handler {
  border-radius: 50%;
}

.slideunlock.is-noanimate::after {
  animation: none;
}

.slideunlock.is-noanimate .slideunlock-text {
  animation: none;
  color: var(--su-color-text-normal);
}

.slideunlock.is-disabled {
  opacity: 0.5;
}

.slideunlock.is-disabled::after {
  content: '';
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: none;
  opacity: 0.5;
  background-color: var(--su-color-bg);
}

.slideunlock.is-disabled .slideunlock-text {
  animation: none;
  opacity: 0.25;
  color: var(--su-color-text-normal);
}

.slideunlock.is-disabled .slideunlock-handler {
  pointer-events: none;
}

.slideunlock.is-disabled.is-circle::after {
  border-radius: 50rem;
}

.slideunlock.is-complete::after {
  animation: none;
}

/* .slideunlock.is-complete, */
.slideunlock.is-complete .slideunlock-progressbar {
  background-color: var(--su-color-progress-complete-bg);
}

.slideunlock.is-complete .slideunlock-text {
  animation: none;
  opacity: 1 !important;
  color: var(--su-color-text-complete);
}

.slideunlock.is-complete .slideunlock-handler {
  opacity: 0;
  background: var(--su-color-progress-complete-bg);
}

@keyframes animated {
  from {
    background-position: -300px 0;
  }
  to {
    background-position: 300px 0;
  }
}

@keyframes shine {
  100% {
    width: 100%;
    transition: all 5s ease-out;
    background-color: rgb(255 255 255 / 0%);
  }
}
</style>
