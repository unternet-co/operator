import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './app-root.css';
import './top-bar';
import './thread-view';
import './context-bar';
import './command-bar';
import { isElectron } from '../utils';

@customElement('app-root')
export class AppRoot extends LitElement {
  renderRoot = this;

  render() {
    return html`
      ${isElectron() ? html`<top-bar></top-bar>` : null}
      <thread-view></thread-view>
      <command-bar></command-bar>
      <context-bar></context-bar>
    `;
  }
}
