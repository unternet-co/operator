import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type Interaction, interactions } from '@unternet/kernel';
import { resolveMarkdown } from 'lit-markdown';
import './thread-view.css';

@customElement('thread-view')
export class ThreadView extends LitElement {
  renderRoot = this;

  @property({ attribute: false })
  interactions: Interaction[] = [];

  connectedCallback() {
    super.connectedCallback();
    interactions.subscribe(this.updateInteractions.bind(this));
  }

  updateInteractions(newInteractions: Interaction[]) {
    this.interactions = newInteractions;
  }

  interactionTemplate(interaction: Interaction) {
    return html`
      <div class="interaction">
        <div class="interaction-input">→ ${interaction.input.text}</div>
        <div class="block">
          ${interaction.outputs.map((output) =>
            resolveMarkdown(output.content)
          )}
        </div>
      </div>
    `;
  }

  render() {
    // const interactions = [...this.interactions].reverse();
    const interactions = this.interactions;

    if (!interactions.length) {
      return html`<div class="splash-screen">
        Welcome to the Operator Shell!
      </div>`;
    }
    return html`<div class="page">
      ${interactions.map(this.interactionTemplate)}
    </div>`;
  }
}
