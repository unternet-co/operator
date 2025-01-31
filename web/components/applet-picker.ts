import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { resources, type Resource } from '@unternet/kernel';
import './applet-picker.css';

@customElement('applet-picker')
export class AppletPicker extends LitElement {
  renderRoot = this;
  clickListener: EventListener;

  @property({ attribute: false })
  resources: Resource[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    resources.subscribe(
      resources.all,
      (resources: Resource[]) => (this.resources = resources)
    );
  }

  handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const url = data.get('url') as string;
    resources.register(url);
  }

  handleDelete(url: string) {
    resources.delete(url);
  }

  render() {
    return html`<form @submit=${this.handleSubmit.bind(this)}>
        <input name="url" type="text" placeholder="Add applet from URL..." />
      </form>
      <ul class="picker-applet-list">
        ${this.resources.map(
          (resource) => html`<li>
            <div class="header">
              <div class="title">
                <img
                  class="picker-applet-icon"
                  src=${resource.icons && resource.icons[0].src}
                />
                <h2>${resource.name}</h2>
              </div>
              <button
                class="icon-button"
                @click=${() => this.handleDelete(resource.url)}
              >
                <img src="/icons/close.svg" />
              </button>
            </div>
            <p class="url">${resource.url}</p>
            <p class="description">${resource.description}</p>
          </li>`
        )}
      </ul>`;
  }
}
