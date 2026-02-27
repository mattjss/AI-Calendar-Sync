import { useEffect, useRef, useState } from 'react'

type Rgb = { r: number; g: number; b: number }

export type AgentSyncDotProps = {
  color?: string
  dotCount?: number
  trailLength?: number
  speedMsPerLoop?: number
}

const DEFAULT_COLOR = '#FC4E09'
const DEFAULT_DOT_COUNT = 18
const DEFAULT_TRAIL_LENGTH = 7
const DEFAULT_LOOP_MS = 2600

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '').trim()
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

function rgbToString({ r, g, b }: Rgb, alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function AgentSyncDot({
  color = DEFAULT_COLOR,
  dotCount = DEFAULT_DOT_COUNT,
  trailLength = DEFAULT_TRAIL_LENGTH,
  speedMsPerLoop = DEFAULT_LOOP_MS,
}: AgentSyncDotProps) {
  const [headIndex, setHeadIndex] = useState(0)
  const lastTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  const agentRgb = hexToRgb(color)
  const backgroundRgb: Rgb = { r: 26, g: 26, b: 26 }

  useEffect(() => {
    const loop = (time: number) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = time
      }
      const deltaMs = time - lastTimeRef.current
      lastTimeRef.current = time

      const stepPerMs = dotCount / speedMsPerLoop
      const deltaSteps = deltaMs * stepPerMs

      setHeadIndex(prev => {
        let next = prev + deltaSteps
        if (next >= dotCount) {
          next -= dotCount
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
  }, [dotCount, speedMsPerLoop])

  const dots = Array.from({ length: dotCount }, (_, index) => {
    const rawDistance = (headIndex - index + dotCount) % dotCount
    const isInTrail = rawDistance < trailLength

    const baseTrackSize = 3
    const baseTrackColor = rgbToString(agentRgb, 0.22)

    if (!isInTrail) {
      return {
        index,
        size: baseTrackSize,
        borderWidth: 0,
        borderColor: 'transparent',
        fillColor: baseTrackColor,
      }
    }

    const i = rawDistance
    const t = i / Math.max(trailLength - 1, 1)

    const headSize = 8
    const size = Math.max(2, headSize - i * 0.6)
    const opacity = Math.max(0, 1 - i * 0.18)
    const borderWidth = Math.max(1, 1.5 - i * 0.1)
    const colorRgb = lerpColor(agentRgb, backgroundRgb, t)
    const color = rgbToString(colorRgb, opacity)

    const isHead = i === 0

    return {
      index,
      size,
      borderWidth,
      borderColor: color,
      fillColor: isHead
        ? rgbToString(agentRgb, 0.18)
        : rgbToString(colorRgb, opacity),
    }
  })

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'transparent',
      }}
    >
      {dots.map(dot => (
        <div
          key={dot.index}
          style={{
            width: dot.size,
            height: dot.size,
            borderRadius: 1,
            border:
              dot.borderWidth > 0
                ? `${dot.borderWidth}px solid ${dot.borderColor}`
                : 'none',
            backgroundColor: dot.fillColor,
            boxSizing: 'border-box',
          }}
        />
      ))}
    </div>
  )
}

export default AgentSyncDot

