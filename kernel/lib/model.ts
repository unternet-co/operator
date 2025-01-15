import OpenAI from 'openai/index.mjs';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  compatibility: 'strict',
});

export const model = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface GenerateJsonParams {
  prompt?: string;
  messages?: ChatCompletionMessageParam[];
  schema: any;
}
export async function generateJson({ messages, schema }: GenerateJsonParams) {
  const completion = await model.beta.chat.completions.parse({
    // model: 'gpt-4o-2024-08-06',
    model: 'gpt-4o-mini',
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: {
        strict: true,
        name: 'params_schema',
        schema,
      },
    },
  });

  const json = completion.choices[0]?.message?.parsed as any;
  return { json };
}

// TODO: Replace with Unternet API endpoint
// export const openai = new OpenAI({
//   apiKey: import.meta.env.VITE_OPENAI_API_KEY,
//   dangerouslyAllowBrowser: true,
// });

// interface GenerateJsonParams {
//   prompt?: string;
//   messages?: ChatCompletionMessageParam[];
//   schema: any;
// }
// export async function generateJson({ messages, schema }: GenerateJsonParams) {
//   const completion = await openai.beta.chat.completions.parse({
//     // model: 'gpt-4o-2024-08-06',
//     model: 'gpt-4o-mini',
//     messages,
//     response_format: {
//       type: 'json_schema',
//       json_schema: {
//         strict: true,
//         name: 'params_schema',
//         schema,
//       },
//     },
//   });

//   const json = completion.choices[0]?.message?.parsed as any;
//   return { json };
// }
