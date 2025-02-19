import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { resources, type Resource } from '@unternet/kernel';
import './applet-picker';
import './context-bar.css';

@customElement('context-bar')
export class ContextBar extends LitElement {
  renderRoot = this;

  @property({ attribute: false })
  resources: Resource[] = [];

  @property({ attribute: false })
  isAppletPickerOpen: boolean = false;

  connectedCallback(): void {
    super.connectedCallback();
    resources.subscribe(
      resources.all,
      (resources) => (this.resources = resources)
    );

    window.addEventListener('mousedown', (event) => {
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
      ${this.resources.map((tool) => {
        return html`<li class="applet-item">
          <img class="applet-icon" src=${tool.icons && tool.icons[0].src} />
          <span class="applet-name">${tool.short_name ?? tool.name}</span>
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
