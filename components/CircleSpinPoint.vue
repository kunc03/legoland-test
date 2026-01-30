<script setup>
import noImage from '~/assets/images/no-image.svg'

const props = defineProps({
  imageSrc: { type: String, default: '' },
  categorySrc: { type: String, default: '' },
  showPointOnly: { type: Boolean, default: false },
})
const settings = useState('settings')
const giftType = reactive({
  x: 50,
  y: 270,
  width: 300,
  height: 140,
})

const pointType = reactive({
  x: 60,
  y: 20,
  width: 300,
  height: 250,
})

const circleBlur = reactive({
  x: -75,
  y: -170,
  width: 550,
  height: 600,
})

const pointHref = ref(noImage)
const categoryHref = ref(noImage)

const isPointFallback = computed(() => pointHref.value === noImage)

const pointCircle = computed(() => {
  const radius = Math.min(pointType.width, pointType.height) / 2
  return {
    cx: pointType.x + pointType.width / 2,
    cy: pointType.y + pointType.height / 2,
    r: radius,
  }
})

const configuredCategoryHref = computed(
  () =>
    settings.value?.gacha?.spin_gacha_1_screen?.after_gacha_1_screen?.image?.image ||
    ''
)

const selectedCategoryHref = computed(() => {
  const selectImage =
    settings.value?.gacha?.spin_gacha_1_screen?.after_gacha_1_screen?.image
      ?.select_image

  if (selectImage === 'point_category') {
    return props.categorySrc
  }

  return configuredCategoryHref.value
})

const resolveImageHref = (src, fallback) => {
  return new Promise((resolve) => {
    if (!import.meta.client) {
      resolve(fallback)
      return
    }

    if (!src || typeof src !== 'string') {
      resolve(fallback)
      return
    }

    const img = new Image()
    img.onload = () => resolve(src)
    img.onerror = () => resolve(fallback)
    img.src = src
  })
}

let pointSeq = 0
watchEffect(() => {
  const current = ++pointSeq
  resolveImageHref(props.imageSrc, noImage).then((href) => {
    if (current !== pointSeq) return
    pointHref.value = href
  })
})

let categorySeq = 0
watchEffect(() => {
  const current = ++categorySeq
  resolveImageHref(selectedCategoryHref.value, noImage).then((href) => {
    if (current !== categorySeq) return
    categoryHref.value = href
  })
})

onMounted(() => {
  nextTick(() => {
    function getRandom(min, max) {
      return Math.random() * (max - min) + min
    }

    const stars = document.querySelectorAll('.animate-sparkle')
    stars.forEach((star, index) => {
      const delay = getRandom(0, 3) + 's'

      star.style.animationDelay = delay
    })

    const logViewportHeight = () => {
      const isShortScreen = window.innerHeight < 667

      if (isShortScreen) {
        const difference = 667 - window.innerHeight
        giftType.width = Math.max(300 - difference / 2, 121.5)
        giftType.height = Math.max(150 - difference / 2, 121.5)
      }

      if (props.showPointOnly) {
        pointType.y = (380 - pointType.width) / 2
        circleBlur.y = (300 - circleBlur.width) / 2
      }

      giftType.x = (400 - giftType.width) / 2
    }

    logViewportHeight()
    window.addEventListener('resize', logViewportHeight)
  })
})

</script>

