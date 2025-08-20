import { useState } from 'react'
import './App.css'
import SqlInput from './components/SqlToTypeScript/SqlInput'
import SqlOutput from './components/SqlToTypeScript/SqlOutput'

function App() {

  const [sqlQuery, setSqlQuery] = useState('')

  return (
    <div>
      <SqlInput value={sqlQuery} onChange={setSqlQuery} />
      <SqlOutput value={sqlQuery} />
    </div>
  )
}

export default App 
