import { ActionDirective } from '../types.js';

interface ActionSubscription {
  processId: string;
  callback: Function;
}

class ActionDispatcher {
  #items: ActionDirective[] = [];
  #subscriptions: ActionSubscription[] = [];

  send(item: ActionDirective) {
    // Check if processes includes the id
    // Otherwise, spin up a new one
    this.#items.push(item);
    const subs = this.#subscriptions.filter((s) => s.processId === item.uri);
  }

  subscribe(processId: string, callback: Function) {
    this.#subscriptions.push({ processId, callback });
  }
}

class ActionService {
  dispatcher = new ActionDispatcher();

  async dispatch(actionChoice: ActionChoice) {
    if (actionChoice.protocol === 'search') {
      const { webpages } = await unternet.lookup.query({
        q: actionChoice.arguments.query,
        webpages: {
          sites: [actionChoice.url],
        },
      });
      return webpages;
    }
  }

  async all() {
    const allResources = await resources.all();

    let actions = [];

    for (const resource of allResources) {
      // if (!resource.actions || resource.search) {
      if (!resource.actions) {
        actions.push({
          id: encodeActionURI({ protocol: 'search', url: resource.url }),
          description: `Conduct a web search on this website's pages.\nWebsite title:${resource.name}\nWebsite description: ${resource.description}`,
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query.',
              },
            },
            required: ['query'],
          },
        });
      } else {
        for (const action of resource.actions) {
          actions.push({
            id: encodeActionURI({ url: resource.url, actionId: action.id }),
            description: `${resource.description}\n\n${action.description}`,
            parameters: action.parameters,
          });
        }
      }
    }

    console.log(actions);

    return actions;
  }
}

export const actions = new ActionService();
