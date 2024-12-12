import { unternet } from '../lib/unternet';
import { Interaction, InteractionInput, interactions } from './interactions';
import { interactionsToMessages } from '../lib/utils';
import { appletRegister } from './appletRegister';
import { generateJson } from '../lib/openai';
import { prompts } from '../lib/prompts';
import { schemas } from '../lib/schemas';
import { ActionChoice, appletInstances } from './appletInstances';

async function init(appletUrls: string[]) {
  appletUrls.map(appletRegister.add);
}

async function handleInput(input: InteractionInput) {
  if (input.text === 'clear') {
    interactions.clear();
    return;
  }

  const interactionId = await interactions.fromInput(input);
  const history = (await interactions.all()).slice(-10);

  const { strategy } = await chooseStrategy(history);
  console.log(`[OPERATOR] Chosen strategy: '${strategy}'`);

  if (strategy === 'TEXT') {
    completeTextResponse(interactionId, history);
  } else if (strategy === 'RESEARCH') {
    const actionChoice = await chooseAction(history);
    const data = await appletInstances.getAppletData(actionChoice);
    await interactions.createDataOutput(interactionId, {
      appletUrl: actionChoice.appletUrl,
      content: data,
    });

    const newHistory = await interactions.all();

    console.log(newHistory);
    completeTextResponse(interactionId, newHistory);
  }
}

async function completeTextResponse(interactionId, history: Interaction[]) {
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

async function chooseAction(history: Interaction[]): Promise<ActionChoice> {
  const manifests = appletRegister.get();

  const { json: actionJson } = await generateJson({
    messages: [
      ...interactionsToMessages(history),
      {
        role: 'system',
        content: prompts.chooseAction(manifests),
      },
    ],
    schema: schemas.action,
  });

  console.log(actionJson);

  const action = manifests[actionJson.url].actions.find(
    (a) => (a.id = actionJson.actionId)
  );

  const { json: paramsJson } = await generateJson({
    messages: [
      ...interactionsToMessages(history),
      {
        role: 'system',
        content: prompts.chooseParams(action),
      },
    ],
    schema: schemas.params(action),
  });

  return {
    appletUrl: actionJson.url,
    actionId: actionJson.actionId,
    params: paramsJson,
  };
}

async function chooseStrategy(history: Interaction[]) {
  const { json } = await generateJson({
    messages: [
      ...interactionsToMessages(history),
      {
        role: 'system',
        content: prompts.chooseStrategy(),
      },
    ],
    schema: schemas.strategy,
  });

  return json;
}

export const operator = {
  init,
  handleInput,
};
