import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './top-bar.css';

@customElement('top-bar')
export class TopBar extends LitElement {
  renderRoot = this;

  render() {
    return html``;
    return html`<tab-handle>New tab</tab-handle>`;
  }
}
