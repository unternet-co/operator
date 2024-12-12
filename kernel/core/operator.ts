import { unternet } from '../lib/unternet';
import { InteractionInput, interactions } from './interactions';
import { interactionsToMessages } from '../lib/utils';
import { appletsRegister } from './applets';

async function init(appletUrls: string[]) {
  appletUrls.map(appletsRegister.add);
}

async function handleInput(input: InteractionInput) {
  if (input.text === 'clear') {
    interactions.clear();
    return;
  }

  const interactionId = await interactions.fromInput(input);
  const history = await interactions.all();

  const { textStream } = await unternet.intelligence.streamText({
    messages: interactionsToMessages(history),
  });

  const outputIndex = await interactions.createTextOutput(interactionId);
  let totalText = '';
  for await (const part of textStream) {
    totalText += part;
    interactions.updateTextOutput(interactionId, outputIndex, totalText);
  }
}

export const operator = {
  init,
  handleInput,
};
