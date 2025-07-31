import { useRef, useCallback, useEffect } from 'react';

interface AutoscrollConfig {
  scrollSpeed?: number;
  scrollThreshold?: number;
  acceleration?: number;
  maxSpeed?: number;
  smoothness?: number;
}

interface PointerPosition {
  x: number;
  y: number;
}

interface AutoscrollState {
  isActive: boolean;
  direction: 'up' | 'down' | null;
  intensity: number;
  currentSpeed: number;
  canScrollUp: boolean;
  canScrollDown: boolean;
  shouldContinue: boolean;
}

const DEFAULT_CONFIG: Required<AutoscrollConfig> = {
  scrollSpeed: 8,
  scrollThreshold: 80,
  acceleration: 1.5,
  maxSpeed: 25,
  smoothness: 0.15,
};

export const useGridAutoscroll = (
  containerElement: HTMLElement | null,
  isDragging: boolean,
  config: AutoscrollConfig = {}
) => {
  const rafRef = useRef<number | null>(null);
  const isLoopRunningRef = useRef(false);
  const stateRef = useRef<AutoscrollState>({
    isActive: false,
    direction: null,
    intensity: 0,
    currentSpeed: 0,
    canScrollUp: false,
    canScrollDown: false,
    shouldContinue: false,
  });
  const lastPointerRef = useRef<PointerPosition | null>(null);
  const previousIntensityRef = useRef<number>(0);

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Check scroll bounds with better precision
  const checkScrollBounds = useCallback(() => {
    if (!containerElement) return { canScrollUp: false, canScrollDown: false };

    const currentScrollTop = containerElement.scrollTop;
    const maxScroll = containerElement.scrollHeight - containerElement.clientHeight;

    // Use smaller threshold to prevent sudden stops near boundaries
    const canScrollUp = currentScrollTop > 0.5;
    const canScrollDown = currentScrollTop < maxScroll - 0.5;

    return { canScrollUp, canScrollDown };
  }, [containerElement]);

  // Calculate scroll parameters with MUCH smoother transitions
  const calculateScrollParams = useCallback((pointerY: number) => {
    if (!containerElement) return { direction: null, intensity: 0 };

    const rect = containerElement.getBoundingClientRect();
    const relativeY = pointerY - rect.top;
    const containerHeight = rect.height;
    const threshold = finalConfig.scrollThreshold;

    let direction: 'up' | 'down' | null = null;
    let rawIntensity = 0;

    // Top zone
    if (relativeY <= threshold) {
      direction = 'up';
      const distanceFromEdge = relativeY;
      const normalizedDistance = distanceFromEdge / threshold;
      rawIntensity = 1 - normalizedDistance;
    }
    // Bottom zone
    else if (relativeY >= containerHeight - threshold) {
      direction = 'down';
      const distanceFromEdge = containerHeight - relativeY;
      const normalizedDistance = distanceFromEdge / threshold;
      rawIntensity = 1 - normalizedDistance;
    }

    // Apply smooth easing
    let intensity = 0;
    if (rawIntensity > 0) {
      const t = Math.max(0, Math.min(1, rawIntensity));
      intensity = t * t * (3 - 2 * t); // Smoothstep function

      // Apply smoothing to prevent micro-jumps
      const previousIntensity = previousIntensityRef.current;
      const maxChange = 0.1;

      if (Math.abs(intensity - previousIntensity) > maxChange) {
        if (intensity > previousIntensity) {
          intensity = previousIntensity + maxChange;
        } else {
          intensity = previousIntensity - maxChange;
        }
      }

      // Minimum threshold to prevent tiny movements
      if (intensity < 0.05) intensity = 0;
    }

    previousIntensityRef.current = intensity;
    return { direction, intensity };
  }, [containerElement, finalConfig.scrollThreshold]);

  // FIXED: Perform actual scroll without sudden jumps
  const performScroll = useCallback((speed: number, direction: 'up' | 'down') => {
    if (!containerElement || speed <= 0) return false;

    const currentScrollTop = containerElement.scrollTop;
    const maxScroll = containerElement.scrollHeight - containerElement.clientHeight;

    let newScrollTop: number;
    let canScroll: boolean;

    if (direction === 'up') {
      canScroll = currentScrollTop > 0.5;
      // FIXED: Don't use Math.max(0, ...) which causes sudden jumps
      newScrollTop = currentScrollTop - speed;

      // Only clamp to 0 if we would go negative, and do it smoothly
      if (newScrollTop < 0) {
        newScrollTop = 0;
        // If we're very close to 0, reduce speed to make it smoother
        if (currentScrollTop < 3) {
          newScrollTop = currentScrollTop * 0.7; // Gradual approach to 0
        }
      }
    } else {
      canScroll = currentScrollTop < maxScroll - 0.5;
      newScrollTop = currentScrollTop + speed;

      // FIXED: Same smooth approach for bottom
      if (newScrollTop > maxScroll) {
        newScrollTop = maxScroll;
        // If we're very close to max, reduce speed
        if (currentScrollTop > maxScroll - 3) {
          const remaining = maxScroll - currentScrollTop;
          newScrollTop = currentScrollTop + (remaining * 0.7);
        }
      }
    }

    // Only scroll if there's a meaningful difference and we can scroll
    if (canScroll && Math.abs(newScrollTop - currentScrollTop) > 0.1) {
      containerElement.scrollTop = newScrollTop;
      return true;
    }

    return false;
  }, [containerElement]);

  // OPTIMIZED: Animation loop with better state management
  const animationLoop = useCallback(() => {
    const state = stateRef.current;

    // Check if we should continue
    if (!state.isActive || !lastPointerRef.current || !containerElement) {
      // Gradually stop
      if (state.currentSpeed > 0.1) {
        state.currentSpeed *= 0.85;
        rafRef.current = requestAnimationFrame(animationLoop);
      } else {
        state.currentSpeed = 0;
        state.shouldContinue = false;
        rafRef.current = null;
        isLoopRunningRef.current = false; // Reset flag
      }
      return;
    }

    // Calculate scroll parameters
    const { direction, intensity } = calculateScrollParams(lastPointerRef.current.y);
    const { canScrollUp, canScrollDown } = checkScrollBounds();

    // Update state bounds
    state.canScrollUp = canScrollUp;
    state.canScrollDown = canScrollDown;

    if (direction && intensity > 0) {
      const canActuallyScroll = direction === 'up' ? canScrollUp : canScrollDown;

      if (canActuallyScroll) {
        // Calculate target speed with smooth acceleration
        const baseSpeed = finalConfig.scrollSpeed * intensity;
        const accelerationFactor = 1 + (finalConfig.acceleration - 1) * intensity;
        const targetSpeed = Math.min(finalConfig.maxSpeed, baseSpeed * accelerationFactor);

        // Smooth speed transition
        const speedDiff = targetSpeed - state.currentSpeed;
        state.currentSpeed += speedDiff * finalConfig.smoothness;

        // Update state
        state.direction = direction;
        state.intensity = intensity;
        state.shouldContinue = true;

        // Perform scroll
        const didScroll = performScroll(state.currentSpeed, direction);

        if (didScroll) {
          rafRef.current = requestAnimationFrame(animationLoop);
        } else {
          // Hit boundary, stop gradually
          state.currentSpeed *= 0.8;
          if (state.currentSpeed > 0.1) {
            rafRef.current = requestAnimationFrame(animationLoop);
          } else {
            state.currentSpeed = 0;
            state.shouldContinue = false;
            rafRef.current = null;
            isLoopRunningRef.current = false;
          }
        }
      } else {
        // Can't scroll in this direction, stop gradually
        state.currentSpeed *= 0.9;
        if (state.currentSpeed > 0.1) {
          rafRef.current = requestAnimationFrame(animationLoop);
        } else {
          state.currentSpeed = 0;
          state.shouldContinue = false;
          rafRef.current = null;
          isLoopRunningRef.current = false;
        }
      }
    } else {
      // Not in scroll zone, gradually stop
      state.currentSpeed *= 0.9;
      if (state.currentSpeed > 0.1) {
        rafRef.current = requestAnimationFrame(animationLoop);
      } else {
        state.currentSpeed = 0;
        state.direction = null;
        state.intensity = 0;
        state.shouldContinue = false;
        rafRef.current = null;
        isLoopRunningRef.current = false;
      }
    }
  }, [containerElement, calculateScrollParams, checkScrollBounds, finalConfig, performScroll]);

  // OPTIMIZED: Handle pointer movement - only start loop when in scroll zones
  const handlePointerMove = useCallback((event: PointerEvent | MouseEvent | TouchEvent) => {
    if (!isDragging || !containerElement) return;

    let clientX: number, clientY: number;

    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      return;
    }

    lastPointerRef.current = { x: clientX, y: clientY };

    // OPTIMIZATION: Only start animation loop if we're in a scroll zone AND not already running
    if (!isLoopRunningRef.current) {
      const { direction, intensity } = calculateScrollParams(clientY);

      // Only start the loop if we're in a scroll zone with meaningful intensity
      if (direction && intensity > 0.05) {
        isLoopRunningRef.current = true;
        const state = stateRef.current;
        state.shouldContinue = true;
        rafRef.current = requestAnimationFrame(animationLoop);
      }
    }
  }, [isDragging, containerElement, animationLoop, calculateScrollParams]);

  // Touch handler
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (isDragging && event.touches.length === 1) {
      handlePointerMove(event);
    }
  }, [isDragging, handlePointerMove]);

  // Start autoscroll
  const startAutoscroll = useCallback(() => {
    const state = stateRef.current;
    if (state.isActive || !containerElement) return;

    state.isActive = true;
    state.currentSpeed = 0;
    state.shouldContinue = false;
    previousIntensityRef.current = 0;
    isLoopRunningRef.current = false;

    // Add event listeners
    document.addEventListener('mousemove', handlePointerMove, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('pointermove', handlePointerMove, { passive: true });
  }, [containerElement, handlePointerMove, handleTouchMove]);

  // Stop autoscroll
  const stopAutoscroll = useCallback(() => {
    const state = stateRef.current;
    state.isActive = false;
    state.direction = null;
    state.intensity = 0;
    state.currentSpeed = 0;
    state.shouldContinue = false;

    // Remove event listeners
    document.removeEventListener('mousemove', handlePointerMove);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('pointermove', handlePointerMove);

    // Clear animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Reset refs
    lastPointerRef.current = null;
    previousIntensityRef.current = 0;
    isLoopRunningRef.current = false;
  }, [handlePointerMove, handleTouchMove]);

  // Handle drag state changes
  useEffect(() => {
    if (isDragging && containerElement) {
      startAutoscroll();
    } else {
      stopAutoscroll();
    }

    return stopAutoscroll;
  }, [isDragging, containerElement, startAutoscroll, stopAutoscroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoscroll();
    };
  }, [stopAutoscroll]);
};
