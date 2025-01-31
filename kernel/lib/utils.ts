import { Interaction } from '../modules/interactions';
import { Process, processes } from '../modules/processes';
import { loadManifest } from '@web-applets/sdk';
import { Resource } from '../modules/resources';

export async function interactionsToMessages(interactions: Interaction[]) {
  let messages = [];
  for (let interaction of interactions) {
    messages.push({
      role: 'user',
      content: interaction.input.text,
    });

    for (let output of interaction.outputs) {
      if (output.type === 'data') {
        messages.push({
          role: 'system',
          content: `Latest, relevant data for this query:\n\n${JSON.stringify(
            output.content
          )}`,
        });
      } else if (output.type === 'text') {
        messages.push({
          role: 'assistant',
          content: output.content,
        });
      } else if (output.type === 'web') {
        const process: Process = await processes.get(output.processId);
        messages.push({
          role: 'system',
          content: `Data from tool:\n\n${JSON.stringify(process.data)}`,
        });
      }
    }
  }

  return messages;
}

export function createObjectSchema(properties: object) {
  return {
    type: 'object',
    required: Object.keys(properties),
    properties,
    additionalProperties: false,
  };
}

export function encodeActionId(url: string, actionId: string) {
  return `${url}#${actionId}`;
}
export function decodeActionId(encodedActionId: string) {
  // Returns [url, actionId]
  return encodedActionId.split('#');
}

export function createActionSchemas(tools: Resource[]) {
  let schemas = [];

  for (const tool of tools) {
    for (const action of tool.actions) {
      schemas.push({
        id: encodeActionId(tool.url, action.id),
        description: action.description,
        parameters: action.parameters,
      });
    }
  }

  return schemas;
}

export async function getMetadata(url: string) {
  const manifest = await loadManifest(url);
  // TODO: Fetch metadata from normal sites
  if (manifest) return manifest;
}

export function normalizeUrl(url, defaultProtocol: 'http' | 'https' = 'https') {
  try {
    const hasProtocol = /^[a-zA-Z]+:\/\//.test(url);
    return hasProtocol ? url : `${defaultProtocol}://${url}`;
  } catch (error) {
    return null;
  }
}
