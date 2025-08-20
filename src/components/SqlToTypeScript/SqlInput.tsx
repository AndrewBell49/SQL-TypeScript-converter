import React from 'react'

interface SqlInputBoxParams {
  value: string;
  onChange: (newValue: string) => void
}

export default function SqlInput(
  { value, onChange }: SqlInputBoxParams) {

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }

  return (
    <div>
      <h1>Enter your SQL query below</h1>
      <textarea value={value} placeholder='Enter your text here' spellCheck='false' onChange={handleQueryChange}></textarea>
    </div>
  )
}