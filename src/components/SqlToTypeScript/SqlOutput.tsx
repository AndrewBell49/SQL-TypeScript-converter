import { useEffect, useState } from 'react';
import SqlOutputBlock from './SqlOutputBlock';
import { variableNameSchema, type variablesInterface } from './helpers/types';
import { arraysEqual } from './helpers/utils';
import { getIndexOfAll, getTextForCopying, isInputError, replaceColonWithBraces, splitInput } from './helpers/SqlOutputHelpers';
import { z } from 'zod'

function syncVariableStates(
  keys: string[],
  currentStates: Record<string, variablesInterface>,
): Record<string, variablesInterface> {

  const newStates: Record<string, variablesInterface> = {};

  keys.forEach((key) => {
    if (key in currentStates) {
      newStates[key] = currentStates[key];
    } else {
      newStates[key] = { name: key, type: 'string', error: false };
    }
  })
  return newStates;
}

interface SqlOutputBoxParams {
  value: string
}

let variableKeys: string[] = [];

export default function SqlOutput(
  { value }: SqlOutputBoxParams) {

  const [texts, setTexts] = useState<string[]>([]);
  const [vars, setVars] = useState<string[]>([]);
  const [methodName, setMethodName] = useState<string>("MethodName");

  // storing and changing the states, for each variable
  const [variableStates, setVariableStates] = useState<Record<string, variablesInterface>>({});

  const [methodError, setMethodError] = useState('');
  const [inputError, setInputError] = useState(false);
  const [duplicateVariableError, setDuplicateVariableError] = useState('');
  const [variableError, setVariableError] = useState(false);

  function processError(value: string) {
    try {
      variableNameSchema.parse(value)
      setMethodError('')
    } catch (err) {
      let errorMessage = 'An error occured'
      // get first error from zod to display
      if (err instanceof z.ZodError) {
        errorMessage = z.flattenError(err).formErrors[0];
      }
      setMethodError(errorMessage)
    }
  }

  function duplicateVariableExists() {
    const variableNames = Object.values(variableStates).map(v => v.name);
    if (variableNames.length == (new Set(variableNames)).size) {
      return false
    }
    return true
  }

  const onVariableStatesChange = (key: string, value: variablesInterface) => {
    setVariableStates(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const onMethodNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processError(e.target.value)
    setMethodName(e.target.value)
  }

  useEffect(() => {
    const colonReplace = replaceColonWithBraces(value);

    const leftBraces = getIndexOfAll('{{', colonReplace);
    const rightBraces = getIndexOfAll('}}', colonReplace);

    console.log(colonReplace)

    const { error, msg } = isInputError({ leftBraces, rightBraces })
    if (error) {
      setTexts([msg]);
      setVars([]);
      setInputError(true);
    } else {
      setInputError(false);
      const { texts, vars } = splitInput({ text: colonReplace, leftBraces, rightBraces });
      setTexts(texts)
      setVars(vars)

      // get unique variable names
      const newArr = Array.from(new Set(vars))
      // only change, if new elements have been added
      if (!arraysEqual(newArr, variableKeys)) {
        variableKeys = Array.from(new Set(vars))
      }
    }
  }, [value])

  // when new variables are added to the input, update state with changes
  useEffect(() => {
    setVariableStates(syncVariableStates(variableKeys, variableStates))
  }, [variableKeys])

  useEffect(() => {
    if (duplicateVariableExists()) {
      setDuplicateVariableError('Duplicate variables exist')
    } else {
      setDuplicateVariableError('')
    }

    if (Object.values(variableStates).some(v => v.error)) {
      setVariableError(true);
    } else {
      setVariableError(false);
    }
  }, [variableStates])

  return (
    <div>
      <input type='text' className='methodName' value={methodName} onChange={onMethodNameChange}></input>
      {methodError && <p className='error methodName'>{methodError}</p>}

      <SqlOutputBlock texts={texts} vars={vars} variableStates={variableStates} onVariableChange={onVariableStatesChange} />

      {duplicateVariableError && <p className='error methodName'>{duplicateVariableError}</p>}

      {
        (methodError || inputError || variableError || duplicateVariableError) ?
          <button disabled>Fix errors before copying</button> :
          <button onClick={() => { navigator.clipboard.writeText(getTextForCopying(methodName, variableStates, texts, vars)) }}>Copy to clipboard</button>
      }
    </div>
  )
}