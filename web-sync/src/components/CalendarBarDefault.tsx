export function CalendarBarDefault() {
  return (
    <div
      style={{
        width: 316,
        height: 45,
        backgroundColor: '#101010',
        border: '1px solid #3f3f3f',
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
            src="http://localhost:3845/assets/db9efd30507e9118d265cbb322d8806c99c70c40.svg"
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

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingInline: 12,
          paddingBlock: 4,
          border: '1px solid #2e2e2e',
          width: 48,
          height: 21,
        }}
      >
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
      </div>
    </div>
  )
}

export default CalendarBarDefault

