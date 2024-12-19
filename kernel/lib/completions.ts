import { generateJson } from '../ext/openai';
import {
  createObjectSchema,
  indexAppletActions,
  interactionsToMessages,
} from './utils';
import { Interaction } from '../modules/interactions';
import { unternet } from '../ext/unternet';
import { ActionChoice } from '../modules/processes';
import { AppletRecord } from '../modules/applet-records';
import { streamText } from 'ai';
import { openai } from './models';

interface completionsOptions {
  system?: string;
}

/* STREAM TEXT */

async function streamResponse(
  history: Interaction[],
  callback: (str: string) => void,
  options?: completionsOptions
) {
  const messages = await interactionsToMessages(history);
  if (options?.system)
    messages.push({ role: 'system', content: options.system });

  const { textStream } = await streamText({
    model: openai('gpt-4o'),
    messages,
  });

  let totalText = '';
  for await (const part of textStream) {
    totalText += part;
    callback(totalText);
  }
}

/* STRATEGIES */

async function chooseStrategy(
  history: Interaction[],
  strategies: { [key: string]: string },
  applets?: AppletRecord[]
) {
  const indexedActions = indexAppletActions(applets);

  const strategyString = Object.keys(strategies)
    .map((strategy) => {
      return `- ${strategy}: ${strategies[strategy]}`;
    })
    .join('\n');

  const prompt = `\
    You are an AI assistant, tasked with responding to the user's commands. You are able to use one of the following tools in your answer.

    AVAILABLE TOOLS:

    ${JSON.stringify(indexedActions)}

    Now, with the above available tools in mind, choose from one of the following strategies to use while handling the user's query.
    
    STRATEGIES:
    
    \n\n${strategyString}\
  `;

  const possibleValues = Object.keys(strategies)
    .map((s) => `'${s}'`)
    .join(', ');

  const schema = createObjectSchema({
    strategy: {
      type: 'string',
      description: `Must be one of the following values: ${possibleValues}`,
    },
  });

  const messages = await interactionsToMessages(history);

  const { json } = await generateJson({
    messages: [
      ...messages,
      {
        role: 'system',
        content: prompt,
      },
    ],
    schema,
  });

  return json;
}

/* ACTIONS */

async function chooseActions(
  history: Interaction[],
  applets: AppletRecord[],
  num?: number
) {
  const indexedActions = indexAppletActions(applets);

  const actionDescriptions = indexedActions.map((x) => {
    return {
      id: x.key,
      description: x.action.description,
      params: x.action.params,
    };
  });
  const actionsString = JSON.stringify(actionDescriptions, null, 2);

  num = num || 0;

  const prompt = `\
    Choose from one of the following tools to use, and fill out the appropriate parameters, in order to get information to answer the user's query.\n\n${actionsString}\
  `;

  let paramsSchemas: any[] = indexedActions
    .filter((indexedAction) => indexedAction.action.params)
    .map((indexedAction) => {
      return {
        type: 'object',
        description: `An object that adheres to the chosen tool's params schema.`,
        properties: indexedAction.action.params,
        additionalProperties: false,
        required: Object.keys(indexedAction.action.params),
      };
    });

  paramsSchemas = [
    ...paramsSchemas,
    {
      type: 'null',
      description: 'Null, for when a tool has no schema.',
    },
  ];

  const schema = createObjectSchema({
    choices: {
      type: 'array',
      description: `An array of the chosen tools, and filled out params. Array must have a length of ${num} or less.`,
      items: {
        type: 'object',
        required: ['id', 'params'],
        additionalProperties: false,
        properties: {
          id: {
            type: 'string',
            description: `Must be one of the above tool ids`,
          },
          params: {
            anyOf: paramsSchemas,
          },
        },
      },
    },
  });

  const messages = await interactionsToMessages(history);

  const { json } = await generateJson({
    messages: [
      ...messages,
      {
        role: 'system',
        content: prompt,
      },
    ],
    schema,
  });

  return json.choices.map((choice) => {
    const indexedAction = indexedActions.find((a) => a.key === choice.id);
    return {
      appletUrl: indexedAction.appletUrl,
      actionId: indexedAction.action.id,
      params: choice.params,
    };
  });
}

async function chooseAction(
  history: Interaction[],
  applets: AppletRecord[]
): Promise<ActionChoice> {
  const actions = await chooseActions(history, applets, 1);
  return actions[0];
}

export const completions = {
  streamText: streamResponse,
  chooseStrategy,
  chooseActions,
  chooseAction,
};
