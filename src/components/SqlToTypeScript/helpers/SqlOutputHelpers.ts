import type { variablesInterface } from './types';

interface InputParams {
  text: string,
  leftBraces: number[],
  rightBraces: number[]
}

interface isInputErrorParams {
  error: boolean,
  msg: string
}

export const replaceColonWithBraces = (text: string) => {
  const colons = getIndexOfAll(':', text).reverse();
  colons.forEach((idx) => {
    const spaceStart = text.indexOf(' ', idx);
    const quoteStart = text.indexOf("'", idx);
    let replaceIdx = spaceStart;
    if (spaceStart > quoteStart) {
      replaceIdx = quoteStart;
    }
    text = text.substring(0, replaceIdx) + '}} ' + (spaceStart > quoteStart ? "'" : "") + text.substring(replaceIdx + 1)
    text = text.substring(0, idx) + '{{' + text.substring(idx + 1)
  })
  return text
}

// nice little recurssive function, getting the index of all instances of a substring
export const getIndexOfAll = (
  substr: string,
  paragraph: string,
  array: number[] = [],
  prevIndex: number = 0): number[] => {

  if (prevIndex >= paragraph.length) {
    return array
  }
  const nextIdx = paragraph.indexOf(substr, prevIndex)
  if (nextIdx === -1) {
    return array
  }
  return getIndexOfAll(substr, paragraph, array.concat(nextIdx), nextIdx + substr.length)
}

export const isInputError = (
  { leftBraces, rightBraces }: Omit<InputParams, 'text'>): isInputErrorParams => {

  if (leftBraces.length != rightBraces.length) {
    return { error: true, msg: 'Error: Unequal number of left and right braces' };
  }
  let prevIndex = 0;
  for (let i = 0; i < leftBraces.length; i++) {
    // left before the right
    if (leftBraces[i] >= rightBraces[i]) {
      return { error: true, msg: `Error: Invalid braces at character ${rightBraces[i]}` };
    }
    // no nested braces
    if (prevIndex > leftBraces[i]) {
      return { error: true, msg: `Error: Invalid nested braces at character ${leftBraces[i]}` };
    }
    prevIndex = rightBraces[i];
  }
  return { error: false, msg: 'Success' };
}

export const splitInput = ({ text, leftBraces, rightBraces }: InputParams) => {
  const texts = [];
  const vars = [];

  let previousIndex = 0;

  for (let i = 0; i < leftBraces.length; i++) {
    // text before brackets
    texts.push(text.substring(previousIndex, leftBraces[i]));
    // text within brackets (+2 to remove brackets at the start)
    vars.push(text.substring(leftBraces[i] + 2, rightBraces[i]));

    // +2 to remove starting brackets for next text
    previousIndex = rightBraces[i] + 2;
  }
  texts.push(text.substring(previousIndex))
  return { texts, vars }
}

export const getTextForCopying = (methodName: string, variableStates: Record<string, variablesInterface>, texts: string[], vars: string[]) => {
  let text = `import singleline from "singleline"

export interface ${methodName}Params {`

  for (const [, value] of Object.entries(variableStates)) {
    text += `\n  ${value.name}: ${value.type};`
  }
  text += `\n}\n\nexport const ${methodName} = ({`

  for (const [, value] of Object.entries(variableStates)) {
    text += `\n  ${value.name},`
  }
  text += ` }: ${methodName}Params) => {
  return singleline(\``

  for (let i = 0; i < texts.length; i++) {
    text += texts[i];
    if (variableStates[vars[i]]) {
      text += `\${${variableStates[vars[i]].name}}`
    }
  }
  text += '`\n  )\n}'

  return text
}