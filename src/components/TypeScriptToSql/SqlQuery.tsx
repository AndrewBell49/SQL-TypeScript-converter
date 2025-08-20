import { useContext } from "react"
import QueryContext from "./context/QueryContext"
import { getIndexOfAll } from "../SqlToTypeScript/helpers/SqlOutputHelpers"

function parseInjectedString(query: string) {

  interface injectedParams {
    text: string,
    type: 'function' | 'ternary' | 'variable'
  }

  const injectBegin = getIndexOfAll('${', query)
  const injectEnd = injectBegin.map((idx) => query.indexOf('}', idx))
  const injectedItems = injectBegin.map((s, i) => query.substring(s + 2, injectEnd[i]))

}

interface SqlQueryParams {
  query: string
}

export default function SqlQuery({ query }: SqlQueryParams) {

  const originalQuery = useContext(QueryContext)

  parseInjectedString(query)

  return (
    <span>{query}</span>
  )
}