<template>
  <svg
    width="400"
    height="718"
    viewBox="0 0 400 375"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <g class="absolute">
      <path
        d="M215.175 528.917C182.196 518.336 181.23 516.662 188.555 482.811C177.974 515.789 176.3 516.756 142.45 509.431C175.427 520.012 176.394 521.686 169.068 555.537C179.65 522.558 181.324 521.592 215.175 528.917Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M338.568 499.926C305.589 489.345 304.623 487.671 311.948 453.82C301.367 486.798 299.693 487.765 265.844 480.44C298.821 491.021 299.787 492.695 292.462 526.546C303.043 493.567 304.717 492.601 338.568 499.926Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M235.452 501.601C224.568 498.108 224.248 497.556 226.665 486.386C223.175 497.269 222.623 497.587 211.451 495.17C222.335 498.662 222.653 499.214 220.234 510.385C223.726 499.501 224.28 499.183 235.452 501.601Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M328.213 529.717C317.331 526.226 317.01 525.673 319.428 514.501C315.936 525.385 315.384 525.704 304.214 523.287C315.096 526.779 315.415 527.33 312.998 538.5C316.489 527.618 317.043 527.3 328.213 529.717Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M164.093 432.958C153.211 429.466 152.892 428.914 155.309 417.742C151.817 428.626 151.264 428.944 140.094 426.527C150.976 430.019 151.296 430.571 148.878 441.743C152.371 430.859 152.923 430.54 164.093 432.958Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M227.73 581.244C216.848 577.752 216.528 577.199 218.945 566.028C215.453 576.911 214.901 577.23 203.731 574.813C214.613 578.305 214.932 578.857 212.514 590.028C216.006 579.145 216.56 578.826 227.73 581.244Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M125.491 530.495C114.609 527.004 114.289 526.451 116.708 515.28C113.216 526.164 112.662 526.482 101.492 524.065C112.374 527.557 112.695 528.109 110.278 539.279C113.768 528.396 114.321 528.078 125.491 530.495Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M181.274 465.312C163.136 459.492 162.605 458.572 166.634 439.954C160.813 458.093 159.894 458.624 141.275 454.595C159.414 460.415 159.945 461.334 155.916 479.953C161.736 461.814 162.656 461.283 181.274 465.312Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M280.851 569.375C262.713 563.555 262.182 562.635 266.211 544.017C260.391 562.156 259.471 562.687 240.852 558.658C258.991 564.478 259.522 565.397 255.493 584.016C261.313 565.877 262.233 565.346 280.851 569.375Z"
        fill="white"
        class="animate-sparkle"
      />
    </g>

    <image
      :x="circleBlur.x"
      :y="circleBlur.y"
      :width="circleBlur.width"
      :height="circleBlur.height"
      href="~/assets/images/circle-blur.png"
    />
    <g filter="url(#filter0_b_12_49)">
      <!-- <ellipse cx="200" cy="198" rx="200" ry="198" fill="white" /> -->
    </g>
    
    <g v-if="settings?.flow?.screens?.spin_gacha_1_screen?.show_point">
      <circle
        v-if="isPointFallback"
        :cx="pointCircle.cx"
        :cy="pointCircle.cy"
        :r="pointCircle.r"
        fill="white"
        stroke="#D0D0D0"
        stroke-width="4"
      />
      <g v-if="isPointFallback" clip-path="url(#clipPoint)">
        <image
          :x="pointType.x"
          :y="pointType.y"
          :width="pointType.width"
          :height="pointType.height"
          :href="pointHref"
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
      <image
        v-else
        :x="pointType.x"
        :y="pointType.y"
        :width="pointType.width"
        :height="pointType.height"
        :href="pointHref"
      />
    </g>

    <image
      v-if="settings?.flow?.screens?.spin_gacha_1_screen?.show_point_category || settings?.gacha?.spin_gacha_1_screen?.after_gacha_1_screen?.image?.select_image !== 'none'"
      :x="giftType.x"
      :y="giftType.y"
      :width="giftType.width"
      :height="giftType.height"
      :href="categoryHref"
    />

    <defs>
      <clipPath id="clipPoint">
        <circle :cx="pointCircle.cx" :cy="pointCircle.cy" :r="pointCircle.r" />
      </clipPath>
      <filter
        id="filter0_b_12_49"
        x="-30"
        y="-30"
        width="460"
        height="456"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feGaussianBlur in="BackgroundImageFix" stdDeviation="15" />
        <feComposite
          in2="SourceAlpha"
          operator="in"
          result="effect1_backgroundBlur_12_49"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_backgroundBlur_12_49"
          result="shape"
        />
      </filter>
      <pattern
        id="pattern0_12_49"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlink:href="#image0_12_49"
          transform="matrix(0.00272919 0 0 0.00302115 -0.00217066 0)"
        />
      </pattern>
      <pattern
        id="pattern1_12_49"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlink:href="#image1_12_49"
          transform="matrix(0.00251569 0 0 0.00277008 -0.0018797 0)"
        />
      </pattern>
    </defs>
  </svg>
</template>

<style scoped>
@keyframes sparkle {
  50% {
    opacity: 0.8;
    /* transform: rotate(90deg); */
    box-shadow: 0px 0px 10px 5px #ffffff5e;
  }
  50% {
    opacity: 1;
    /* transform: rotate(0deg); */
    box-shadow: 0px 0px 10px 5px white;
  }
  100% {
    opacity: 0;
    /* transform: rotate(90deg); */
    box-shadow: 0px 0px 10px 5px #ffffff5e;
  }
}

.animate-sparkle {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center center;
  animation: sparkle 0.7s infinite alternate;
}
</style>
