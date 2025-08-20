import { useState } from "react"
import TypeScriptInput from "./TypeScriptInput"
import TypeScriptOutput from "./TypeScriptOutput"

export default function TypeScriptToSql() {

  const [tsQuery, setTsQuery] = useState('')

  return (
    <main>
      <TypeScriptInput value={tsQuery} onChange={setTsQuery} />
      <TypeScriptOutput value={tsQuery} />
    </main>
  )
}