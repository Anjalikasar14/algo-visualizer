import { useState } from 'react'

function App() {
  const [array, setArray] = useState([40, 80, 20, 60, 100, 30, 70, 50])
  const [comparing, setComparing] = useState([])
  const [sorted, setSorted] = useState([])
  const [speed, setSpeed] = useState(100)
  const [comparisons, setComparisons] = useState(0)

  const generateArray = () => {
    const newArr = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 250) + 20
    )
    setArray(newArr)
    setComparing([])
    setSorted([])
    setComparisons(0)
  }

  const animate = (steps, n) => {
    steps.forEach((step, i) => {
      setTimeout(() => {
        setArray(step.array)
        setComparing(step.comparing)
        if (step.sorted) setSorted(step.sorted)
        setComparisons(i + 1)  // live counter
        if (i === steps.length - 1) {
          setSorted(Array.from({ length: n }, (_, k) => k))
          setComparing([])
        }
      }, i * speed)  // speed slider se connected
    })
  }

  const bubbleSort = () => {
    const steps = []
    const a = [...array]
    const n = a.length
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (a[j] > a[j + 1]) {
          let temp = a[j]; a[j] = a[j + 1]; a[j + 1] = temp
        }
        steps.push({
          array: [...a],
          comparing: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k)
        })
      }
    }
    animate(steps, n)
  }

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
      let temp = a[i]; a[i] = a[minIdx]; a[minIdx] = temp
      steps.push({
        array: [...a],
        comparing: [],
        sorted: Array.from({ length: i + 1 }, (_, k) => k)
      })
    }
    animate(steps, n)
  }

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
          comparing: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => k)
        })
      }
    }
    animate(steps, n)
  }

  const mergeSort = () => {
    const steps = []
    const a = [...array]
    const merge = (arr, left, mid, right) => {
      const leftArr = arr.slice(left, mid + 1)
      const rightArr = arr.slice(mid + 1, right + 1)
      let i = 0, j = 0, k = left
      while (i < leftArr.length && j < rightArr.length) {
        if (leftArr[i] <= rightArr[j]) { arr[k] = leftArr[i]; i++ }
        else { arr[k] = rightArr[j]; j++ }
        steps.push({ array: [...arr], comparing: [k, k + 1] }); k++
      }
      while (i < leftArr.length) {
        arr[k] = leftArr[i]
        steps.push({ array: [...arr], comparing: [k] }); i++; k++
      }
      while (j < rightArr.length) {
        arr[k] = rightArr[j]
        steps.push({ array: [...arr], comparing: [k] }); j++; k++
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

  const quickSort = () => {
    const steps = []
    const a = [...array]
    const partition = (arr, low, high) => {
      const pivot = arr[high]
      let i = low - 1
      for (let j = low; j < high; j++) {
        if (arr[j] <= pivot) {
          i++
          let temp = arr[i]; arr[i] = arr[j]; arr[j] = temp
        }
        steps.push({ array: [...arr], comparing: [j, high] })
      }
      let temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp
      steps.push({ array: [...arr], comparing: [i + 1] })
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

  const getColor = (index) => {
    if (sorted.includes(index)) return 'green'
    if (comparing.includes(index)) return 'orange'
    return 'steelblue'
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Algo Visualizer</h1>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={generateArray}>Randomize</button>
        <button onClick={bubbleSort}>Bubble Sort</button>
        <button onClick={selectionSort}>Selection Sort</button>
        <button onClick={insertionSort}>Insertion Sort</button>
        <button onClick={mergeSort}>Merge Sort</button>
        <button onClick={quickSort}>Quick Sort</button>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '300px', marginTop: '20px' }}>
        {array.map((val, i) => (
          <div
            key={i}
            style={{
              height: val,
              width: '30px',
              background: getColor(i),
              transition: 'background 0.1s'
            }}
          />
        ))}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { name: 'Bubble Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
          { name: 'Selection Sort', best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)' },
          { name: 'Insertion Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
          { name: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
          { name: 'Quick Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' },
        ].map((algo) => (
          <div key={algo.name} style={{
            background: '#f0f0f0',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px'
          }}>
            <b>{algo.name}</b><br />
            Best: {algo.best}<br />
            Avg: {algo.avg}<br />
            Worst: {algo.worst}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App