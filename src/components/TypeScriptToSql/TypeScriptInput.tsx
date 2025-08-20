import React from 'react'

interface TypeScriptInputParams {
  value: string;
  onChange: (newValue: string) => void
}

export default function TypeScriptInput(
  { value, onChange }: TypeScriptInputParams) {

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }

  return (
    <div>
      <h1>Enter your TypeScript code below</h1>
      <textarea value={value} placeholder='Enter your text here' spellCheck='false' onChange={handleQueryChange}></textarea>
    </div>
  )
}