import { useState } from "react"
import SqlInput from "./SqlInput"
import SqlOutput from "./SqlOutput"

export default function SqlToTypeScript() {

  const [sqlQuery, setSqlQuery] = useState('')

  return (
    <main>
      <SqlInput value={sqlQuery} onChange={setSqlQuery} />
      <SqlOutput value={sqlQuery} />
    </main>
  )
}