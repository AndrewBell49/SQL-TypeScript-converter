interface SqlOutputBoxParams {
  value: string
}

export default function TypeScriptOutput(
  { value }: SqlOutputBoxParams) {

  return (
    <div>
      {value}
    </div>
  )
}