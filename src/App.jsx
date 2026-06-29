import { useState, useRef } from 'react'
import Pathfinder from './Pathfinder'

function App() {
  const [array, setArray] = useState([40, 80, 20, 60, 100, 30, 70, 50])
  const [comparing, setComparing] = useState([])
  const [swapping, setSwapping] = useState([])
  const [sorted, setSorted] = useState([])
  const [speed, setSpeed] = useState(100)
  const [comparisons, setComparisons] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timeoutsRef = useRef([])

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []
  }

  const generateArray = () => {
    clearTimeouts()
    setIsRunning(false)
    const newArr = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 250) + 20
    )
    setArray(newArr)
    setComparing([])
    setSwapping([])
    setSorted([])
    setComparisons(0)
  }

  // steps now support: comparing, swapping, sorted fields
  const animate = (steps, n) => {
    setIsRunning(true)
    steps.forEach((step, i) => {
      const t = setTimeout(() => {
        setArray(step.array)
        setComparing(step.comparing || [])
        setSwapping(step.swapping || [])
        if (step.sorted) setSorted(step.sorted)
        setComparisons(i + 1)
        if (i === steps.length - 1) {
          setSorted(Array.from({ length: n }, (_, k) => k))
          setComparing([])
          setSwapping([])
          setIsRunning(false)
        }
      }, i * speed)
      timeoutsRef.current.push(t)
    })
  }

  // ─── Bubble Sort ─────────────────────────────────────────
  const bubbleSort = () => {
    const steps = []
    const a = [...array]
    const n = a.length
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        const didSwap = a[j] > a[j + 1]
        if (didSwap) {
          let temp = a[j]; a[j] = a[j + 1]; a[j + 1] = temp
        }
        steps.push({
          array: [...a],
          comparing: didSwap ? [] : [j, j + 1],
          swapping: didSwap ? [j, j + 1] : [],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k)
        })
      }
    }
    animate(steps, n)
  }

  // ─── Selection Sort ──────────────────────────────────────
  const selectionSort = () => {
    const steps = []
    const a = [...array]
    const n = a.length
    for (let i = 0; i < n; i++) {
      let minIdx = i
      for (let j = i + 1; j < n; j++) {
        if (a[j] < a[minIdx]) minIdx = j
        steps.push({
          array: [...a],
          comparing: [minIdx, j],
          sorted: Array.from({ length: i }, (_, k) => k)
        })
      }
      if (minIdx !== i) {
        let temp = a[i]; a[i] = a[minIdx]; a[minIdx] = temp
        steps.push({
          array: [...a],
          swapping: [i, minIdx],
          sorted: Array.from({ length: i }, (_, k) => k)
        })
      }
      steps.push({
        array: [...a],
        comparing: [],
        sorted: Array.from({ length: i + 1 }, (_, k) => k)
      })
    }
    animate(steps, n)
  }

  // ─── Insertion Sort ──────────────────────────────────────
  const insertionSort = () => {
    const steps = []
    const a = [...array]
    const n = a.length
    for (let i = 1; i < n; i++) {
      let j = i
      while (j > 0 && a[j] < a[j - 1]) {
        let temp = a[j]; a[j] = a[j - 1]; a[j - 1] = temp; j--
        steps.push({
          array: [...a],
          swapping: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => k)
        })
      }
      steps.push({ array: [...a], comparing: [j], sorted: Array.from({ length: i }, (_, k) => k) })
    }
    animate(steps, n)
  }

  // ─── Merge Sort ──────────────────────────────────────────
  const mergeSort = () => {
    const steps = []
    const a = [...array]
    const merge = (arr, left, mid, right) => {
      const leftArr = arr.slice(left, mid + 1)
      const rightArr = arr.slice(mid + 1, right + 1)
      let i = 0, j = 0, k = left
      while (i < leftArr.length && j < rightArr.length) {
        steps.push({ array: [...arr], comparing: [left + i, mid + 1 + j] })
        if (leftArr[i] <= rightArr[j]) { arr[k] = leftArr[i]; i++ }
        else { arr[k] = rightArr[j]; j++ }
        steps.push({ array: [...arr], swapping: [k] }); k++
      }
      while (i < leftArr.length) {
        arr[k] = leftArr[i]
        steps.push({ array: [...arr], swapping: [k] }); i++; k++
      }
      while (j < rightArr.length) {
        arr[k] = rightArr[j]
        steps.push({ array: [...arr], swapping: [k] }); j++; k++
      }
    }
    const sort = (arr, left, right) => {
      if (left >= right) return
      const mid = Math.floor((left + right) / 2)
      sort(arr, left, mid); sort(arr, mid + 1, right)
      merge(arr, left, mid, right)
    }
    sort(a, 0, a.length - 1)
    animate(steps, a.length)
  }

  // ─── Quick Sort ──────────────────────────────────────────
  const quickSort = () => {
    const steps = []
    const a = [...array]
    const partition = (arr, low, high) => {
      const pivot = arr[high]
      let i = low - 1
      for (let j = low; j < high; j++) {
        steps.push({ array: [...arr], comparing: [j, high] })
        if (arr[j] <= pivot) {
          i++
          let temp = arr[i]; arr[i] = arr[j]; arr[j] = temp
          steps.push({ array: [...arr], swapping: [i, j] })
        }
      }
      let temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp
      steps.push({ array: [...arr], swapping: [i + 1, high] })
      return i + 1
    }
    const sort = (arr, low, high) => {
      if (low >= high) return
      const pi = partition(arr, low, high)
      sort(arr, low, pi - 1)
      sort(arr, pi + 1, high)
    }
    sort(a, 0, a.length - 1)
    animate(steps, a.length)
  }

  // ─── Heap Sort ───────────────────────────────────────────
  const heapSort = () => {
    const steps = []
    const a = [...array]
    const n = a.length

    // Heapify subtree rooted at index i, heap size = size
    const heapify = (arr, size, i) => {
      let largest = i
      const left = 2 * i + 1
      const right = 2 * i + 2

      steps.push({ array: [...arr], comparing: [i, left < size ? left : i] })

      if (left < size && arr[left] > arr[largest]) largest = left
      if (right < size && arr[right] > arr[largest]) largest = right

      if (largest !== i) {
        let temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp
        steps.push({ array: [...arr], swapping: [i, largest] })
        heapify(arr, size, largest)
      }
    }

    // Build max heap — start from last non-leaf
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(a, n, i)

    // Extract elements one by one
    for (let i = n - 1; i > 0; i--) {
      let temp = a[0]; a[0] = a[i]; a[i] = temp
      steps.push({ array: [...a], swapping: [0, i], sorted: Array.from({ length: n - i }, (_, k) => n - 1 - k) })
      heapify(a, i, 0)
    }

    animate(steps, n)
  }

  // ─── Shell Sort ──────────────────────────────────────────
  const shellSort = () => {
    const steps = []
    const a = [...array]
    const n = a.length

    // Knuth's gap sequence: 1, 4, 13, 40 ...
    let gap = 1
    while (gap < Math.floor(n / 3)) gap = gap * 3 + 1

    while (gap >= 1) {
      for (let i = gap; i < n; i++) {
        let j = i
        steps.push({ array: [...a], comparing: [j, j - gap] })
        while (j >= gap && a[j] < a[j - gap]) {
          let temp = a[j]; a[j] = a[j - gap]; a[j - gap] = temp
          steps.push({ array: [...a], swapping: [j, j - gap] })
          j -= gap
        }
      }
      gap = Math.floor(gap / 3)
    }

    animate(steps, n)
  }

  // ─── Radix Sort ──────────────────────────────────────────
  const radixSort = () => {
    const steps = []
    const a = [...array]
    const n = a.length
    const max = Math.max(...a)

    const countingSort = (arr, exp) => {
      const output = new Array(n).fill(0)
      const count = new Array(10).fill(0)

      // Count occurrences of each digit
      for (let i = 0; i < n; i++) {
        const digit = Math.floor(arr[i] / exp) % 10
        count[digit]++
        steps.push({ array: [...arr], comparing: [i] })
      }

      // Prefix sum
      for (let i = 1; i < 10; i++) count[i] += count[i - 1]

      // Build output (right to left for stability)
      for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10
        output[count[digit] - 1] = arr[i]
        count[digit]--
      }

      // Copy back + animate each placement
      for (let i = 0; i < n; i++) {
        arr[i] = output[i]
        steps.push({ array: [...arr], swapping: [i] })
      }
    }

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      countingSort(a, exp)
    }

    animate(steps, n)
  }

  // ─── Color logic ─────────────────────────────────────────
  const getColor = (index) => {
    if (sorted.includes(index)) return '#2e7d32'   // dark green = done
    if (swapping.includes(index)) return '#e53935'  // red = swapping
    if (comparing.includes(index)) return '#f9a825' // yellow = comparing
    return '#1565c0'                                 // blue = default
  }

  const algoCards = [
    { name: 'Bubble Sort',    best: 'O(n)',        avg: 'O(n²)',      worst: 'O(n²)' },
    { name: 'Selection Sort', best: 'O(n²)',       avg: 'O(n²)',      worst: 'O(n²)' },
    { name: 'Insertion Sort', best: 'O(n)',        avg: 'O(n²)',      worst: 'O(n²)' },
    { name: 'Merge Sort',     best: 'O(n log n)',  avg: 'O(n log n)', worst: 'O(n log n)' },
    { name: 'Quick Sort',     best: 'O(n log n)',  avg: 'O(n log n)', worst: 'O(n²)' },
    { name: 'Heap Sort',      best: 'O(n log n)',  avg: 'O(n log n)', worst: 'O(n log n)' },
    { name: 'Shell Sort',     best: 'O(n log n)',  avg: 'O(n log²n)', worst: 'O(n²)' },
    { name: 'Radix Sort',     best: 'O(nk)',       avg: 'O(nk)',      worst: 'O(nk)' },
  ]

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Algo Visualizer</h1>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={generateArray} disabled={isRunning}>Randomize</button>
        <button onClick={bubbleSort}    disabled={isRunning}>Bubble Sort</button>
        <button onClick={selectionSort} disabled={isRunning}>Selection Sort</button>
        <button onClick={insertionSort} disabled={isRunning}>Insertion Sort</button>
        <button onClick={mergeSort}     disabled={isRunning}>Merge Sort</button>
        <button onClick={quickSort}     disabled={isRunning}>Quick Sort</button>
        <button onClick={heapSort}      disabled={isRunning} style={{ background: isRunning ? undefined : '#7B1FA2', color: isRunning ? undefined : 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: isRunning ? 'not-allowed' : 'pointer' }}>Heap Sort</button>
        <button onClick={shellSort}     disabled={isRunning} style={{ background: isRunning ? undefined : '#00838F', color: isRunning ? undefined : 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: isRunning ? 'not-allowed' : 'pointer' }}>Shell Sort</button>
        <button onClick={radixSort}     disabled={isRunning} style={{ background: isRunning ? undefined : '#E65100', color: isRunning ? undefined : 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: isRunning ? 'not-allowed' : 'pointer' }}>Radix Sort</button>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <label>Speed:</label>
        <input
          type="range"
          min="10"
          max="500"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
        <span>{speed}ms</span>
        <span style={{ marginLeft: '20px', color: 'orange', fontWeight: 'bold' }}>
          Comparisons: {comparisons}
        </span>

        {/* Color legend */}
        <div style={{ display: 'flex', gap: '12px', marginLeft: '16px', fontSize: '12px', alignItems: 'center' }}>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#1565c0', marginRight: 4, borderRadius: 2 }} />Default</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#f9a825', marginRight: 4, borderRadius: 2 }} />Comparing</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#e53935', marginRight: 4, borderRadius: 2 }} />Swapping</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#2e7d32', marginRight: 4, borderRadius: 2 }} />Sorted</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '300px', marginTop: '20px' }}>
        {array.map((val, i) => (
          <div
            key={i}
            style={{
              height: val,
              flex: 1,
              background: getColor(i),
              transition: 'background 0.1s, height 0.05s'
            }}
          />
        ))}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {algoCards.map((algo) => (
          <div key={algo.name} style={{
            background: '#f0f0f0',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            minWidth: '130px'
          }}>
            <b>{algo.name}</b><br />
            Best: {algo.best}<br />
            Avg: {algo.avg}<br />
            Worst: {algo.worst}
          </div>
        ))}
      </div>

      <hr />
      <Pathfinder />
    </div>
  )
}

export default App