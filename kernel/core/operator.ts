import { unternet } from '../lib/unternet';
import { Interaction, InteractionInput, interactions } from './interactions';
import { interactionsToMessages } from '../lib/utils';
import { appletRegister } from './appletRegister';
import { generateJson } from '../lib/openai';
import { prompts } from '../lib/prompts';
import { schemas } from '../lib/schemas';
import { ActionChoice, appletInstances } from './appletInstances';
import { AppletAction } from '@web-applets/sdk';

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

    completeTextResponse(
      interactionId,
      newHistory,
      'Cite relevant sources with a link in brackets, e.g. ([theverge.com](https://theverge.com/...))'
    );
  }
}

async function completeTextResponse(
  interactionId,
  history: Interaction[],
  systemPrompt?: string
) {
  const messages = interactionsToMessages(history);

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  const { textStream } = await unternet.intelligence.streamText({ messages });

  const outputIndex = await interactions.createTextOutput(interactionId);
  let totalText = '';
  for await (const part of textStream) {
    totalText += part;
    interactions.updateTextOutput(interactionId, outputIndex, totalText);
  }
}

async function chooseAction(history: Interaction[]): Promise<ActionChoice> {
  const manifests = appletRegister.get();
  let actionChoice: Partial<ActionChoice> = {};

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
  let n = 0;
  let selectedAction: AppletAction;
  for (const url in manifests) {
    for (const action of manifests[url].actions) {
      if (n === actionJson.tool_id) {
        selectedAction = action;
        actionChoice.appletUrl = url;
        actionChoice.actionId = action.id;
        break;
      }
      n += 1;
    }
  }

  if (!actionChoice) console.error('No choice made!');

  const { json: paramsJson } = await generateJson({
    messages: [
      ...interactionsToMessages(history),
      {
        role: 'system',
        content: prompts.chooseParams(selectedAction),
      },
    ],
    schema: schemas.params(selectedAction),
  });
  actionChoice.params = paramsJson;

  console.log(`[OPERATOR] Action choice made:`, actionChoice);

  return actionChoice as ActionChoice;
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
