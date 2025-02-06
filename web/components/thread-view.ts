import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  Resource,
  DataOutput,
  Interaction,
  interactions,
  TextOutput,
} from '@unternet/kernel';
import { resolveMarkdown } from 'lit-markdown';
import './thread-view.css';
import { resources } from '@unternet/kernel';
import './applet-view';
import { WebOutput } from '@unternet/kernel/modules/interactions';
import { observe } from '@compactjs/chatscroll';
import { repeat } from 'lit/directives/repeat.js';

@customElement('thread-view')
export class ThreadView extends LitElement {
  renderRoot = this;

  isFollowing: boolean = true;
  prevInteractionsLength: number = 0;
  resources: Resource[] = [];

  @property({ attribute: false })
  interactions: Interaction[] = [];

  connectedCallback() {
    super.connectedCallback();
    resources.subscribe(
      resources.all,
      (resources) => (this.resources = resources)
    );
    interactions.subscribe(this.updateInteractions.bind(this));
    observe(this);
  }

  updateInteractions(newInteractions: Interaction[]) {
    this.prevInteractionsLength = this.interactions.length;
    this.interactions = newInteractions;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
  }

  textOutputTemplate(output: TextOutput) {
    return html`<div class="block">${resolveMarkdown(output.content)}</div>`;
  }

  dataOutputTemplate(output: DataOutput) {
    const resource = this.resources.find(
      (resource) => resource.url === output.resourceUrl
    );

    if (!resource) return;
    return html`<div class="data-output">
      ${resource.icons && resource.icons.length
        ? html`<img class="applet-icon" src=${resource.icons[0].src} />`
        : ''}
      <div class="description">
        Searched using
        <span class="applet-name">${resource.short_name || resource.name}</span>
      </div>
    </div>`;
  }

  appletOutputTemplate(output: WebOutput) {
    return html`<div class="applet-output">
      <applet-view processId=${output.processId}></applet-view>
    </div>`;
  }

  loadingTemplate() {
    return html` <div class="loading">Thinking...</div> `;
  }

  interactionTemplate(interaction: Interaction) {
    return html`
      <div class="interaction">
        <div class="page">
          <div class="interaction-input">${interaction.input.text}</div>
          ${!interaction.outputs.length ? this.loadingTemplate() : ''}
          ${interaction.outputs.map((output) =>
            output.type === 'text'
              ? this.textOutputTemplate(output)
              : output.type === 'web'
              ? this.appletOutputTemplate(output)
              : this.dataOutputTemplate(output)
          )}
        </div>
      </div>
    `;
  }

  render() {
    if (!this.interactions.length) {
      return html`<div class="splash-screen"></div>`;
    }
    return html`${repeat(
      this.interactions,
      (interaction) => interaction.id,
      (interaction) => this.interactionTemplate(interaction)
    )}`;
  }
}
