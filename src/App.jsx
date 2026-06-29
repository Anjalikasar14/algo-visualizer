import { useState } from 'react'

function App() {
  const [array, setArray] = useState([40, 80, 20, 60, 100, 30, 70, 50])
  const [comparing, setComparing] = useState([])
  const [sorted, setSorted] = useState([])

  const generateArray = () => {
    const newArr = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 250) + 20
    )
    setArray(newArr)
    setComparing([])
    setSorted([])
  }

  const bubbleSort = () => {
    const steps = []
    const a = [...array]
    const n = a.length

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (a[j] > a[j + 1]) {
          let temp = a[j]
          a[j] = a[j + 1]
          a[j + 1] = temp
        }
        steps.push({
          array: [...a],
          comparing: [j, j + 1],
          // har pass ke baad last element sorted ho jaata hai
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k)
        })
      }
    }

    steps.forEach((step, i) => {
      setTimeout(() => {
        setArray(step.array)
        setComparing(step.comparing)
        setSorted(step.sorted)

        // Last step pe sab green
        if (i === steps.length - 1) {
          setSorted(Array.from({ length: n }, (_, k) => k))
          setComparing([])
        }
      }, i * 100)
    })
  }
   
  const selectionSort = () => {
  const steps = []
  const a = [...array]
  const n = a.length

  for (let i = 0; i < n; i++) {
    let minIdx = i

    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[minIdx]) {
        minIdx = j
      }
      steps.push({
        array: [...a],
        comparing: [minIdx, j],
        sorted: Array.from({ length: i }, (_, k) => k)
      })
    }

    // Minimum element ko sahi jagah pe swap karo
    let temp = a[i]
    a[i] = a[minIdx]
    a[minIdx] = temp

    steps.push({
      array: [...a],
      comparing: [],
      sorted: Array.from({ length: i + 1 }, (_, k) => k)
    })
  }

  steps.forEach((step, i) => {
    setTimeout(() => {
      setArray(step.array)
      setComparing(step.comparing)
      setSorted(step.sorted)

      if (i === steps.length - 1) {
        setSorted(Array.from({ length: n }, (_, k) => k))
        setComparing([])
      }
    }, i * 100)
  })
}
const insertionSort = () => {
  const steps = []
  const a = [...array]
  const n = a.length

  for (let i = 1; i < n; i++) {
    let j = i
    while (j > 0 && a[j] < a[j - 1]) {
      // Swap
      let temp = a[j]
      a[j] = a[j - 1]
      a[j - 1] = temp
      j--

      steps.push({
        array: [...a],
        comparing: [j, j + 1],
        sorted: Array.from({ length: i }, (_, k) => k)
      })
    }
  }

  steps.forEach((step, i) => {
    setTimeout(() => {
      setArray(step.array)
      setComparing(step.comparing)
      setSorted(step.sorted)

      if (i === steps.length - 1) {
        setSorted(Array.from({ length: n }, (_, k) => k))
        setComparing([])
      }
    }, i * 100)
  })
}

const mergeSort = () => {
  const steps = []
  const a = [...array]

  const merge = (arr, left, mid, right) => {
    const leftArr = arr.slice(left, mid + 1)
    const rightArr = arr.slice(mid + 1, right + 1)
    let i = 0, j = 0, k = left

    while (i < leftArr.length && j < rightArr.length) {
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i]
        i++
      } else {
        arr[k] = rightArr[j]
        j++
      }
      steps.push({
        array: [...arr],
        comparing: [k, k + 1]
      })
      k++
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i]
      steps.push({ array: [...arr], comparing: [k] })
      i++; k++
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j]
      steps.push({ array: [...arr], comparing: [k] })
      j++; k++
    }
  }

  const sort = (arr, left, right) => {
    if (left >= right) return
    const mid = Math.floor((left + right) / 2)
    sort(arr, left, mid)
    sort(arr, mid + 1, right)
    merge(arr, left, mid, right)
  }

  sort(a, 0, a.length - 1)

  // Animate
  steps.forEach((step, i) => {
    setTimeout(() => {
      setArray(step.array)
      setComparing(step.comparing)

      if (i === steps.length - 1) {
        setSorted(Array.from({ length: a.length }, (_, k) => k))
        setComparing([])
      }
    }, i * 100)
  })
}
  const getColor = (index) => {
    if (sorted.includes(index)) return 'green'
    if (comparing.includes(index)) return 'orange'
    return 'steelblue'
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Algo Visualizer</h1>

      <button onClick={generateArray} style={{ marginRight: '10px' }}>
        Randomize
      </button>
      <button onClick={bubbleSort}>
        Bubble Sort
      </button>
      <button onClick={selectionSort}>
        Selection Sort
       </button> 
       <button onClick={insertionSort}>
        Insertion Sort
       </button>
       <button onClick={mergeSort}>
         Merge Sort
        </button>

      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '4px',
        height: '300px',
        marginTop: '20px'
      }}>
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
    </div>
  )
}

export default App