import { useState, useRef } from 'react'

// ── Sorting algorithms that return a step list ──────────────
// Each step: { array, comparing: [i,j], swapping: [i,j] }
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
          if (didSwap) { let t = a[j]; a[j] = a[j+1]; a[j+1] = t }
          steps.push({ array: [...a], comparing: didSwap ? [] : [j, j+1], swapping: didSwap ? [j, j+1] : [] })
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
          let t = a[i]; a[i] = a[minIdx]; a[minIdx] = t
          steps.push({ array: [...a], swapping: [i, minIdx] })
        }
      }
      return steps
    }
  },
  insertion: {
    label: 'Insertion Sort',
    color: '#6a1b9a',
    run: (arr) => {
      const steps = []
      const a = [...arr]
      const n = a.length
      for (let i = 1; i < n; i++) {
        let j = i
        while (j > 0 && a[j] < a[j-1]) {
          let t = a[j]; a[j] = a[j-1]; a[j-1] = t; j--
          steps.push({ array: [...a], swapping: [j, j+1] })
        }
        steps.push({ array: [...a], comparing: [j] })
      }
      return steps
    }
  },
  merge: {
    label: 'Merge Sort',
    color: '#00838f',
    run: (arr) => {
      const steps = []
      const a = [...arr]
      const merge = (a2, left, mid, right) => {
        const L = a2.slice(left, mid+1), R = a2.slice(mid+1, right+1)
        let i = 0, j = 0, k = left
        while (i < L.length && j < R.length) {
          steps.push({ array: [...a2], comparing: [left+i, mid+1+j] })
          if (L[i] <= R[j]) { a2[k] = L[i]; i++ } else { a2[k] = R[j]; j++ }
          steps.push({ array: [...a2], swapping: [k] }); k++
        }
        while (i < L.length) { a2[k] = L[i]; steps.push({ array: [...a2], swapping: [k] }); i++; k++ }
        while (j < R.length) { a2[k] = R[j]; steps.push({ array: [...a2], swapping: [k] }); j++; k++ }
      }
      const sort = (a2, l, r) => {
        if (l >= r) return
        const mid = Math.floor((l+r)/2)
        sort(a2, l, mid); sort(a2, mid+1, r); merge(a2, l, mid, r)
      }
      sort(a, 0, a.length-1)
      return steps
    }
  },
  quick: {
    label: 'Quick Sort',
    color: '#2e7d32',
    run: (arr) => {
      const steps = []
      const a = [...arr]
      const partition = (a2, low, high) => {
        let i = low - 1
        for (let j = low; j < high; j++) {
          steps.push({ array: [...a2], comparing: [j, high] })
          if (a2[j] <= a2[high]) {
            i++
            let t = a2[i]; a2[i] = a2[j]; a2[j] = t
            steps.push({ array: [...a2], swapping: [i, j] })
          }
        }
        let t = a2[i+1]; a2[i+1] = a2[high]; a2[high] = t
        steps.push({ array: [...a2], swapping: [i+1, high] })
        return i+1
      }
      const sort = (a2, l, h) => {
        if (l >= h) return
        const pi = partition(a2, l, h)
        sort(a2, l, pi-1); sort(a2, pi+1, h)
      }
      sort(a, 0, a.length-1)
      return steps
    }
  },
  heap: {
    label: 'Heap Sort',
    color: '#7B1FA2',
    run: (arr) => {
      const steps = []
      const a = [...arr]
      const n = a.length
      const heapify = (a2, size, i) => {
        let largest = i
        const l = 2*i+1, r = 2*i+2
        steps.push({ array: [...a2], comparing: [i, l < size ? l : i] })
        if (l < size && a2[l] > a2[largest]) largest = l
        if (r < size && a2[r] > a2[largest]) largest = r
        if (largest !== i) {
          let t = a2[i]; a2[i] = a2[largest]; a2[largest] = t
          steps.push({ array: [...a2], swapping: [i, largest] })
          heapify(a2, size, largest)
        }
      }
      for (let i = Math.floor(n/2)-1; i >= 0; i--) heapify(a, n, i)
      for (let i = n-1; i > 0; i--) {
        let t = a[0]; a[0] = a[i]; a[i] = t
        steps.push({ array: [...a], swapping: [0, i] })
        heapify(a, i, 0)
      }
      return steps
    }
  },
  shell: {
    label: 'Shell Sort',
    color: '#00838F',
    run: (arr) => {
      const steps = []
      const a = [...arr]
      const n = a.length
      let gap = 1
      while (gap < Math.floor(n/3)) gap = gap*3+1
      while (gap >= 1) {
        for (let i = gap; i < n; i++) {
          let j = i
          steps.push({ array: [...a], comparing: [j, j-gap] })
          while (j >= gap && a[j] < a[j-gap]) {
            let t = a[j]; a[j] = a[j-gap]; a[j-gap] = t
            steps.push({ array: [...a], swapping: [j, j-gap] })
            j -= gap
          }
        }
        gap = Math.floor(gap/3)
      }
      return steps
    }
  },
  radix: {
    label: 'Radix Sort',
    color: '#E65100',
    run: (arr) => {
      const steps = []
      const a = [...arr]
      const n = a.length
      const max = Math.max(...a)
      const countingSort = (a2, exp) => {
        const output = new Array(n).fill(0)
        const count = new Array(10).fill(0)
        for (let i = 0; i < n; i++) { count[Math.floor(a2[i]/exp)%10]++; steps.push({ array: [...a2], comparing: [i] }) }
        for (let i = 1; i < 10; i++) count[i] += count[i-1]
        for (let i = n-1; i >= 0; i--) { output[--count[Math.floor(a2[i]/exp)%10]] = a2[i] }
        for (let i = 0; i < n; i++) { a2[i] = output[i]; steps.push({ array: [...a2], swapping: [i] }) }
      }
      for (let exp = 1; Math.floor(max/exp) > 0; exp *= 10) countingSort(a, exp)
      return steps
    }
  }
}

