import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { appletRecords, type AppletRecord } from '@unternet/kernel';
import './applet-picker';
import './context-bar.css';

@customElement('context-bar')
export class ContextBar extends LitElement {
  renderRoot = this;

  @property({ attribute: false })
  appletRecords: AppletRecord[] = [];

  @property({ attribute: false })
  isAppletPickerOpen: boolean = false;

  connectedCallback(): void {
    super.connectedCallback();
    appletRecords.subscribe(
      appletRecords.all,
      (appletRecords) => (this.appletRecords = appletRecords)
    );

    window.addEventListener('mousedown', (event) => {
      console.log('click');
      const target = event.target as Node;
      const appletPickerNode = this.querySelector('applet-picker');
      const buttonNode = this.querySelector('button');
      if (
        appletPickerNode &&
        this.isAppletPickerOpen &&
        target !== appletPickerNode &&
        target !== buttonNode &&
        !appletPickerNode.contains(target)
      ) {
        this.toggleAppletPicker();
      }
    });
  }

  appletTemplate() {
    return html`
      ${this.appletRecords.map((record) => {
        return html`<li class="applet-item">
          <img class="applet-icon" src=${record.manifest.icons[0].src} />
          <span class="applet-name"
            >${record.manifest.short_name ?? record.manifest.name}</span
          >
        </li>`;
      })}
    `;
  }

  toggleAppletPicker() {
    this.isAppletPickerOpen = !this.isAppletPickerOpen;
  }

  render() {
    return html`
      <ul class="applets-list">
        ${this.appletTemplate()}
      </ul>
      <div class="add-applet-container">
        ${this.isAppletPickerOpen ? html`<applet-picker></applet-picker>` : ''}
        <button
          @mousedown=${this.toggleAppletPicker.bind(this)}
          class="icon-button"
        >
          <img src="/icons/toolbox.svg" />
        </button>
      </div>
    `;
  }
}
