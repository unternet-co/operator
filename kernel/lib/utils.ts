import { Interaction } from '../core/interactions';

export function interactionsToMessages(interactions: Interaction[]) {
  let messages = [];
  for (let interaction of interactions) {
    messages.push({
      role: 'user',
      content: interaction.input.text,
    });

    for (let output of interaction.outputs) {
      messages.push({
        role: 'assistant',
        content: output.content,
      });
    }
  }

  return messages;
}
