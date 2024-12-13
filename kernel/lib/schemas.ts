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
  tool_id: {
    type: 'number',
    description: 'The ID number of the chosen tool',
  },
});

const paramsSchema = (action: AppletAction) =>
  createObjectSchema(action.params);

export const schemas = {
  params: paramsSchema,
  strategy: strategySchema,
  action: actionSchema,
};
