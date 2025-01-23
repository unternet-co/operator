import { InteractionInput, interactions } from './interactions';
import { tools } from './tools';
import { completions } from '../lib/completions';
import { processes } from './processes';

export const strategies = {
  TEXT: `Respond with a straight text response. This is appropriate for simple queries that you can provide a definitive answer to, where no research or tool use is needed, or when the prompt is a creative one or a trivial & non-controversial question.`,
  SEARCH: `Use this for search-like queries that depend on information from external sources that need to be synthesized into a response. For example, a SEARCH strategy may involve searching the web, or retrieving information from a locations API, or the users's documents, and then writing a response that summarizes the information retrieved.`,
  DISPLAY: `Use this when the user's query is answered most effectively by showing the user output from one of the available tools. For example, if the user has asked you to show a map, or to view flights, or has requested an tool to use directly. This will show the user a rich view created by the tool. Only select this if there is a tool that can respond.`,
};

async function init(appletUrls: string[]) {
  appletUrls.map((url) => tools.register(url));
}

async function handleInput(input: InteractionInput) {
  if (input.text === 'clear') {
    interactions.clear();
    return;
  }

  const interactionId = await interactions.fromInput(input);
  const history = (await interactions.all()).slice(-10);
  const availableTools = await tools.all();

  const { strategy } = await completions.chooseStrategy(
    history,
    strategies,
    availableTools
  );
  console.log(`[OPERATOR] Chosen strategy: '${strategy}'`);

  if (strategy === 'TEXT') {
    const outputIndex = await interactions.createTextOutput(interactionId);
    completions.streamText(history, (text) => {
      interactions.updateTextOutput(interactionId, outputIndex, text);
    });
  } else if (strategy === 'SEARCH') {
    const actionChoices = await completions.chooseActions(
      history,
      availableTools,
      3
    );

    const logMessage = actionChoices
      .map((c) => `${c.url}#${c.actionId}`)
      .join(', ');
    console.log(`[OPERATOR] Chosen actions: ${logMessage}`);

    for await (const actionChoice of actionChoices) {
      const data = await processes.runAction(actionChoice);
      await interactions.createDataOutput(interactionId, {
        appletUrl: actionChoice.url,
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
  } else if (strategy === 'DISPLAY') {
    // TODO: Make it only choose visible ones
    const actionChoice = await completions.chooseAction(
      history,
      availableTools
    );
    const logMessage = `${actionChoice.url}#${actionChoice.actionId}`;
    console.log(`[OPERATOR]  Chosen action: ${logMessage}`);

    const processId = await processes.createWebProcess(actionChoice.url);
    interactions.createWebOutput(interactionId, processId);
    await processes.dispatchAction(processId, actionChoice);
  }
}

export const operator = {
  init,
  handleInput,
};

/**
 * tool:
 * createProcess (optional -> describes how a process works)
 * dispatchAction (optional -> describes how to dispatch actions to a process)
 * runAction (optional -> describes how to make a call & do something or get a response)
 *
 * The only processes you can dispatch an action to right now are applets, maybe servlets later.
 *
 * Can an applet be a source too?
 * Ah default actions! By default can open a page, or query it (so long as a web page). Can override the query action if you want.
 */