const ARRAY_SIZE = 20
const genArray = () => Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 250) + 20)

function RaceTrack({ algoKey, array, comparing, swapping, opsCount, finished, finishTime }) {
  const algo = algorithms[algoKey]
  const getColor = (i) => {
    if (finished) return '#2e7d32'
    if (swapping.includes(i)) return '#e53935'
    if (comparing.includes(i)) return '#f9a825'
    return algo.color
  }

  return (
    <div style={{ flex: 1, minWidth: '280px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>{algo.label}</span>
        {finished && <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 'bold' }}>✅ {finishTime}ms</span>}
      </div>

      {/* Live ops counter bar */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '3px' }}>
          <span>Operations</span>
          <span style={{ fontWeight: 'bold', color: algo.color }}>{opsCount}</span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, (opsCount / 400) * 100)}%`,
            background: algo.color,
            transition: 'width 0.05s linear'
          }} />
        </div>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '180px', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px', background: 'var(--bg-card)' }}>
        {array.map((val, i) => (
          <div key={i} style={{
            height: `${val * 0.6}px`,
            flex: 1,
            background: getColor(i),
            transition: 'background 0.05s'
          }} />
        ))}
      </div>
    </div>
  )
}

function RaceMode({ theme }) {
  const [baseArray, setBaseArray] = useState(genArray())
  const [algoA, setAlgoA] = useState('bubble')
  const [algoB, setAlgoB] = useState('quick')
  const [speed, setSpeed] = useState(30)
  const [isRacing, setIsRacing] = useState(false)

  const [stateA, setStateA] = useState({ array: baseArray, comparing: [], swapping: [], ops: 0, finished: false, time: 0 })
  const [stateB, setStateB] = useState({ array: baseArray, comparing: [], swapping: [], ops: 0, finished: false, time: 0 })

  const timeoutsRef = useRef([])

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t))
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

    let doneCount = 0
    const checkDone = () => {
      doneCount++
      if (doneCount === 2) setIsRacing(false)
    }

    stepsA.forEach((step, i) => {
      const t = setTimeout(() => {
        setStateA(prev => ({
          ...prev,
          array: step.array,
          comparing: step.comparing || [],
          swapping: step.swapping || [],
          ops: i + 1
        }))
        if (i === stepsA.length - 1) {
          setStateA(prev => ({ ...prev, finished: true, comparing: [], swapping: [], time: Date.now() - startTime }))
          checkDone()
        }
      }, i * speed)
      timeoutsRef.current.push(t)
    })

    stepsB.forEach((step, i) => {
      const t = setTimeout(() => {
        setStateB(prev => ({
          ...prev,
          array: step.array,
          comparing: step.comparing || [],
          swapping: step.swapping || [],
          ops: i + 1
        }))
        if (i === stepsB.length - 1) {
          setStateB(prev => ({ ...prev, finished: true, comparing: [], swapping: [], time: Date.now() - startTime }))
          checkDone()
        }
      }, i * speed)
      timeoutsRef.current.push(t)
    })
  }

  const winner = stateA.finished && stateB.finished
    ? (stateA.ops < stateB.ops ? algoA : stateB.ops < stateA.ops ? algoB : null)
    : null

  return (
    <div style={{ marginTop: '20px' }}>
      <h2 style={{ marginBottom: '12px', color: 'var(--text)' }}>Algorithm race</h2>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
        <select value={algoA} onChange={(e) => setAlgoA(e.target.value)} disabled={isRacing}>
          {Object.entries(algorithms).map(([key, a]) => <option key={key} value={key}>{a.label}</option>)}
        </select>
        <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>vs</span>
        <select value={algoB} onChange={(e) => setAlgoB(e.target.value)} disabled={isRacing}>
          {Object.entries(algorithms).map(([key, a]) => <option key={key} value={key}>{a.label}</option>)}
        </select>

        <button
          onClick={race}
          disabled={isRacing}
          style={{ background: isRacing ? undefined : '#1565c0', color: isRacing ? undefined : 'white', border: 'none', fontWeight: 'bold', padding: '6px 16px' }}
        >
          {isRacing ? 'Racing...' : '🏁 Start race'}
        </button>
        <button onClick={reset} disabled={isRacing}>New array</button>

        <label style={{ color: 'var(--text)', marginLeft: '8px' }}>Speed:</label>
        <input type="range" min="5" max="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} disabled={isRacing} />
      </div>

      {winner && (
        <div style={{
          marginBottom: '12px',
          padding: '8px 14px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          fontSize: '13px',
          color: 'var(--text)'
        }}>
          🏆 <strong>{algorithms[winner].label}</strong> won with fewer operations —{' '}
          {stateA.ops} vs {stateB.ops} comparisons/swaps total.
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <RaceTrack algoKey={algoA} array={stateA.array} comparing={stateA.comparing} swapping={stateA.swapping} opsCount={stateA.ops} finished={stateA.finished} finishTime={stateA.time} />
        <RaceTrack algoKey={algoB} array={stateB.array} comparing={stateB.comparing} swapping={stateB.swapping} opsCount={stateB.ops} finished={stateB.finished} finishTime={stateB.time} />
      </div>
    </div>
  )
}

export default RaceMode