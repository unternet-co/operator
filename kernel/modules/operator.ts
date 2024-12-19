import { InteractionInput, interactions } from './interactions';
import { appletRecords } from './applet-records';
import { completions } from '../lib/completions';
import { processes } from './processes';

export const strategies = {
  TEXT: `Respond with a straight text response. This is appropriate for simple queries that you can provide a definitive answer to, where no research or tool use is needed, or when the prompt is a creative one or a trivial & non-controversial question.`,
  SEARCH: `Use this for search-like queries that depend on information from external sources that need to be synthesized into a response. For example, a SEARCH strategy may involve searching the web, or retrieving information from a locations API, or the users's documents, and then writing a response that summarizes the information retrieved.`,
  TOOL: `Use this when the user's query is answered most effectively by showing the user output from one of the available tools. For example, if the user has asked you to show a map, or to view flights, or has requested an tool to use directly. This will show the user a rich view created by the tool. Only select this if there is a tool that can respond.`,
};

async function init(appletUrls: string[]) {
  appletUrls.map(appletRecords.register);
}

async function handleInput(input: InteractionInput) {
  if (input.text === 'clear') {
    interactions.clear();
    return;
  }

  const interactionId = await interactions.fromInput(input);
  const history = (await interactions.all()).slice(-10);
  const applets = await appletRecords.all();

  const { strategy } = await completions.chooseStrategy(
    history,
    strategies,
    applets
  );
  console.log(`[OPERATOR] Chosen strategy: '${strategy}'`);

  if (strategy === 'TEXT') {
    const outputIndex = await interactions.createTextOutput(interactionId);
    completions.streamText(history, (text) => {
      interactions.updateTextOutput(interactionId, outputIndex, text);
    });
  } else if (strategy === 'SEARCH') {
    const actionChoices = await completions.chooseActions(history, applets, 3);

    const logMessage = actionChoices
      .map((c) => `${c.appletUrl}#${c.actionId}`)
      .join(', ');
    console.log(`[OPERATOR] Chosen actions: ${logMessage}`);

    for await (const actionChoice of actionChoices) {
      const data = await processes.runAppletWithAction(actionChoice);
      await interactions.createDataOutput(interactionId, {
        appletUrl: actionChoice.appletUrl,
        content: data,
      });
    }

    const newHistory = await interactions.all();

    const outputIndex = await interactions.createTextOutput(interactionId);
    completions.streamText(
      newHistory,
      (text: string) => {
        interactions.updateTextOutput(interactionId, outputIndex, text);
      },
      {
        system:
          'Cite relevant sources with a link in brackets, e.g. ([theverge.com](https://theverge.com/...))',
      }
    );
  } else if (strategy === 'TOOL') {
    // TODO: Make it only choose visible ones
    const actionChoice = await completions.chooseAction(history, applets);
    const logMessage = `${actionChoice.appletUrl}#${actionChoice.actionId}`;
    console.log(`[OPERATOR]  Chosen action: ${logMessage}`);

    const processId = await processes.createAppletProcess(actionChoice);
    interactions.createAppletOutput(interactionId, processId);
  }
}

export const operator = {
  init,
  handleInput,
};
