import { useEffect, useState } from "react"
import { getIndexOfAll } from '../SqlToTypeScript/helpers/SqlOutputHelpers.ts'
import SqlQuery from "./SqlQuery.tsx"
import QueryContext from "./context/QueryContext.ts"

interface SqlOutputBoxParams {
  value: string
}

function getAllQueries(query: string): string[] {
  const queryStartStr = 'return singleline'
  const statementBegin = getIndexOfAll(queryStartStr, query)

  // search for character after ` character, filtering it out if it doesn't exist
  const queryBegin = statementBegin.map((idx) => query.indexOf('`', idx) + 1).filter((idx) => idx != 0)
  const queryEnd = queryBegin.map((idx) => query.indexOf('`', idx)).filter((idx) => idx != -1)

  if (statementBegin.length != queryBegin.length || statementBegin.length != queryEnd.length || queryBegin.length != queryEnd.length) {
    return ['Error in input'];
  }

  return queryBegin.map((s, i) => query.substring(s, queryEnd[i]))

}

export default function TypeScriptOutput(
  { value }: SqlOutputBoxParams) {

  const [sqlQueries, setSqlQueries] = useState<string[]>([]);

  useEffect(() => {
    setSqlQueries(getAllQueries(value))
  }, [value]);

  return (
    <QueryContext value={value}>
      <div className="sqlOutput">
        {
          sqlQueries.map((query, i) =>
            <>
              <h2>Query {i + 1}</h2>
              <SqlQuery query={query.trim()} />
            </>)
        }
      </div>
    </QueryContext>
  )
}