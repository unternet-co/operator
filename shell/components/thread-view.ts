import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  DataOutput,
  Interaction,
  interactions,
  TextOutput,
} from '../../kernel/core/interactions';
import { resolveMarkdown } from 'lit-markdown';
import './thread-view.css';
import { appletRegister } from '@unternet/kernel';

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

  textOutputTemplate(output: TextOutput) {
    return html`<div class="block">${resolveMarkdown(output.content)}</div>`;
  }

  dataOutputTemplate(output: DataOutput) {
    const manifest = appletRegister.get()[output.appletUrl];
    return html`<div class="data-output">
      <img class="applet-icon" src=${manifest.icons[0].src} />
      <div class="description">
        Searched using
        <span class="applet-name">${manifest.short_name || manifest.name}</span>
      </div>
    </div>`;
  }

  interactionTemplate(interaction: Interaction) {
    return html`
      <div class="interaction">
        <div class="page">
          <div class="interaction-input">→ ${interaction.input.text}</div>
          ${interaction.outputs.map((output) =>
            output.type === 'text'
              ? this.textOutputTemplate(output)
              : this.dataOutputTemplate(output)
          )}
        </div>
      </div>
    `;
  }

  render() {
    // const interactions = [...this.interactions].reverse();
    const interactions = this.interactions;

    if (!interactions.length) {
      return html`<div class="splash-screen"></div>`;
    }
    return html`${interactions.map(this.interactionTemplate.bind(this))}`;
  }
}
