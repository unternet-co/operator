import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './app-root.css';
import './top-bar';
import './thread-view';
import './command-bar';

@customElement('app-root')
export class AppRoot extends LitElement {
  renderRoot = this;

  render() {
    return html`
      <top-bar></top-bar>
      <status-bar>No applets installed.</status-bar>
      <thread-view></thread-view>
      <command-bar></command-bar>
    `;
  }
}
