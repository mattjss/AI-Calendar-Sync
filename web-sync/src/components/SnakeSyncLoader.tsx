import { useEffect, useRef, useState } from 'react'

export type SnakeSyncLoaderProps = {
  color?: string
  segmentCount?: number
  /** Called once when one full sync cycle finishes (hit both walls, recoil, bounce). */
  onCycleComplete?: () => void
}

const DEFAULT_COLOR = '#FC4E09'
const TOTAL_SEGMENTS = 13
const MAX_TAIL = 5

// Figma 2405-1001: head = 6×6 with 1px stroke #FC4E09. Path = 2×2 squares, 3px gap. 1px spacing on all sides around path.
const PATH_SIZE = 2
const PATH_GAP = 3
const HEAD_SIZE = 6
const HEAD_STROKE = 1
const PATH_PADDING = 1
const HEAD_EXTRA_PADDING = 2

const TAIL_END_DARK = '#1a0f0a'
const TRACK_COLOR = '#2E2E2E'

const TRAVEL_MS = 1100
const RETRACT_MS = 320
const DWELL_MS = 140

type Rgb = { r: number; g: number; b: number }

function hexToRgb(hex: string): Rgb {
  const n = hex.replace('#', '').trim()
  if (n.length !== 6) return { r: 252, g: 78, b: 9 }
  const num = Number.parseInt(n, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

type Phase = 'moving' | 'retracting' | 'dwell'

export function SnakeSyncLoader({
  color = DEFAULT_COLOR,
  segmentCount = TOTAL_SEGMENTS,
  onCycleComplete,
}: SnakeSyncLoaderProps) {
  const [headPosition, setHeadPosition] = useState(0)
  const [direction, setDirection] = useState(1)
  const [phase, setPhase] = useState<Phase>('moving')
  const [tailLength, setTailLength] = useState(MAX_TAIL)
  const frameRef = useRef<number | null>(null)
  const stateRef = useRef({
    headPosition: 0,
    direction: 1,
    phase: 'moving' as Phase,
    tailLength: MAX_TAIL,
    phaseStartTime: 0,
  })
  const wallHitCountRef = useRef(0)
  const onCycleCompleteRef = useRef(onCycleComplete)
  onCycleCompleteRef.current = onCycleComplete
  const orangeRgb = hexToRgb(color)
  const darkRgb = hexToRgb(TAIL_END_DARK)

  useEffect(() => {
    stateRef.current = {
      headPosition: 0,
      direction: 1,
      phase: 'moving',
      tailLength: MAX_TAIL,
      phaseStartTime: performance.now(),
    }
    wallHitCountRef.current = 0
    setHeadPosition(0)
    setDirection(1)
    setPhase('moving')
    setTailLength(MAX_TAIL)
  }, [segmentCount])

  useEffect(() => {
    const maxIndex = segmentCount - 1

    const loop = (time: number) => {
      const s = stateRef.current
      const elapsed = time - s.phaseStartTime

      if (s.phase === 'moving') {
        const progress = elapsed / TRAVEL_MS
        if (progress >= 1) {
          const atWall = s.direction === 1 ? maxIndex : 0
          wallHitCountRef.current += 1
          if (wallHitCountRef.current === 3) {
            onCycleCompleteRef.current?.()
          }
          stateRef.current = {
            ...s,
            headPosition: atWall,
            phase: 'retracting',
            phaseStartTime: time,
          }
          setHeadPosition(atWall)
          setPhase('retracting')
        } else {
          const eased = 1 - Math.pow(1 - progress, 1.5)
          const pos = s.direction === 1 ? eased * maxIndex : maxIndex - eased * maxIndex
          stateRef.current = { ...s, headPosition: pos }
          setHeadPosition(pos)
        }
      } else if (s.phase === 'retracting') {
        const progress = Math.min(1, elapsed / RETRACT_MS)
        const len = MAX_TAIL * (1 - progress)
        stateRef.current = { ...s, tailLength: len }
        setTailLength(len)
        if (progress >= 1) {
          stateRef.current = {
            ...s,
            tailLength: 0,
            phase: 'dwell',
            phaseStartTime: time,
          }
          setTailLength(0)
          setPhase('dwell')
        }
      } else {
        if (elapsed >= DWELL_MS) {
          const newDir = s.direction === 1 ? -1 : 1
          stateRef.current = {
            headPosition: s.headPosition,
            direction: newDir,
            phase: 'moving',
            tailLength: MAX_TAIL,
            phaseStartTime: time,
          }
          setDirection(newDir)
          setPhase('moving')
          setTailLength(MAX_TAIL)
        }
      }

      frameRef.current = window.requestAnimationFrame(loop)
    }

    frameRef.current = window.requestAnimationFrame(loop)
    return () => {
      if (frameRef.current != null) window.cancelAnimationFrame(frameRef.current)
    }
  }, [segmentCount])

  const headIdx = headPosition
  const tailLen = tailLength
  const stepPx = PATH_SIZE + PATH_GAP

  const pathSegments = Array.from({ length: segmentCount }, (_, i) => {
    const tailDist = direction === 1 ? headIdx - i : i - headIdx
    const isTail = tailDist > 0 && tailDist <= tailLen

    if (isTail) {
      const tailSlot = tailDist
      const isTailEnd = tailSlot >= 4.5
      const t = isTailEnd ? Math.min(1, (tailSlot - 4) / 1) : 0
      const r = lerp(orangeRgb.r, darkRgb.r, t)
      const g = lerp(orangeRgb.g, darkRgb.g, t)
      const b = lerp(orangeRgb.b, darkRgb.b, t)
      const fill = isTailEnd ? `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})` : color
      return { i, fill }
    }
    return { i, fill: TRACK_COLOR }
  })

  const pathWidth = segmentCount * PATH_SIZE + (segmentCount - 1) * PATH_GAP
  const headLeft = PATH_PADDING + HEAD_EXTRA_PADDING + headIdx * stepPx + PATH_SIZE / 2 - HEAD_SIZE / 2
  const headTop = PATH_PADDING + PATH_SIZE / 2 - HEAD_SIZE / 2

  return (
    <div
      style={{
        paddingTop: PATH_PADDING,
        paddingBottom: PATH_PADDING,
        paddingLeft: PATH_PADDING + HEAD_EXTRA_PADDING,
        paddingRight: PATH_PADDING + HEAD_EXTRA_PADDING,
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: pathWidth,
        }}
      >
        {pathSegments.map((seg) => (
          <div
            key={seg.i}
            style={{
              width: PATH_SIZE,
              height: PATH_SIZE,
              marginRight: seg.i < segmentCount - 1 ? PATH_GAP : 0,
              backgroundColor: seg.fill,
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: headLeft,
          top: headTop,
          width: HEAD_SIZE,
          height: HEAD_SIZE,
          border: `${HEAD_STROKE}px solid ${color}`,
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

export default SnakeSyncLoader
