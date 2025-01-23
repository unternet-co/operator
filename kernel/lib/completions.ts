import { generateJson } from './model';
import {
  createActionSchemas,
  createObjectSchema,
  decodeActionId,
  interactionsToMessages,
} from './utils';
import { Interaction } from '../modules/interactions';
import { ActionChoice } from '../lib/types';
import { ActionDefinition, ToolDefinition } from '../modules/tools';
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
  tools: ToolDefinition[]
) {
  const actions = createActionSchemas(tools);

  const prompt = `\
    In this environment you have access to a set of tools you can use to answer the user's question.
    Here are the functions available in JSONSchema format:
    ${JSON.stringify(actions)}
    With the above available tools in mind, choose from one of the following strategies to use while handling the user's query:
    ${JSON.stringify(strategies)}\
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
  tools: ToolDefinition[],
  num?: number
): Promise<ActionChoice[]> {
  num = num || 1;
  // Turns all actions into flat list, with id -> `${url}#${actionId}`
  const actions = createActionSchemas(tools);

  const prompt = `\
    In this environment you have access to a set of tools. Here are the functions available in JSONSchema format:
    ${actions}
    Choose one or more functions to call to respond to the user's query.
  `;

  const actionChoiceSchema = (action: ActionDefinition) => {
    const schema: any = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          enum: [action.id],
        },
      },
      addtionalProperties: false,
      required: ['id'],
    };

    if (action.parameters) {
      schema.properties.arguments = action.parameters;
      schema.required.push('arguments');
    }

    return schema;
  };

  const responseSchema = {
    type: 'json_schema',
    json_schema: {
      name: 'action_Choice',
      schema: {
        type: 'object',
        properties: {
          functions: {
            type: 'array',
            items: {
              oneOf: actions.map(actionChoiceSchema),
            },
          },
        },
        required: ['functions'],
        additionalProperties: false,
      },
      strict: true,
    },
  };

  const messages = await interactionsToMessages(history);
  console.log(responseSchema);

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

  return json.choices.map((choice) => {
    const [url, actionId] = decodeActionId(choice.id);
    return {
      url,
      actionId,
      arguments: choice.arguments,
    } as ActionChoice;
  });
}

async function chooseAction(
  history: Interaction[],
  tools: ToolDefinition[]
): Promise<ActionChoice> {
  const choices = await chooseActions(history, tools, 1);
  return choices[0];
}

export const completions = {
  streamText: streamResponse,
  chooseStrategy,
  chooseActions,
  chooseAction,
};
