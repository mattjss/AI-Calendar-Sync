import { useState } from 'react'
import { motion } from 'framer-motion'
import AgentSyncTrail from './AgentSyncTrail'

const ICON_SRC =
  'http://localhost:3845/assets/db9efd30507e9118d265cbb322d8806c99c70c40.svg'

type BarState = 'idle' | 'syncing' | 'complete'

function CheckComplete() {
  return (
    <div
      style={{
        position: 'relative',
        width: 16,
        height: 16,
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
  const [, setBounceCount] = useState(0)

  const outerBorder = state === 'syncing' ? '#2e2e2e' : '#3f3f3f'

  const ctaWidth = state === 'idle' ? 48 : state === 'syncing' ? 56 : 21
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

      <motion.button
        type="button"
        onClick={() => {
          if (state === 'idle') {
            setBounceCount(0)
            setState('syncing')
          } else if (state === 'complete') {
            setBounceCount(0)
            setState('idle')
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #2e2e2e',
          backgroundColor: 'transparent',
          padding: 0,
          cursor: 'pointer',
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
          <AgentSyncTrail
            onBounce={() => {
              setBounceCount(prev => {
                const next = prev + 1
                // 6 bounces = 3 hits per side
                if (next >= 6) {
                  setState('complete')
                }
                return next
              })
            }}
          />
        )}

        {state === 'complete' && <CheckComplete />}
      </motion.button>
    </div>
  )
}

export default CalendarBar

