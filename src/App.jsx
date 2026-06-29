import { useState, useRef, useEffect } from 'react'
import Pathfinder from './Pathfinder'

function App() {
  const [array, setArray] = useState([40, 80, 20, 60, 100, 30, 70, 50])
  const [comparing, setComparing] = useState([])
  const [swapping, setSwapping] = useState([])
  const [sorted, setSorted] = useState([])
  const [speed, setSpeed] = useState(100)
  const [comparisons, setComparisons] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [theme, setTheme] = useState('light')

  // ── Step-by-step mode ──────────────────────────────────
  const [stepMode, setStepMode] = useState(false)
  const [steps, setSteps] = useState([])          // all steps for current sort
  const [stepIndex, setStepIndex] = useState(-1)  // which step we're on
  const [stepDesc, setStepDesc] = useState('')     // description shown below bars
  const stepArrayLen = useRef(0)                   // needed to finalize sorted state

  const timeoutsRef = useRef([])

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []
  }

  const generateArray = () => {
    clearTimeouts()
    setIsRunning(false)
    setSteps([])
    setStepIndex(-1)
    setStepDesc('')
    const newArr = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 250) + 20
    )
    setArray(newArr)
    setComparing([])
    setSwapping([])
    setSorted([])
    setComparisons(0)
  }

  // ── Auto-play animate (normal mode) ───────────────────
  const animate = (newSteps, n) => {
    if (stepMode) {
      // Step mode: just store steps, apply step 0 immediately
      stepArrayLen.current = n
      setSteps(newSteps)
      setStepIndex(0)
      applyStep(newSteps, 0, n)
      setIsRunning(true)
      return
    }

    setIsRunning(true)
    newSteps.forEach((step, i) => {
      const t = setTimeout(() => {
        setArray(step.array)
        setComparing(step.comparing || [])
        setSwapping(step.swapping || [])
        if (step.sorted) setSorted(step.sorted)
        setComparisons(i + 1)
        if (i === newSteps.length - 1) {
          setSorted(Array.from({ length: n }, (_, k) => k))
          setComparing([])
          setSwapping([])
          setIsRunning(false)
        }
      }, i * speed)
      timeoutsRef.current.push(t)
    })
  }

  // ── Apply a single step + generate its description ────
  const applyStep = (allSteps, idx, n) => {
    const step = allSteps[idx]
    const total = allSteps.length

    setArray(step.array)
    setComparing(step.comparing || [])
    setSwapping(step.swapping || [])
    if (step.sorted) setSorted(step.sorted)
    setComparisons(idx + 1)

    // Human-readable description
    if (step.swapping && step.swapping.length >= 2) {
      const [a, b] = step.swapping
      setStepDesc(`🔴 Swapping index ${a} (value ${step.array[a]}) and index ${b} (value ${step.array[b]})`)
    } else if (step.swapping && step.swapping.length === 1) {
      const [a] = step.swapping
      setStepDesc(`🔴 Placing value ${step.array[a]} at index ${a}`)
    } else if (step.comparing && step.comparing.length >= 2) {
      const [a, b] = step.comparing
      const bigger = step.array[a] > step.array[b] ? a : b
      setStepDesc(`🟡 Comparing index ${a} (${step.array[a]}) and index ${b} (${step.array[b]}) — ${step.array[a] === step.array[b] ? 'equal' : `${step.array[bigger]} is larger`}`)
    } else if (step.comparing && step.comparing.length === 1) {
      const [a] = step.comparing
      setStepDesc(`🟡 Examining index ${a} (value ${step.array[a]})`)
    } else {
      setStepDesc(`Step ${idx + 1} of ${total}`)
    }

    // Last step — mark all sorted
    if (idx === total - 1) {
      setSorted(Array.from({ length: n ?? stepArrayLen.current }, (_, k) => k))
      setComparing([])
      setSwapping([])
      setStepDesc('✅ Array fully sorted!')
      setIsRunning(false)
    }
  }

  // ── Next step button ──────────────────────────────────
  const nextStep = () => {
    const next = stepIndex + 1
    if (next >= steps.length) return
    setStepIndex(next)
    applyStep(steps, next, stepArrayLen.current)
  }

  // ── Prev step button ──────────────────────────────────
  const prevStep = () => {
    const prev = stepIndex - 1
    if (prev < 0) return
    setStepIndex(prev)
    applyStep(steps, prev, stepArrayLen.current)
    if (prev < steps.length - 1) setIsRunning(true) // re-enable if we went back
  }

  // ── Sort algorithms (unchanged logic) ─────────────────
  const bubbleSort = () => {
    const newSteps = []
    const a = [...array]
    const n = a.length
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        const didSwap = a[j] > a[j + 1]
        if (didSwap) { let t = a[j]; a[j] = a[j+1]; a[j+1] = t }
        newSteps.push({
          array: [...a],
          comparing: didSwap ? [] : [j, j+1],
          swapping: didSwap ? [j, j+1] : [],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k)
        })
      }
    }
    animate(newSteps, n)
  }

  const selectionSort = () => {
    const newSteps = []
    const a = [...array]
    const n = a.length
    for (let i = 0; i < n; i++) {
      let minIdx = i
      for (let j = i + 1; j < n; j++) {
        if (a[j] < a[minIdx]) minIdx = j
        newSteps.push({ array: [...a], comparing: [minIdx, j], sorted: Array.from({ length: i }, (_, k) => k) })
      }
      if (minIdx !== i) {
        let t = a[i]; a[i] = a[minIdx]; a[minIdx] = t
        newSteps.push({ array: [...a], swapping: [i, minIdx], sorted: Array.from({ length: i }, (_, k) => k) })
      }
      newSteps.push({ array: [...a], comparing: [], sorted: Array.from({ length: i+1 }, (_, k) => k) })
    }
    animate(newSteps, n)
  }

  const insertionSort = () => {
    const newSteps = []
    const a = [...array]
    const n = a.length
    for (let i = 1; i < n; i++) {
      let j = i
      while (j > 0 && a[j] < a[j-1]) {
        let t = a[j]; a[j] = a[j-1]; a[j-1] = t; j--
        newSteps.push({ array: [...a], swapping: [j, j+1], sorted: Array.from({ length: i }, (_, k) => k) })
      }
      newSteps.push({ array: [...a], comparing: [j], sorted: Array.from({ length: i }, (_, k) => k) })
    }
    animate(newSteps, n)
  }

  const mergeSort = () => {
    const newSteps = []
    const a = [...array]
    const merge = (arr, left, mid, right) => {
      const L = arr.slice(left, mid+1), R = arr.slice(mid+1, right+1)
      let i = 0, j = 0, k = left
      while (i < L.length && j < R.length) {
        newSteps.push({ array: [...arr], comparing: [left+i, mid+1+j] })
        if (L[i] <= R[j]) { arr[k] = L[i]; i++ } else { arr[k] = R[j]; j++ }
        newSteps.push({ array: [...arr], swapping: [k] }); k++
      }
      while (i < L.length) { arr[k] = L[i]; newSteps.push({ array: [...arr], swapping: [k] }); i++; k++ }
      while (j < R.length) { arr[k] = R[j]; newSteps.push({ array: [...arr], swapping: [k] }); j++; k++ }
    }
    const sort = (arr, l, r) => {
      if (l >= r) return
      const mid = Math.floor((l+r)/2)
      sort(arr, l, mid); sort(arr, mid+1, r); merge(arr, l, mid, r)
    }
    sort(a, 0, a.length-1)
    animate(newSteps, a.length)
  }

  const quickSort = () => {
    const newSteps = []
    const a = [...array]
    const partition = (arr, low, high) => {
      let i = low - 1
      for (let j = low; j < high; j++) {
        newSteps.push({ array: [...arr], comparing: [j, high] })
        if (arr[j] <= arr[high]) {
          i++
          let t = arr[i]; arr[i] = arr[j]; arr[j] = t
          newSteps.push({ array: [...arr], swapping: [i, j] })
        }
      }
      let t = arr[i+1]; arr[i+1] = arr[high]; arr[high] = t
      newSteps.push({ array: [...arr], swapping: [i+1, high] })
      return i+1
    }
    const sort = (arr, l, h) => {
      if (l >= h) return
      const pi = partition(arr, l, h)
      sort(arr, l, pi-1); sort(arr, pi+1, h)
    }
    sort(a, 0, a.length-1)
    animate(newSteps, a.length)
  }

  const heapSort = () => {
    const newSteps = []
    const a = [...array]
    const n = a.length
    const heapify = (arr, size, i) => {
      let largest = i
      const l = 2*i+1, r = 2*i+2
      newSteps.push({ array: [...arr], comparing: [i, l < size ? l : i] })
      if (l < size && arr[l] > arr[largest]) largest = l
      if (r < size && arr[r] > arr[largest]) largest = r
      if (largest !== i) {
        let t = arr[i]; arr[i] = arr[largest]; arr[largest] = t
        newSteps.push({ array: [...arr], swapping: [i, largest] })
        heapify(arr, size, largest)
      }
    }
    for (let i = Math.floor(n/2)-1; i >= 0; i--) heapify(a, n, i)
    for (let i = n-1; i > 0; i--) {
      let t = a[0]; a[0] = a[i]; a[i] = t
      newSteps.push({ array: [...a], swapping: [0, i], sorted: Array.from({ length: n-i }, (_, k) => n-1-k) })
      heapify(a, i, 0)
    }
    animate(newSteps, n)
  }

  const shellSort = () => {
    const newSteps = []
    const a = [...array]
    const n = a.length
    let gap = 1
    while (gap < Math.floor(n/3)) gap = gap*3+1
    while (gap >= 1) {
      for (let i = gap; i < n; i++) {
        let j = i
        newSteps.push({ array: [...a], comparing: [j, j-gap] })
        while (j >= gap && a[j] < a[j-gap]) {
          let t = a[j]; a[j] = a[j-gap]; a[j-gap] = t
          newSteps.push({ array: [...a], swapping: [j, j-gap] })
          j -= gap
        }
      }
      gap = Math.floor(gap/3)
    }
    animate(newSteps, n)
  }

  const radixSort = () => {
    const newSteps = []
    const a = [...array]
    const n = a.length
    const max = Math.max(...a)
    const countingSort = (arr, exp) => {
      const output = new Array(n).fill(0)
      const count = new Array(10).fill(0)
      for (let i = 0; i < n; i++) { count[Math.floor(arr[i]/exp)%10]++; newSteps.push({ array: [...arr], comparing: [i] }) }
      for (let i = 1; i < 10; i++) count[i] += count[i-1]
      for (let i = n-1; i >= 0; i--) { output[--count[Math.floor(arr[i]/exp)%10]] = arr[i] }
      for (let i = 0; i < n; i++) { arr[i] = output[i]; newSteps.push({ array: [...arr], swapping: [i] }) }
    }
    for (let exp = 1; Math.floor(max/exp) > 0; exp *= 10) countingSort(a, exp)
    animate(newSteps, n)
  }

  const getColor = (index) => {
    if (sorted.includes(index))    return '#2e7d32'
    if (swapping.includes(index))  return '#e53935'
    if (comparing.includes(index)) return '#f9a825'
    return 'var(--bar-default)'
  }

  const algoCards = [
    { name: 'Bubble Sort',    best: 'O(n)',       avg: 'O(n²)',      worst: 'O(n²)' },
    { name: 'Selection Sort', best: 'O(n²)',      avg: 'O(n²)',      worst: 'O(n²)' },
    { name: 'Insertion Sort', best: 'O(n)',       avg: 'O(n²)',      worst: 'O(n²)' },
    { name: 'Merge Sort',     best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
    { name: 'Quick Sort',     best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' },
    { name: 'Heap Sort',      best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
    { name: 'Shell Sort',     best: 'O(n log n)', avg: 'O(n log²n)', worst: 'O(n²)' },
    { name: 'Radix Sort',     best: 'O(nk)',      avg: 'O(nk)',      worst: 'O(nk)' },
  ]

  const isSortDone = stepMode && steps.length > 0 && stepIndex >= steps.length - 1

  return (
    <div style={{ padding: '20px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>Algo Visualizer</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Step mode toggle */}
          <button
            className="theme-toggle"
            onClick={() => { setStepMode(s => !s); generateArray() }}
            style={{ background: stepMode ? '#1565c0' : undefined, color: stepMode ? 'white' : undefined }}
          >
            {stepMode ? '⏸ Step mode ON' : '▶ Auto mode'}
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>

      {/* ── Sort buttons ── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={generateArray} disabled={isRunning && !stepMode}>Randomize</button>
        <button onClick={bubbleSort}    disabled={isRunning && !stepMode}>Bubble Sort</button>
        <button onClick={selectionSort} disabled={isRunning && !stepMode}>Selection Sort</button>
        <button onClick={insertionSort} disabled={isRunning && !stepMode}>Insertion Sort</button>
        <button onClick={mergeSort}     disabled={isRunning && !stepMode}>Merge Sort</button>
        <button onClick={quickSort}     disabled={isRunning && !stepMode}>Quick Sort</button>
        <button onClick={heapSort}      disabled={isRunning && !stepMode} style={{ background: '#7B1FA2', color: 'white', border: 'none' }}>Heap Sort</button>
        <button onClick={shellSort}     disabled={isRunning && !stepMode} style={{ background: '#00838F', color: 'white', border: 'none' }}>Shell Sort</button>
        <button onClick={radixSort}     disabled={isRunning && !stepMode} style={{ background: '#E65100', color: 'white', border: 'none' }}>Radix Sort</button>
      </div>

      {/* ── Speed + legend (only in auto mode) ── */}
      {!stepMode && (
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ color: 'var(--text)' }}>Speed:</label>
          <input type="range" min="10" max="500" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          <span style={{ color: 'var(--text-muted)' }}>{speed}ms</span>
          <span style={{ marginLeft: '20px', color: 'orange', fontWeight: 'bold' }}>
            Comparisons: {comparisons}
          </span>
          <div style={{ display: 'flex', gap: '12px', marginLeft: '16px', fontSize: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--bar-default)', marginRight: 4, borderRadius: 2 }} />Default</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#f9a825', marginRight: 4, borderRadius: 2 }} />Comparing</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#e53935', marginRight: 4, borderRadius: 2 }} />Swapping</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#2e7d32', marginRight: 4, borderRadius: 2 }} />Sorted</span>
          </div>
        </div>
      )}

      {/* ── Step controls (only in step mode) ── */}
      {stepMode && steps.length > 0 && (
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={prevStep} disabled={stepIndex <= 0}>◀ Prev</button>
          <button
            onClick={nextStep}
            disabled={isSortDone}
            style={{ background: isSortDone ? undefined : '#1565c0', color: isSortDone ? undefined : 'white', border: 'none', fontWeight: 'bold', padding: '6px 18px' }}
          >
            Next ▶
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Step {stepIndex + 1} / {steps.length}
          </span>
          <span style={{ color: 'orange', fontWeight: 'bold', fontSize: '13px' }}>
            Comparisons: {comparisons}
          </span>
        </div>
      )}

      {stepMode && steps.length === 0 && (
        <div style={{ marginTop: '14px', fontSize: '13px', color: 'var(--text-muted)' }}>
          👆 Pick a sort algorithm above to begin stepping through it.
        </div>
      )}

      {/* ── Bars ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '300px', marginTop: '20px' }}>
        {array.map((val, i) => (
          <div key={i} style={{
            height: val,
            flex: 1,
            background: getColor(i),
            transition: 'background 0.1s, height 0.05s'
          }} />
        ))}
      </div>

      {/* ── Step description box ── */}
      {stepMode && stepDesc && (
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          fontSize: '14px',
          color: 'var(--text)',
          minHeight: '40px',
          fontFamily: 'monospace'
        }}>
          {stepDesc}
        </div>
      )}

      {/* ── Complexity cards ── */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {algoCards.map((algo) => (
          <div key={algo.name} className="algo-card">
            <b>{algo.name}</b><br />
            Best: {algo.best}<br />
            Avg: {algo.avg}<br />
            Worst: {algo.worst}
          </div>
        ))}
      </div>

      <hr />
      <Pathfinder theme={theme} />
    </div>
  )
}

export default App