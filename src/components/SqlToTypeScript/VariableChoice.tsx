import React, { useEffect, useState } from 'react'
import { varTypeTypes, variableNameSchema, type variablesInterface } from './helpers/types'
import { z } from 'zod';

interface variablesChoiceInterface {
  original: string;
  variableState: variablesInterface,
  onChange: (key: string, value: variablesInterface) => void
}

export default function VariableChoice(
  { original, variableState, onChange }: variablesChoiceInterface) {

  const [error, setError] = useState('');

  function processError(value: string) {
    try {
      variableNameSchema.parse(value)
      setError('')
      return false;
    } catch (err) {
      let errorMessage = 'An error occured'
      // get first error from zod to display
      if (err instanceof z.ZodError) {
        errorMessage = z.flattenError(err).formErrors[0];
      }
      setError(errorMessage)
      return true;
    }
  }

  const onVarNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const error = processError(e.target.value);
    onChange(original, { ...variableState, name: e.target.value, error: error });
  }

  const onTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(original, { ...variableState, type: e.target.value })
  }

  useEffect(() => {
    const error = processError(variableState.name);
    variableState.error = error;
  }, [variableState.name])


  return (
    <span className='variableChoice'>

      <input type='text' value={variableState.name} onChange={onVarNameChange} />
      <p>replacing &#123;&#123;{original}&#125;&#125;</p>

      <select onChange={onTypeChange} value={variableState.type}>
        {
          varTypeTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))
        }
      </select>

      {error && <p className='error'>{error}</p>}

    </span>
  )
}