import { generateJson } from './model';
import {
  createObjectSchema,
  decodeActionId,
  interactionsToMessages,
} from './utils';
import { Interaction } from '../modules/interactions';
import { ActionChoice } from '../lib/types';
import { ResourceAction, Resource } from '../modules/resources';
import { streamText } from 'ai';
import { openai } from './model';

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
  actions: ResourceAction[]
) {
  const prompt = `\
    In this environment you have access to a set of tools you can use to answer the user's question.
    Here are the functions available in JSONSchema format:
    ${JSON.stringify(actions)}
    With the above available tools in mind, choose from one of the following strategies to use while handling the user's query:
    ${JSON.stringify(strategies)}\
  `;

  const schema = createObjectSchema({
    strategy: {
      type: 'string',
      enum: Object.keys(strategies),
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
  actions: ResourceAction[],
  num?: number,
  hint?: string
): Promise<ActionChoice[]> {
  num = num || 1;
  const prompt = `\
    In this environment you have access to a set of tools. Here are the functions available in JSONSchema format:
    ${JSON.stringify(actions)}
    Choose one or more functions to call to respond to the user's query.
  `;

  const actionChoiceSchema = (action: ResourceAction) => {
    const schema: any = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          enum: [action.id],
        },
      },
      additionalProperties: false,
      required: ['id'],
    };

    if (action.parameters && Object.keys(action.parameters).length > 0) {
      schema.properties.arguments = action.parameters;

      // Set some variables that OpenAI requires if they're not present
      if (!schema.properties.arguments.required) {
        schema.properties.arguments.required = Object.keys(
          schema.properties.arguments.properties
        );
      }
      schema.properties.arguments.additionalProperties = false;

      schema.required.push('arguments');
    }

    return schema;
  };

  const responseSchema = {
    type: 'object',
    properties: {
      tools: {
        type: 'array',
        items: {
          anyOf: actions.map(actionChoiceSchema),
        },
        additionalProperties: false,
      },
    },
    required: ['tools'],
    additionalProperties: false,
  };

  const messages = await interactionsToMessages(history);

  const { json } = await generateJson({
    messages: [
      ...messages,
      {
        role: 'system',
        content: prompt,
      },
    ],
    schema: responseSchema,
  });

  return json.tools.map((choice) => {
    const { protocol, url, actionId } = decodeActionId(choice.id);
    return {
      protocol,
      url,
      actionId,
      arguments: choice.arguments,
    } as ActionChoice;
  });
}

async function chooseAction(
  history: Interaction[],
  actions: ResourceAction[],
  hint?: string
): Promise<ActionChoice> {
  const choices = await chooseActions(history, actions, 1, hint);
  return choices[0];
}

export const completions = {
  streamText: streamResponse,
  chooseStrategy,
  chooseActions,
  chooseAction,
};
