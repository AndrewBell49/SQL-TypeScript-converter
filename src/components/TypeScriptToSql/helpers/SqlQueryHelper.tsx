import { getIndexOfAll } from "../../SqlToTypeScript/helpers/SqlOutputHelpers"
import type { variablesInterface } from "./types";

interface InjectedParams {
  text: string,
  type: 'function' | 'ternary' | 'variable'
  idxStart: number;
  idxEnd: number;
}

function getTextsAndVarsFromString(text: string, queryStart?: number, queryEnd?: number) {
  const querySplit = text.substring(queryStart ? queryStart : 0, queryEnd ? queryEnd : text.length - 1).split(new RegExp(/\}|\$\{/))

  const texts = querySplit.filter((_q, i) => i % 2 === 0)
  texts.map((t) => {
    const finalChars = t.substring(t.length - 5)
    if (finalChars.includes("'")) {
      t.lastIndexOf("'")
    }
  })
  const vars = querySplit.filter((_q, i) => i % 2 === 1)

  return { texts, vars }
}

function getTextsAndVarsFromFunction(query: string, funcName: string) {
  const functionBegin = query.indexOf(funcName)

  if (!functionBegin) {
    return { texts: [funcName], vars: [] }
  }

  const queryStart = query.indexOf('`', functionBegin)
  const queryEnd = query.indexOf('`', queryStart + 1)

  return getTextsAndVarsFromString(query, queryStart + 1, queryEnd)
}

function parseInjectedString(query: string) {

  const injectBegin = getIndexOfAll('${', query)
  const injectEnd = injectBegin.map((idx) => query.indexOf('}', idx))
  const injectedItems = injectBegin.map((s, i) => query.substring(s + 2, injectEnd[i]))

  const injectedParams: InjectedParams[] = injectedItems.map((item, i) => {
    let type: InjectedParams['type'] = 'variable'
    if (item.includes('(')) {
      type = 'function'
    } else if (item.includes('?')) {
      type = 'ternary'
    }
    return { text: item, type, idxStart: injectBegin[i] + 2, idxEnd: injectEnd[i] - 1 }
  })

  return injectedParams
}

export function getTextsAndVars(query: string, originalQuery: string) {

  const injectedParams = parseInjectedString(query)

  const texts: string[] = []
  const vars: string[] = []

  let prevIdx = -2
  let functionPrevious = false;
  injectedParams.forEach((param) => {
    // if the previous injected value was a function, merge the new text and the final text of the function
    if (functionPrevious) {
      texts[texts.length - 1] += query.substring(prevIdx + 2, param.idxStart - 2)
    } else {
      texts.push(query.substring(prevIdx + 2, param.idxStart - 2))
    }
    functionPrevious = false;
    prevIdx = param.idxEnd

    if (param.type === 'function') {
      // get all texts and variables from the function, removing the brackets of function
      const { texts: funcTexts, vars: funcVars } = getTextsAndVarsFromFunction(originalQuery, param.text.split('(')[0])

      // merge first part of text, with previous text
      texts[texts.length - 1] += funcTexts[0]

      // add all variables and texts from function
      if (funcVars.length > 0) {
        vars.push(...funcVars)
        // don't add the first text, as this was merged
        texts.push(...funcTexts.slice(1))
      }
      functionPrevious = true;
    } else if (param.type === 'ternary') {
      vars.push(`Ternary operator detected: ${param.text}`)
    } else {
      vars.push(param.text)
    }
  })
  // add final text, after final variable
  if (functionPrevious) {
    texts[texts.length - 1] += query.substring(prevIdx + 2)
  } else {
    texts.push(query.substring(prevIdx + 2))
  }

  return { texts, vars }
}

export const getTextForCopying = (variableStates: Record<string, variablesInterface>, texts: string[], vars: string[]) => {
  let text = '';
  let previousMultiple = false;
  for (let i = 0; i < texts.length; i++) {

    let nextText = texts[i];

    if (previousMultiple) {
      const startOfStringQuote = texts[i].substring(0, 3).indexOf("'")
      if (startOfStringQuote != -1) {
        nextText = texts[i].substring(0, startOfStringQuote)
        nextText += texts[i].substring(startOfStringQuote + 1)
      }
      text += ')'
    }

    previousMultiple = false;

    // remove quotes if multiple used
    if (variableStates[vars[i]] && variableStates[vars[i]].multiple) {
      const indexOfEquals = nextText.substring(nextText.length - 5).indexOf('=')
      if (indexOfEquals != -1) {
        let removedEquals = nextText.substring(0, indexOfEquals + nextText.length - 5)
        removedEquals += "IN"
        removedEquals += nextText.substring(indexOfEquals + nextText.length - 5 + 1)
        nextText = removedEquals
      }
      const endOfStringQuote = nextText.substring(nextText.length - 3).lastIndexOf("'")
      if (endOfStringQuote == -1) {
        text += nextText
      } else {
        text += nextText.substring(0, endOfStringQuote + nextText.length - 3)
        text += nextText.substring(endOfStringQuote + nextText.length - 3 + 1)
      }
      text += '('
      previousMultiple = true
    } else {
      text += nextText;
    }
    if (variableStates[vars[i]]) {
      text += `\{\{${variableStates[vars[i]].name}\}\}`
    }
  }

  return text
}