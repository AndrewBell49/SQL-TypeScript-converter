import React, { useState } from 'react'
import { variableNameSchema } from '../SqlToTypeScript/helpers/types'
import { z } from 'zod';
import type { variablesInterface } from './helpers/types';

interface variablesChoiceInterface {
  original: string,
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
    processError(e.target.value)
    onChange(original, { ...variableState, name: e.target.value });
  }

  const onMultipleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(original, { ...variableState, multiple: e.target.checked });
  }

  return (
    <div className='variableChoice'>

      <input type='text' value={variableState.name} onChange={onVarNameChange} />
      <p>replacing {original}. Multiple?</p>
      <input type='checkbox' checked={variableState.multiple} onChange={onMultipleChange} />

      {error && <p className='error'>{error}</p>}

    </div>
  )
}