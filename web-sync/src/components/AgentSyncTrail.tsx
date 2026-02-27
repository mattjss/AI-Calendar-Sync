import { useEffect, useRef, useState } from 'react'

type Rgb = { r: number; g: number; b: number }

export const LOOP_DURATION_MS = 2700
const PATH_DOT_COUNT = 12
const PATH_DOT_SPACING = 4.5 // pixels between small track dots, fills 56px button
const PATH_START_X = 6
const HEAD_SIZE = 8
const TRAIL_STEPS = 8
const TRAIL_SPACING = 7 // distance between trail samples, in px
const BACKGROUND_RGB: Rgb = { r: 26, g: 26, b: 26 }
const TRACK_RGB: Rgb = { r: 118, g: 118, b: 118 }

const PATH_LENGTH = PATH_DOT_SPACING * (PATH_DOT_COUNT - 1)

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '').trim()
  // Fallback to agent orange (#FC4E09) if parsing fails
  if (normalized.length !== 6) return { r: 252, g: 78, b: 9 }
  const num = Number.parseInt(normalized, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpColor(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: Math.round(lerp(a.r, b.r, t)),
    g: Math.round(lerp(a.g, b.g, t)),
    b: Math.round(lerp(a.b, b.b, t)),
  }
}

function rgbToString({ r, g, b }: Rgb) {
  return `rgb(${r}, ${g}, ${b})`
}

function useAgentColor(): Rgb {
  // Default to agent orange (#FC4E09) when no CSS variable is provided
  const [rgb, setRgb] = useState<Rgb>({ r: 252, g: 78, b: 9 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const root = document.documentElement
    const raw = getComputedStyle(root)
      .getPropertyValue('--agent-color')
      .trim()
    if (!raw) return
    setRgb(hexToRgb(raw))
  }, [])

  return rgb
}

export type AgentSyncTrailProps = {
  onBounce?: () => void
}

export function AgentSyncTrail({ onBounce }: AgentSyncTrailProps) {
  const agentColor = useAgentColor()
  const [headPos, setHeadPos] = useState(0)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const directionRef = useRef<1 | -1>(1)
  const onBounceRef = useRef<(() => void) | undefined>(onBounce)

  useEffect(() => {
    onBounceRef.current = onBounce
  }, [onBounce])

  useEffect(() => {
    const loop = (time: number) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = time
      }
      const deltaMs = time - lastTimeRef.current
      lastTimeRef.current = time

      const speedPerMs = (PATH_LENGTH * 2) / LOOP_DURATION_MS
      const delta = deltaMs * speedPerMs

      setHeadPos(prev => {
        let next = prev + directionRef.current * delta

        if (next > PATH_LENGTH) {
          const overflow = next - PATH_LENGTH
          next = PATH_LENGTH - overflow
          directionRef.current = -1
          onBounceRef.current?.()
        } else if (next < 0) {
          const overflow = -next
          next = overflow
          directionRef.current = 1
          onBounceRef.current?.()
        }

        return next
      })

      frameRef.current = window.requestAnimationFrame(loop)
    }

    frameRef.current = window.requestAnimationFrame(loop)

    return () => {
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current)
      }
      frameRef.current = null
      lastTimeRef.current = null
    }
  }, [])

  // Track dots are neutral grey; only the moving snake uses the agent color.
  const pathTint = `rgba(${TRACK_RGB.r}, ${TRACK_RGB.g}, ${TRACK_RGB.b}, 0.32)`

  const trailIndices = Array.from({ length: TRAIL_STEPS }, (_, i) => i)

  type TrailSample = { index: number; x: number }
  const samples: TrailSample[] = []

  for (const i of trailIndices) {
    const dir = directionRef.current
    const ideal = headPos - dir * i * TRAIL_SPACING
    const clamped = Math.max(0, Math.min(PATH_LENGTH, ideal))
    samples.push({ index: i, x: clamped })
  }

  samples.sort((a, b) => a.x - b.x)

  return (
    <div
      style={{
        position: 'relative',
        width: 56,
        height: 20,
        overflow: 'hidden',
      }}
    >
      {/* Track dots */}
      {Array.from({ length: PATH_DOT_COUNT }).map((_, i) => {
        const x = PATH_START_X + i * PATH_DOT_SPACING
        return (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`track-${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: 10,
              width: 3,
              height: 3,
              transform: 'translate(-50%, -50%)',
              backgroundColor: pathTint,
            }}
          />
        )
      })}

      {/* Head + trail */}
      {samples.map(sample => {
        const i = sample.index
        const t = i / (TRAIL_STEPS - 1 || 1)
        const size = Math.max(2, HEAD_SIZE - i * 0.6)
        const opacity = Math.max(0, 1 - i * 0.18)
        const colorRgb = lerpColor(agentColor, BACKGROUND_RGB, t)
        const color = rgbToString(colorRgb)
        const borderWidth = Math.max(1, 1.5 - i * 0.1)

        const isHead = i === 0

        return (
          <div
            key={`trail-${i}`}
            style={{
              position: 'absolute',
              left: PATH_START_X + sample.x,
              top: 10,
              width: size,
              height: size,
              transform: 'translate(-50%, -50%)',
              opacity,
              border: `${borderWidth}px solid ${color}`,
              backgroundColor: isHead
                ? `rgba(${agentColor.r}, ${agentColor.g}, ${agentColor.b}, 0.16)`
                : color,
              boxSizing: 'border-box',
            }}
          />
        )
      })}
    </div>
  )
}

export default AgentSyncTrail

