import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  AppletRecord,
  DataOutput,
  Interaction,
  interactions,
  TextOutput,
} from '@unternet/kernel';
import { resolveMarkdown } from 'lit-markdown';
import './thread-view.css';
import { appletRecords } from '@unternet/kernel';
import './applet-view';
import { AppletOutput } from '@unternet/kernel/modules/interactions';
import { observe } from '@compactjs/chatscroll';
import { repeat } from 'lit/directives/repeat.js';

@customElement('thread-view')
export class ThreadView extends LitElement {
  renderRoot = this;

  isFollowing: boolean = true;
  prevInteractionsLength: number = 0;
  appletRecords: AppletRecord[] = [];

  @property({ attribute: false })
  interactions: Interaction[] = [];

  connectedCallback() {
    super.connectedCallback();
    appletRecords.subscribe(
      appletRecords.all,
      this.updateAppletRecords.bind(this)
    );
    interactions.subscribe(this.updateInteractions.bind(this));
    observe(this);

    // Break out of scroll if we scroll up
    // let previousScrollY = this.scrollTop;
    // this.addEventListener('scroll', () => {
    //   if (this.scrollTop < previousScrollY) {
    //     this.isFollowing = false;
    //   }
    //   previousScrollY = this.scrollTop;
    // });
  }

  updateAppletRecords(newAppletRecords: AppletRecord[]) {
    this.appletRecords = newAppletRecords;
  }

  updateInteractions(newInteractions: Interaction[]) {
    // On a new interaction, scroll to bottom
    this.prevInteractionsLength = this.interactions.length;
    this.interactions = newInteractions;

    // If an interaction is updated, and we're following scroll, then scroll
    // if (this.isFollowing) {
    //   this.scrollTo(0, this.scrollHeight);
    // }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // if (this.prevInteractionsLength < this.interactions.length) {
    //   this.scrollTo(0, this.scrollHeight);
    //   this.isFollowing = true;
    // }
  }

  textOutputTemplate(output: TextOutput) {
    return html`<div class="block">${resolveMarkdown(output.content)}</div>`;
  }

  dataOutputTemplate(output: DataOutput) {
    const record = this.appletRecords.find(
      (record) => record.url === output.appletUrl
    );
    return html`<div class="data-output">
      <img class="applet-icon" src=${record.manifest.icons[0].src} />
      <div class="description">
        Searched using
        <span class="applet-name"
          >${record.manifest.short_name || record.manifest.name}</span
        >
      </div>
    </div>`;
  }

  appletOutputTemplate(output: AppletOutput) {
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
              : output.type === 'applet'
              ? this.appletOutputTemplate(output)
              : this.dataOutputTemplate(output)
          )}
        </div>
      </div>
    `;
  }

  render() {
    const reversedInteractions = [...this.interactions].reverse();

    if (!reversedInteractions.length) {
      return html`<div class="splash-screen"></div>`;
    }
    return html`${repeat(
      reversedInteractions,
      (interaction) => interaction.id,
      (interaction) => this.interactionTemplate(interaction)
    )}`;
  }
}
