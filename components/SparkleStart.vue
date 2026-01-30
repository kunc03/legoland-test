<template>
  <svg
    width="450"
    height="858"
    viewBox="0 700 500 750"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    class="absolute"
    :class="[className]"
  >
    <g transform="translate(0, 50)">
      <!-- big star -->
      <path
        d="M215.175 630.917C182.196 620.336 181.23 618.662 188.555 584.811C177.974 617.789 176.3 618.756 142.45 611.431C175.427 622.012 176.394 623.686 169.068 657.537C179.65 624.558 181.324 623.592 215.175 630.917Z"
        fill="white"
        class="animate-sparkle"
      />
      <!-- big star -->
      <path
        d="M338.568 601.926C305.589 591.345 304.623 589.671 311.948 555.82C301.367 588.798 299.693 589.765 265.844 582.44C298.821 593.021 299.787 594.695 292.462 628.546C303.043 595.567 304.717 594.601 338.568 601.926Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M235.452 603.601C224.568 600.108 224.248 599.556 226.665 588.386C223.175 599.269 222.623 599.587 211.451 597.17C222.335 600.662 222.653 601.214 220.234 612.385C223.726 601.501 224.28 601.183 235.452 603.601Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M328.213 631.717C317.331 628.226 317.01 627.673 319.428 616.501C315.936 627.385 315.384 627.704 304.214 625.287C315.096 628.779 315.415 629.33 312.998 640.5C316.489 629.618 317.043 629.3 328.213 631.717Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M164.093 534.958C153.211 531.466 152.892 530.914 155.309 519.742C151.817 530.626 151.264 530.944 140.094 528.527C150.976 532.019 151.296 532.571 148.878 543.743C152.371 532.859 152.923 532.54 164.093 534.958Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M227.73 683.244C216.848 679.752 216.528 679.199 218.945 668.028C215.453 678.911 214.901 679.23 203.731 676.813C214.613 680.305 214.932 680.857 212.514 692.028C216.006 681.145 216.56 680.826 227.73 683.244Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M125.491 632.495C114.609 629.004 114.289 628.451 116.708 617.28C113.216 628.164 112.662 628.482 101.492 626.065C112.374 629.557 112.695 630.109 110.278 641.279C113.768 630.396 114.321 630.078 125.491 632.495Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M181.274 567.312C163.136 561.492 162.605 560.573 166.634 541.954C160.813 560.093 159.894 560.624 141.275 556.595C159.414 562.415 159.945 563.334 155.916 581.953C161.736 563.814 162.656 563.283 181.274 567.312Z"
        fill="white"
        class="animate-sparkle"
      />
      <path
        d="M280.851 671.375C262.713 665.555 262.182 664.636 266.211 646.017C260.391 664.156 259.471 664.687 240.852 660.658C258.991 666.478 259.522 667.397 255.493 686.016C261.313 667.877 262.233 667.346 280.851 671.375Z"
        fill="white"
        class="animate-sparkle"
      />
    </g>
  </svg>
</template>

<script setup>
const props = defineProps({
  className: String,
  starsPosition: String,
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
  })
})
</script>

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

@keyframes sparkle-webkit {
  0%,
  100% {
    opacity: 0;
    transform: translateZ(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateZ(0) scale(1.03);
  }
}
.animate-sparkle {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center center;
  animation: sparkle 0.7s infinite alternate;
}

@supports (-webkit-touch-callout: none) {
  .animate-sparkle {
    animation: sparkle-webkit 1.2s infinite;
  }
}
</style>
