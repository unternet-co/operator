import { AppletAction } from '@web-applets/sdk';
import { strategies } from './strategies';

function createObjectSchema(properties: object) {
  return {
    type: 'object',
    required: Object.keys(properties),
    properties,
    additionalProperties: false,
  };
}

const strategySchema = createObjectSchema({
  strategy: {
    type: 'string',
    description: `Must be one of the following values: ${Object.keys(strategies)
      .map((s) => `'${s}'`)
      .join(', ')}`,
  },
});

const actionSchema = createObjectSchema({
  url: {
    type: 'string',
    description: 'Corresponds to the "url" value of the tool.',
  },
  actionId: {
    type: 'string',
    description:
      'The ID of the action, corresponds to the "actionId" value of the tool.',
  },
});

const paramsSchema = (action: AppletAction) =>
  createObjectSchema(action.params);

export const schemas = {
  params: paramsSchema,
  strategy: strategySchema,
  action: actionSchema,
};
