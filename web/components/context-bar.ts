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
    console.log(this.register);
    return html`${JSON.stringify(this.register)}`;
  }
}
