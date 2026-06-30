import { useState, useRef } from 'react'
import "./styles/race.css"

/* ─────────────────────────────────────────────
   Algorithms (UNCHANGED)
───────────────────────────────────────────── */

const algorithms = {
  bubble: {
    label: 'Bubble Sort',
    color: '#1565c0',
    run: (arr) => {
      const steps = []
      const a = [...arr]
      const n = a.length
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          const didSwap = a[j] > a[j + 1]
          if (didSwap) {
            let t = a[j]
            a[j] = a[j + 1]
            a[j + 1] = t
          }
          steps.push({
            array: [...a],
            comparing: didSwap ? [] : [j, j + 1],
            swapping: didSwap ? [j, j + 1] : []
          })
        }
      }
      return steps
    }
  },

  selection: {
    label: 'Selection Sort',
    color: '#d84315',
    run: (arr) => {
      const steps = []
      const a = [...arr]
      const n = a.length

      for (let i = 0; i < n; i++) {
        let minIdx = i
        for (let j = i + 1; j < n; j++) {
          if (a[j] < a[minIdx]) minIdx = j
          steps.push({ array: [...a], comparing: [minIdx, j] })
        }
        if (minIdx !== i) {
          let t = a[i]
          a[i] = a[minIdx]
          a[minIdx] = t
          steps.push({ array: [...a], swapping: [i, minIdx] })
        }
      }
      return steps
    }
  }
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

const ARRAY_SIZE = 20
const genArray = () =>
  Array.from({ length: ARRAY_SIZE }, () =>
    Math.floor(Math.random() * 250) + 20
  )

/* ─────────────────────────────────────────────
   UI Component (Cleaned)
───────────────────────────────────────────── */

function RaceTrack({ algoKey, array, comparing, swapping, opsCount, finished, finishTime }) {
  const algo = algorithms[algoKey]

  const getColor = (i) => {
    if (finished) return '#22c55e'
    if (swapping.includes(i)) return '#ef4444'
    if (comparing.includes(i)) return '#facc15'
    return algo.color
  }

  return (
    <div style={{ flex: 1, minWidth: '280px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>{algo.label}</span>
        {finished && (
          <span style={{ color: '#22c55e', fontSize: '12px' }}>
            ✅ {finishTime}ms
          </span>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '2px',
        height: '180px',
        padding: '6px',
        borderRadius: '8px',
        background: '#111827'
      }}>
        {array.map((val, i) => (
          <div
            key={i}
            style={{
              height: `${val * 0.6}px`,
              flex: 1,
              background: getColor(i),
              transition: '0.05s'
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */

export default function RaceMode() {
  const [baseArray, setBaseArray] = useState(genArray())
  const [algoA, setAlgoA] = useState('bubble')
  const [algoB, setAlgoB] = useState('selection')
  const [speed, setSpeed] = useState(30)
  const [isRacing, setIsRacing] = useState(false)

  const [stateA, setStateA] = useState({ array: baseArray, comparing: [], swapping: [], ops: 0, finished: false, time: 0 })
  const [stateB, setStateB] = useState({ array: baseArray, comparing: [], swapping: [], ops: 0, finished: false, time: 0 })

  const timeoutsRef = useRef([])

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  const reset = () => {
    clearTimeouts()
    setIsRacing(false)

    const fresh = genArray()
    setBaseArray(fresh)

    setStateA({ array: fresh, comparing: [], swapping: [], ops: 0, finished: false, time: 0 })
    setStateB({ array: fresh, comparing: [], swapping: [], ops: 0, finished: false, time: 0 })
  }

  const race = () => {
    if (isRacing) return
    clearTimeouts()
    setIsRacing(true)

    const stepsA = algorithms[algoA].run(baseArray)
    const stepsB = algorithms[algoB].run(baseArray)

    const startTime = Date.now()

    setStateA(s => ({ ...s, array: baseArray, ops: 0, finished: false }))
    setStateB(s => ({ ...s, array: baseArray, ops: 0, finished: false }))

    let done = 0
    const check = () => {
      done++
      if (done === 2) setIsRacing(false)
    }

    stepsA.forEach((step, i) => {
      setTimeout(() => {
        setStateA(prev => ({
          ...prev,
          array: step.array,
          comparing: step.comparing || [],
          swapping: step.swapping || [],
          ops: i + 1
        }))

        if (i === stepsA.length - 1) {
          setStateA(prev => ({
            ...prev,
            finished: true,
            time: Date.now() - startTime
          }))
          check()
        }
      }, i * speed)
    })

    stepsB.forEach((step, i) => {
      setTimeout(() => {
        setStateB(prev => ({
          ...prev,
          array: step.array,
          comparing: step.comparing || [],
          swapping: step.swapping || [],
          ops: i + 1
        }))

        if (i === stepsB.length - 1) {
          setStateB(prev => ({
            ...prev,
            finished: true,
            time: Date.now() - startTime
          }))
          check()
        }
      }, i * speed)
    })
  }

  const winner =
    stateA.finished && stateB.finished
      ? stateA.ops < stateB.ops
        ? algoA
        : algoB
      : null

  return (
    <div style={{ marginTop: '20px', padding: '0 12px' }}>

      {/* TITLE */}
      <h2 className="section-heading">
        🏁 Grand Prix
      </h2>

      {/* CONTROLS */}
      <div className="race-controls">

        <select value={algoA} onChange={(e) => setAlgoA(e.target.value)} disabled={isRacing}>
          {Object.entries(algorithms).map(([k, a]) => (
            <option key={k} value={k}>{a.label}</option>
          ))}
        </select>

        <span style={{ color: '#94a3b8' }}>VS</span>

        <select value={algoB} onChange={(e) => setAlgoB(e.target.value)} disabled={isRacing}>
          {Object.entries(algorithms).map(([k, a]) => (
            <option key={k} value={k}>{a.label}</option>
          ))}
        </select>

        <button onClick={race} disabled={isRacing}>
          {isRacing ? 'Racing...' : '🏁 Start'}
        </button>

        <button onClick={reset} disabled={isRacing}>
          Reset
        </button>

        <label style={{ color: '#fff' }}>Speed</label>

        <input
          type="range"
          min="5"
          max="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={isRacing}
        />
      </div>

      {/* WINNER */}
      {winner && (
        <div style={{
          background: '#111827',
          padding: '10px',
          borderRadius: '10px',
          marginBottom: '12px',
          border: '1px solid #1f2937'
        }}>
          🏆 Winner: <b>{algorithms[winner].label}</b>
        </div>
      )}

      {/* TRACKS */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <RaceTrack {...stateA} algoKey={algoA} />
        <RaceTrack {...stateB} algoKey={algoB} />
      </div>

    </div>
  )
}