import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './app-root.css';
import './top-bar';
import './thread-view';
import './command-bar';
import './context-bar';

@customElement('app-root')
export class AppRoot extends LitElement {
  renderRoot = this;

  @property({ attribute: false })
  showResourcePicker: boolean;

  render() {
    return html`
      <top-bar></top-bar>
      <thread-view></thread-view>
      <command-bar></command-bar>
      <context-bar></context-bar>
    `;
  }
}
