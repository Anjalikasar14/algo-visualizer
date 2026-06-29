import { useState, useRef } from 'react'

const ROWS = 20
const COLS = 40

const createGrid = () => {
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({
      row,
      col,
      isWall: false,
      isVisited: false,
      isPath: false,
      isStart: row === 10 && col === 5,
      isEnd: row === 10 && col === 35,
    }))
  )
}

function Pathfinder() {
  const [grid, setGrid] = useState(createGrid())
  const [algo, setAlgo] = useState('dijkstra')
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState(null)
  const isDrawing = useRef(false)
  const timeoutsRef = useRef([])

  const getColor = (cell) => {
    if (cell.isStart) return '#00b300'
    if (cell.isEnd) return '#cc0000'
    if (cell.isPath) return '#FFD700'
    if (cell.isVisited) return '#89CFF0'
    if (cell.isWall) return '#333'
    return 'white'
  }

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []
  }

  const toggleWall = (row, col) => {
    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      const cell = newGrid[row][col]
      if (!cell.isStart && !cell.isEnd) {
        cell.isWall = !cell.isWall
      }
      return newGrid
    })
  }

  const handleMouseDown = (row, col) => {
    if (isRunning) return
    isDrawing.current = true
    toggleWall(row, col)
  }

  const handleMouseEnter = (row, col) => {
    if (!isDrawing.current || isRunning) return
    toggleWall(row, col)
  }

  const handleMouseUp = () => { isDrawing.current = false }

  const resetGrid = () => {
    clearTimeouts()
    setIsRunning(false)
    setStats(null)
    setGrid(createGrid())
  }

  const clearPath = (currentGrid) => {
    return currentGrid.map(r => r.map(c => ({
      ...c,
      isVisited: false,
      isPath: false
    })))
  }

  // ─── BFS ────────────────────────────────────────────────
  const bfs = (currentGrid) => {
    const start = currentGrid[10][5]
    const end = currentGrid[10][35]
    const queue = [start]
    const visited = new Set()
    const parent = {}
    const visitedOrder = []

    visited.add(`${start.row}-${start.col}`)

    while (queue.length > 0) {
      const cell = queue.shift()
      visitedOrder.push(cell)
      if (cell.row === end.row && cell.col === end.col) break

      for (const n of getNeighbors(cell)) {
        const key = `${n.row}-${n.col}`
        if (inBounds(n) && !visited.has(key) && !currentGrid[n.row][n.col].isWall) {
          visited.add(key)
          parent[key] = cell
          queue.push(currentGrid[n.row][n.col])
        }
      }
    }

    return { visitedOrder, path: tracePath(parent, end) }
  }

  // ─── DFS ────────────────────────────────────────────────
  const dfs = (currentGrid) => {
    const start = currentGrid[10][5]
    const end = currentGrid[10][35]
    const stack = [start]
    const visited = new Set()
    const parent = {}
    const visitedOrder = []

    visited.add(`${start.row}-${start.col}`)

    while (stack.length > 0) {
      const cell = stack.pop()
      visitedOrder.push(cell)
      if (cell.row === end.row && cell.col === end.col) break

      for (const n of getNeighbors(cell)) {
        const key = `${n.row}-${n.col}`
        if (inBounds(n) && !visited.has(key) && !currentGrid[n.row][n.col].isWall) {
          visited.add(key)
          parent[key] = cell
          stack.push(currentGrid[n.row][n.col])
        }
      }
    }

    return { visitedOrder, path: tracePath(parent, end) }
  }

  // ─── Dijkstra ────────────────────────────────────────────
  const dijkstra = (currentGrid) => {
    const start = currentGrid[10][5]
    const end = currentGrid[10][35]
    const dist = {}
    const parent = {}
    const visited = new Set()
    const visitedOrder = []

    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        dist[`${r}-${c}`] = Infinity

    dist[`${start.row}-${start.col}`] = 0
    const pq = [{ cell: start, dist: 0 }]

    while (pq.length > 0) {
      pq.sort((a, b) => a.dist - b.dist)
      const { cell } = pq.shift()
      const key = `${cell.row}-${cell.col}`

      if (visited.has(key)) continue
      visited.add(key)
      visitedOrder.push(cell)

      if (cell.row === end.row && cell.col === end.col) break

      for (const n of getNeighbors(cell)) {
        const nKey = `${n.row}-${n.col}`
        if (inBounds(n) && !visited.has(nKey) && !currentGrid[n.row][n.col].isWall) {
          const newDist = dist[key] + 1
          if (newDist < dist[nKey]) {
            dist[nKey] = newDist
            parent[nKey] = cell
            pq.push({ cell: currentGrid[n.row][n.col], dist: newDist })
          }
        }
      }
    }

    return { visitedOrder, path: tracePath(parent, end) }
  }

  // ─── A* ─────────────────────────────────────────────────
  const astar = (currentGrid) => {
    const start = currentGrid[10][5]
    const end = currentGrid[10][35]

    // Manhattan distance heuristic — h(n)
    const heuristic = (cell) =>
      Math.abs(cell.row - end.row) + Math.abs(cell.col - end.col)

    const gScore = {}   // cost from start
    const fScore = {}   // g + h
    const parent = {}
    const visited = new Set()
    const visitedOrder = []

    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        gScore[`${r}-${c}`] = Infinity
        fScore[`${r}-${c}`] = Infinity
      }

    const startKey = `${start.row}-${start.col}`
    gScore[startKey] = 0
    fScore[startKey] = heuristic(start)

    // Open set — nodes to explore, sorted by fScore
    const openSet = [{ cell: start, f: fScore[startKey] }]

    while (openSet.length > 0) {
      // Pick node with lowest f = g + h
      openSet.sort((a, b) => a.f - b.f)
      const { cell } = openSet.shift()
      const key = `${cell.row}-${cell.col}`

      if (visited.has(key)) continue
      visited.add(key)
      visitedOrder.push(cell)

      if (cell.row === end.row && cell.col === end.col) break

      for (const n of getNeighbors(cell)) {
        const nKey = `${n.row}-${n.col}`
        if (!inBounds(n) || visited.has(nKey) || currentGrid[n.row][n.col].isWall) continue

        const tentativeG = gScore[key] + 1  // all edges weight 1

        if (tentativeG < gScore[nKey]) {
          parent[nKey] = cell
          gScore[nKey] = tentativeG
          fScore[nKey] = tentativeG + heuristic(currentGrid[n.row][n.col])
          openSet.push({ cell: currentGrid[n.row][n.col], f: fScore[nKey] })
        }
      }
    }

    return { visitedOrder, path: tracePath(parent, end) }
  }

  // ─── Maze Generator (Recursive Division) ────────────────
  const generateMaze = () => {
    if (isRunning) return
    clearTimeouts()
    setStats(null)

    // Start with all walls
    const mazeGrid = Array.from({ length: ROWS }, (_, row) =>
      Array.from({ length: COLS }, (_, col) => ({
        row, col,
        isWall: true,
        isVisited: false,
        isPath: false,
        isStart: row === 10 && col === 5,
        isEnd: row === 10 && col === 35,
      }))
    )

    const wallsToRemove = []

    // Carve passages using recursive backtracking
    const visited = new Set()

    const carve = (r, c) => {
      visited.add(`${r}-${c}`)
      wallsToRemove.push({ row: r, col: c })

      // Randomised directions
      const dirs = [
        [-2, 0], [2, 0], [0, -2], [0, 2]
      ].sort(() => Math.random() - 0.5)

      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited.has(`${nr}-${nc}`)) {
          // Carve the wall between current and neighbor
          wallsToRemove.push({ row: r + dr / 2, col: c + dc / 2 })
          carve(nr, nc)
        }
      }
    }

    // Start from odd cell near start
    carve(1, 1)

    // Always carve start and end positions
    wallsToRemove.push({ row: 10, col: 5 })
    wallsToRemove.push({ row: 10, col: 35 })

    // Apply maze with animation
    setGrid(mazeGrid)
    setIsRunning(true)

    wallsToRemove.forEach((cell, i) => {
      const t = setTimeout(() => {
        setGrid(prev => {
          const newGrid = prev.map(r => r.map(c => ({ ...c })))
          newGrid[cell.row][cell.col].isWall = false
          return newGrid
        })
        if (i === wallsToRemove.length - 1) setIsRunning(false)
      }, i * 5)
      timeoutsRef.current.push(t)
    })
  }

  // ─── Helpers ─────────────────────────────────────────────
  const getNeighbors = (cell) => [
    { row: cell.row - 1, col: cell.col },
    { row: cell.row + 1, col: cell.col },
    { row: cell.row, col: cell.col - 1 },
    { row: cell.row, col: cell.col + 1 },
  ]

  const inBounds = (n) => n.row >= 0 && n.row < ROWS && n.col >= 0 && n.col < COLS

  const tracePath = (parent, end) => {
    const path = []
    let curr = end
    while (curr && `${curr.row}-${curr.col}` in parent) {
      path.unshift(curr)
      curr = parent[`${curr.row}-${curr.col}`]
    }
    return path
  }

  // ─── Visualize ───────────────────────────────────────────
  const visualize = () => {
    if (isRunning) return
    clearTimeouts()

    const freshGrid = clearPath(grid)
    setGrid(freshGrid)
    setStats(null)
    setIsRunning(true)

    const { visitedOrder, path } =
      algo === 'bfs' ? bfs(freshGrid) :
      algo === 'dfs' ? dfs(freshGrid) :
      algo === 'astar' ? astar(freshGrid) :
      dijkstra(freshGrid)

    visitedOrder.forEach((cell, i) => {
      const t = setTimeout(() => {
        setGrid(prev => {
          const newGrid = prev.map(r => r.map(c => ({ ...c })))
          if (!newGrid[cell.row][cell.col].isStart && !newGrid[cell.row][cell.col].isEnd)
            newGrid[cell.row][cell.col].isVisited = true
          return newGrid
        })
      }, i * 20)
      timeoutsRef.current.push(t)
    })

    path.forEach((cell, i) => {
      const t = setTimeout(() => {
        setGrid(prev => {
          const newGrid = prev.map(r => r.map(c => ({ ...c })))
          if (!newGrid[cell.row][cell.col].isStart && !newGrid[cell.row][cell.col].isEnd)
            newGrid[cell.row][cell.col].isPath = true
          return newGrid
        })
        if (i === path.length - 1) {
          setIsRunning(false)
          setStats({ visited: visitedOrder.length, pathLength: path.length })
        }
      }, visitedOrder.length * 20 + i * 30)
      timeoutsRef.current.push(t)
    })

    // If no path found
    if (path.length === 0) {
      const t = setTimeout(() => {
        setIsRunning(false)
        setStats({ visited: visitedOrder.length, pathLength: 0 })
      }, visitedOrder.length * 20 + 100)
      timeoutsRef.current.push(t)
    }
  }

  const algoLabels = {
    bfs: 'BFS',
    dfs: 'DFS',
    dijkstra: 'Dijkstra',
    astar: 'A*',
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '12px' }}>Pathfinding Visualizer</h2>

      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={visualize}
          disabled={isRunning}
          style={{
            background: isRunning ? '#888' : '#4CAF50',
            color: 'white',
            padding: '6px 14px',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}
        >
          {isRunning ? 'Running...' : `Visualize ${algoLabels[algo]}`}
        </button>

        <button
          onClick={generateMaze}
          disabled={isRunning}
          style={{
            background: isRunning ? '#888' : '#9C27B0',
            color: 'white',
            padding: '6px 14px',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          Generate Maze
        </button>

        <button
          onClick={resetGrid}
          style={{ padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Reset Grid
        </button>

        <select
          value={algo}
          onChange={(e) => setAlgo(e.target.value)}
          disabled={isRunning}
          style={{ padding: '5px 8px', borderRadius: '4px' }}
        >
          <option value="bfs">BFS</option>
          <option value="dfs">DFS</option>
          <option value="dijkstra">Dijkstra</option>
          <option value="astar">A* (A-Star)</option>
        </select>

        <span style={{ fontSize: '13px', color: '#666' }}>
          🟢 Start | 🔴 End | Click/Drag = Wall
        </span>
      </div>

      {/* Stats bar */}
      {stats && (
        <div style={{
          marginBottom: '10px',
          padding: '6px 12px',
          background: '#f0f0f0',
          borderRadius: '4px',
          fontSize: '13px',
          display: 'flex',
          gap: '16px'
        }}>
          <span>Cells visited: <strong>{stats.visited}</strong></span>
          <span>
            Path length:{' '}
            <strong style={{ color: stats.pathLength === 0 ? 'red' : 'green' }}>
              {stats.pathLength === 0 ? 'No path found!' : stats.pathLength}
            </strong>
          </span>
        </div>
      )}

      <div
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ display: 'inline-block', border: '1px solid #ccc', userSelect: 'none' }}
      >
        {grid.map((row, rIdx) => (
          <div key={rIdx} style={{ display: 'flex' }}>
            {row.map((cell, cIdx) => (
              <div
                key={cIdx}
                onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                style={{
                  width: '20px',
                  height: '20px',
                  background: getColor(cell),
                  border: '0.5px solid #ddd',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  boxSizing: 'border-box',
                  transition: 'background 0.1s'
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '12px', fontSize: '13px', color: '#555', lineHeight: '1.8' }}>
        <b>BFS</b> — Shortest path ✅ &nbsp;|&nbsp;
        <b>DFS</b> — Shortest path ❌ &nbsp;|&nbsp;
        <b>Dijkstra</b> — Shortest path ✅ (weighted graphs) &nbsp;|&nbsp;
        <b>A*</b> — Shortest path ✅ (fastest — uses heuristic)
      </div>
    </div>
  )
}

export default Pathfinder