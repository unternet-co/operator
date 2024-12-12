import { Interaction } from '../core/interactions';

export function interactionsToMessages(interactions: Interaction[]) {
  let messages = [];
  for (let interaction of interactions) {
    messages.push({
      role: 'user',
      content: interaction.input.text,
    });

    for (let output of interaction.outputs) {
      if (output.type === 'data') {
        messages.push({
          role: 'system',
          content: `Latest, relevant data for this query:\n\n${JSON.stringify(
            output.content
          )}`,
        });
      } else if (output.type === 'text') {
        messages.push({
          role: 'assistant',
          content: output.content,
        });
      }
    }
  }

  return messages;
}
