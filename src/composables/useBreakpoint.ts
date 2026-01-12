import { useBreakpoints } from '@vueuse/core'
import { computed } from 'vue'

// Define breakpoints matching Tailwind CSS defaults
const breakpoints = useBreakpoints({
  sm: 640,   // Small devices (phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (laptops)
  xl: 1280,  // Extra large devices (desktops)
  '2xl': 1536, // 2X Extra large devices
})

// Reactive breakpoint states
export const isMobile = computed(() => breakpoints.smaller('md').value)
export const isTablet = computed(() => breakpoints.between('md', 'lg').value)
export const isLaptop = computed(() => breakpoints.between('lg', 'xl').value)
export const isDesktop = computed(() => breakpoints.greaterOrEqual('xl').value)

// Additional useful breakpoints
export const isSmallScreen = computed(() => breakpoints.smaller('lg').value) // Mobile + Tablet
export const isLargeScreen = computed(() => breakpoints.greaterOrEqual('lg').value) // Laptop + Desktop

// Active breakpoint name
export const activeBreakpoint = breakpoints.active()

// Composable function for component usage
export function useBreakpoint() {
  return {
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    activeBreakpoint,
    breakpoints,
  }
}
