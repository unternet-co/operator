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

  isFollowing: boolean = true;
  prevInteractionsLength: number = 0;

  @property({ attribute: false })
  interactions: Interaction[] = [];

  connectedCallback() {
    super.connectedCallback();
    interactions.subscribe(this.updateInteractions.bind(this));

    // Break out of scroll if we scroll up
    let previousScrollY = this.scrollTop;
    this.addEventListener('scroll', () => {
      if (this.scrollTop < previousScrollY) {
        this.isFollowing = false;
      }
      previousScrollY = this.scrollTop;
    });
  }

  updateInteractions(newInteractions: Interaction[]) {
    // On a new interaction, scroll to bottom
    this.prevInteractionsLength = this.interactions.length;

    this.interactions = newInteractions;

    // If an interaction is updated, and we're following scroll, then scroll
    if (this.isFollowing) {
      this.scrollTo(0, this.scrollHeight);
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (this.prevInteractionsLength < this.interactions.length) {
      this.scrollTo(0, this.scrollHeight);
      this.isFollowing = true;
    }
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
          <div class="interaction-input">${interaction.input.text}</div>
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
    const interactions = this.interactions;

    if (!interactions.length) {
      return html`<div class="splash-screen"></div>`;
    }
    return html`${interactions.map(this.interactionTemplate.bind(this))}`;
  }
}
