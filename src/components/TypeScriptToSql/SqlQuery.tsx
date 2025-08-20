interface SqlQueryParams {
  query: string
}

export default function SqlQuery({ query }: SqlQueryParams) {
  return (
    <span>{query}</span>
  )
}