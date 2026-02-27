import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import SnakeSyncLoader from './SnakeSyncLoader'

const ICON_SRC =
  'http://localhost:3845/assets/db9efd30507e9118d265cbb322d8806c99c70c40.svg'

// Figma: State 1 = default (idle), State 2 = sync (syncing), State 3 = complete (check + shimmer)
type BarState = 'idle' | 'syncing' | 'complete'

function CheckComplete() {
  return (
    <div
      style={{
        position: 'relative',
        width: 16,
        height: 16,
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 20 20">
          <motion.path
            d="M5 10.5 8.2 14 15 6"
            fill="none"
            stroke="#767676"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </svg>
      </div>
    </div>
  )
}

export function CalendarBar() {
  const [state, setState] = useState<BarState>('idle')

  // State 3 (complete): after 5s return to State 1 (default)
  useEffect(() => {
    if (state !== 'complete') return
    const timer = window.setTimeout(() => {
      setState('idle')
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [state])

  const outerBorder = state === 'syncing' ? '#2e2e2e' : '#3f3f3f'

  // Match Figma-ish widths: compact idle label, full snake track in syncing, small checkbox in complete
  const ctaWidth = state === 'idle' ? 48 : state === 'syncing' ? 78 : 21
  const ctaHeight = state === 'idle' ? 21 : 21

  return (
    <div
      style={{
        width: 316,
        height: 45,
        backgroundColor: '#101010',
        border: `1px solid ${outerBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            position: 'relative',
            width: 16,
            height: 16,
            flexShrink: 0,
          }}
        >
          <img
            src={ICON_SRC}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
          />
        </div>
        <p
          style={{
            fontFamily:
              '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 12,
            color: '#797979',
          }}
        >
          Calendar
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <motion.button
          type="button"
          onClick={() => {
            if (state === 'idle') {
              setState('syncing') // State 1 → State 2: press Sync CTA
            } else if (state === 'complete') {
              setState('idle') // State 3 → State 1: click to reset
            }
          }}
          className={state === 'complete' ? 'checkbox-frame' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: state === 'syncing' ? 'flex-start' : 'center',
            border: '1px solid #2e2e2e',
            backgroundColor: 'transparent',
            padding: state === 'syncing' ? '0 4px' : 0,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          layout
          animate={{ width: ctaWidth, height: ctaHeight }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        >
          {state === 'idle' && (
            <p
              style={{
                fontFamily:
                  '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: 10,
                color: '#767676',
              }}
            >
              Sync
            </p>
          )}

        {state === 'syncing' && (
            <SnakeSyncLoader
              color="#FC4E09"
              segmentCount={13}
              onCycleComplete={() => setState('complete')}
            />
          )}

        {state === 'complete' && <CheckComplete />}
        </motion.button>
      </div>
    </div>
  )
}

export default CalendarBar

