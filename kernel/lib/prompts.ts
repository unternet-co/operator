import { AppletAction, AppletManifest } from '@web-applets/sdk';
import { Interaction } from '../core/interactions';
import { strategies } from './strategies';

// TODO: Prompt & description should both be part of the same object
// and have parsing automatically done

function chooseStrategyPrompt() {
  const strategyString = Object.keys(strategies)
    .map((strategy) => {
      return `- ${strategy}: ${strategies[strategy]}`;
    })
    .join('\n');

  return `\
    Choose from one of the following strategies to use\
    while handling the user's query.\n\n${strategyString}\
  `;
}

export function chooseActionPrompt(manifests: {
  [key: string]: AppletManifest;
}) {
  let actionString = '';

  let n = 0;
  for (const url in manifests) {
    for (const action of manifests[url].actions) {
      actionString += `\n\n{
        "tool_id": ${n},
        "description": "${action.description}",
      }`;
      n += 1;
    }
  }

  return `\
    Choose from one of the following tools to use\
    in order to get information to answer the user's query.\n\n${actionString}\
  `;
}

export function chooseParamsPrompt(action: AppletAction) {
  return `You are using the following tool to answer the user's query:
  
  TOOL: "${action.id}"
  DESCRIPTION: "${action.description}"
  
  Now, choose the most appropriate parameter values.
  
  SCHEMA:
  ${JSON.stringify(action.params)}`;
}

export const prompts = {
  chooseStrategy: chooseStrategyPrompt,
  chooseAction: chooseActionPrompt,
  chooseParams: chooseParamsPrompt,
};
