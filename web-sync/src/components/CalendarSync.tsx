import { useEffect, useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'

const imgFrame =
  'http://localhost:3845/assets/db9efd30507e9118d265cbb322d8806c99c70c40.svg'
const imgFrameComplete =
  'http://localhost:3845/assets/374e105b69850c94338e662467e4f0021a9b99c4.svg'
const imgFrameShimmer =
  'http://localhost:3845/assets/6d4a3ee6fee13e4da4f3de57d72efd7d0501fe00.svg'

export type CalendarSyncState = 'Default' | 'Syncing' | 'Shimmer' | 'Complete'

type Props = {
  state?: CalendarSyncState
}

export function CalendarSync({ state: controlledState }: Props) {
  const [internalState, setInternalState] = useState<CalendarSyncState>('Default')
  const state = controlledState ?? internalState

  useEffect(() => {
    if (controlledState) return
    let timeout: number | undefined
    if (state === 'Default') {
      timeout = window.setTimeout(() => setInternalState('Syncing'), 800)
    } else if (state === 'Syncing') {
      timeout = window.setTimeout(() => setInternalState('Shimmer'), 1200)
    } else if (state === 'Shimmer') {
      timeout = window.setTimeout(() => setInternalState('Complete'), 900)
    }
    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout)
    }
  }, [state, controlledState])

  const isCompleteOrShimmer = state === 'Complete' || state === 'Shimmer'
  const isShimmer = state === 'Shimmer'
  const isSyncing = state === 'Syncing'

  return (
    <MotionConfig transition={{ type: 'spring', stiffness: 280, damping: 22 }}>
      <motion.div
        className="calendar-sync-root"
        style={{
          backgroundColor: '#101010',
          border: `1px solid ${isSyncing ? '#2e2e2e' : '#3f3f3f'}`,
          width: 316,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
        layout
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
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
                src={imgFrame}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
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

          <motion.div
            layout
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCompleteOrShimmer ? 'center' : isSyncing ? 'center' : 'flex-end',
              paddingInline: isCompleteOrShimmer ? 12 : isSyncing ? 0 : 12,
              paddingBlock: isCompleteOrShimmer || !isSyncing ? 4 : 0,
              width: isCompleteOrShimmer ? 21 : isSyncing ? 56 : undefined,
              height: isCompleteOrShimmer ? 21 : isSyncing ? 20 : undefined,
              border: '1px solid #2e2e2e',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCompleteOrShimmer && (
                <motion.div
                  key={isShimmer ? 'shimmer' : 'complete'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    position: 'relative',
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={isShimmer ? imgFrameShimmer : imgFrameComplete}
                    alt=""
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </motion.div>
              )}

              {state === 'Default' && (
                <motion.p
                  key="default-label"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{
                    fontFamily:
                      '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: 10,
                    color: '#767676',
                  }}
                >
                  Sync
                </motion.p>
              )}

              {isSyncing && (
                <motion.div
                  key="syncing-bars"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'max-content',
                    gridTemplateRows: 'max-content',
                    lineHeight: 0,
                    position: 'relative',
                  }}
                >
                  <motion.div
                    style={{ display: 'flex', gap: 1, alignItems: 'center' }}
                    animate={{ x: ['0%', '-40%'] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div
                        key={index}
                        style={{
                          width: 2,
                          height: 2,
                          backgroundColor: '#767676',
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </MotionConfig>
  )
}

export default CalendarSync

