import OpenAI from 'openai/index.mjs';
import { createOpenAI } from '@ai-sdk/openai';
import { createOllama } from 'ollama-ai-provider';
import { generateObject,
  CoreSystemMessage,
  CoreUserMessage,
  CoreAssistantMessage,
  CoreToolMessage
} from 'ai';

export const DEFAULT_MODEL_OLLAMA = 'qwen2.5-coder:3b'
export const DEFAULT_MODEL_OPENAI = 'gpt-4o'


export interface modelOptions {
  type?: string,
  model?: string,
  apiKey?: string,
  baseURL?: string
}

export function fromConfig({
    type='openai',
    model,
    apiKey=import.meta.env.VITE_OPENAI_API_KEY,
    baseURL
  }:modelOptions = {}) {
  if (type === 'ollama' || !apiKey) {
    return createOllama({
      baseURL,
    })(model || DEFAULT_MODEL_OLLAMA);
  } else {
    return createOpenAI({
      apiKey,
      baseURL,
      compatibility: 'strict',
    })(model || DEFAULT_MODEL_OPENAI);
  }
}

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
  messages?: Array<CoreSystemMessage | CoreUserMessage | CoreAssistantMessage | CoreToolMessage>;
  schema: any;
}
export async function generateJson({ messages, schema }: GenerateJsonParams, options?: modelOptions) {
  const model = fromConfig(options)

  const { object } = await generateObject({
    model,
    messages,
    schema
  })

  return {json: object}
}