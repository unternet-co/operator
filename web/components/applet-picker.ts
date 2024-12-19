import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { appletRecords, AppletRecord } from '@unternet/kernel';
import './applet-picker.css';

@customElement('applet-picker')
export class AppletPicker extends LitElement {
  renderRoot = this;
  clickListener: EventListener;

  @property({ attribute: false })
  appletRecords: AppletRecord[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    appletRecords.subscribe(
      appletRecords.all,
      (records: AppletRecord[]) => (this.appletRecords = records)
    );
  }

  handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const url = data.get('url') as string;
    appletRecords.register(url);
  }

  handleDelete(url: string) {
    appletRecords.delete(url);
  }

  render() {
    return html`<form @submit=${this.handleSubmit.bind(this)}>
        <input name="url" type="text" placeholder="Add applet from URL..." />
      </form>
      <ul class="picker-applet-list">
        ${this.appletRecords.map(
          (record) => html`<li>
            <div class="header">
              <div class="title">
                <img
                  class="picker-applet-icon"
                  src=${record.manifest.icons[0].src}
                />
                <h2>${record.manifest.name}</h2>
              </div>
              <button
                class="icon-button"
                @click=${() => this.handleDelete(record.url)}
              >
                <img src="/icons/close.svg" />
              </button>
            </div>
            <p class="url">${record.url}</p>
            <p class="description">${record.manifest.description}</p>
          </li>`
        )}
      </ul>`;
  }
}
