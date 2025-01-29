import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tools, ToolDefinition } from '@unternet/kernel';
import './applet-picker.css';

@customElement('applet-picker')
export class AppletPicker extends LitElement {
  renderRoot = this;
  clickListener: EventListener;

  @property({ attribute: false })
  tools: ToolDefinition[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    tools.subscribe(
      tools.all,
      (tools: ToolDefinition[]) => (this.tools = tools)
    );
  }

  handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const url = data.get('url') as string;
    tools.register(url);
  }

  handleDelete(url: string) {
    tools.delete(url);
  }

  render() {
    return html`<form @submit=${this.handleSubmit.bind(this)}>
        <input name="url" type="text" placeholder="Add applet from URL..." />
      </form>
      <ul class="picker-applet-list">
        ${this.tools.map(
          (tool) => html`<li>
            <div class="header">
              <div class="title">
                <img
                  class="picker-applet-icon"
                  src=${tool.icons && tool.icons[0].src}
                />
                <h2>${tool.name}</h2>
              </div>
              <button
                class="icon-button"
                @click=${() => this.handleDelete(tool.url)}
              >
                <img src="/icons/close.svg" />
              </button>
            </div>
            <p class="url">${tool.url}</p>
            <p class="description">${tool.description}</p>
          </li>`
        )}
      </ul>`;
  }
}
