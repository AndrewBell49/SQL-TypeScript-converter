import VariableChoice from './VariableChoice';
import type { variablesInterface } from './helpers/types'

interface SqlOutputBoxParams {
  texts: string[],
  vars: string[],
  variableStates: Record<string, variablesInterface>,
  onVariableChange: (key: string, value: variablesInterface) => void
}

export default function SqlOutputBlock(
  { texts, vars, variableStates, onVariableChange }: SqlOutputBoxParams) {

  return (
    <div className='sqlOutput'>
      {
        [...Array(vars.length)].map((_x, i) =>
          <>

            <span>
              {texts[i].split('\n').map((line, idx) => (
                <>
                  {line}
                  {idx != (texts[i].split('\n').length - 1) && <br />}
                </>
              ))}
            </span>

            {variableStates[vars[i]] ?
              <VariableChoice key={vars[i]} original={vars[i]} variableState={variableStates[vars[i]]} onChange={onVariableChange} />
              : <></>
            }

          </>
        )
      }
      <span>
        {
          texts.length > 0 ?
            <>
              {
                texts[texts.length - 1].split('\n').map((line, idx) => (
                  <>
                    {line}
                    {idx != (texts[texts.length - 1].split('\n').length - 1) && <br />}
                  </>
                ))
              }
            </> : <></>
        }
      </span>
    </div>
  )
}