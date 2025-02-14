import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { resources, type Resource } from '@unternet/kernel';
import './resource-picker.css';

@customElement('resource-picker')
export class ResourcePicker extends LitElement {
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

  firstUpdated() {
    const input = this.querySelector('#filter-input') as HTMLInputElement;
    setTimeout(() => input.focus(), 1);
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
    return html`
      <input
        class="input"
        type="text"
        id="filter-input"
        placeholder="Filter resources..."
        autofocus
      />
      <ul class="picker-resource-list">
        ${this.resources.map(
          (resource) => html`<li>
            <div class="header">
              <div class="title">
                <img
                  class="picker-resource-icon"
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
      </ul>
      <div class="picker-button-bar">
        <button class="button">Add</button>
        <a
          href="https://unternet.co/directory"
          target="_blank"
          class="external-link"
          >Directory</a
        >
      </div>
    `;
  }
}
