import { useContext, useEffect, useState } from "react"
import QueryContext from "./context/QueryContext"
import VariableChoice from "./VariableChoice";
import { arraysEqual } from '../SqlToTypeScript/helpers/utils';
import { getTextsAndVars, getTextForCopying } from './helpers/SqlQueryHelper'
import type { variablesInterface } from "./helpers/types";

function syncVariableStates(
  keys: string[],
  currentStates: Record<string, variablesInterface>,
): Record<string, variablesInterface> {

  const newStates: Record<string, variablesInterface> = {};

  keys.forEach((key) => {
    if (key in currentStates) {
      newStates[key] = currentStates[key];
    } else {
      newStates[key] = { name: key, multiple: !key.includes('.') };
    }
  })
  return newStates;
}

interface SqlQueryParams {
  query: string
}

let variableKeys: string[] = [];

export default function SqlQuery({ query }: SqlQueryParams) {

  const [variableStates, setVariableStates] = useState<Record<string, variablesInterface>>({});
  const [texts, setTexts] = useState<string[]>([]);
  const [vars, setVars] = useState<string[]>([]);

  const originalQuery = useContext(QueryContext)

  const onVariableChange = (key: string, value: variablesInterface) => {
    setVariableStates(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // when new variables are added to the input, update state with changes
  useEffect(() => {
    setVariableStates(syncVariableStates(variableKeys, variableStates))
  }, [variableKeys])

  useEffect(() => {

    const { texts, vars } = getTextsAndVars(query, originalQuery)
    setTexts(texts);
    setVars(vars);

    // get unique variable names
    const newArr = Array.from(new Set(vars))
    // only change, if new elements have been added
    if (!arraysEqual(newArr, variableKeys)) {
      variableKeys = Array.from(new Set(vars))
    }

  }, [query])

  return (
    <div className='sqlOutput'>
      {
        [...Array(vars.length)].map((_x, i) =>
          <>

            <span className='inline-container'>
              {texts[i].split('\n').map((line, idx) => (
                <>
                  <p>{line}</p>
                  {idx != (texts[i].split('\n').length - 1) && <br />}
                </>
              ))}
              {
                variableStates[vars[i]] ?
                  <>&#123;&#123;< VariableChoice key={vars[i]} original={vars[i]} variableState={variableStates[vars[i]]} onChange={onVariableChange} />&#125;&#125;</>
                  : <></>
              }
            </span>

          </>
        )
      }
      <span className='inline-container'>
        {
          texts.length > 0 ?
            <>
              {
                texts[texts.length - 1].split('\n').map((line, idx) => (
                  <>
                    <p>{line}</p>
                    {idx != (texts[texts.length - 1].split('\n').length - 1) && <br />}
                  </>
                ))
              }
            </> : <></>
        }
      </span>

      <br />
      <br />
      <button onClick={() => { navigator.clipboard.writeText(getTextForCopying(variableStates, texts, vars)) }}>Copy to clipboard</button>

    </div>
  )
}