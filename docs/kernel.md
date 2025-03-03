## Interactions

## Processes

Processes contain any

## Actions

Intended actions are passed around in `ActionDirective` objects. These describe the action entirely.

```ts
interface ActionDirective {
  protocol: ActionProtocol;
  url: string;
  actionId: string;
  arguments?: { [key: string]: any };
}
```

Where `ActionProtocol` is `web` or `search`.

Actions reduce down to a URI string for the model. For example...

- For a web search: `search:https://unternet.co`
- For a new web call: `web:https://unternet.co#actionName`
- For a running process call: `process:218ERU3818273G#actionName`

Other protocols will include `mcp` and `fetch`. In the future, extensions will be able to add their own protocols & handlers.
