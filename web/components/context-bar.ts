import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './context-bar.css';
import { appletsRegister, type AppletsRegister } from '@unternet/kernel';

@customElement('context-bar')
export class ContextBar extends LitElement {
  renderRoot = this;

  @property({ attribute: false })
  register: AppletsRegister = {};

  connectedCallback(): void {
    super.connectedCallback();
    appletsRegister.subscribe((register) => (this.register = register));
  }

  render() {
    const manifests = Object.values(this.register);

    return html`
      ${manifests.map((manifest) => {
        return html`<div class="applet">
          <img class="applet-icon" src=${manifest.icons[0].src} />
          <span class="applet-name"
            >${manifest.short_name ?? manifest.name}</span
          >
        </div>`;
      })}
    `;
  }
}
