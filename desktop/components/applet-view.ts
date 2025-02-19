import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Process, processes } from '@unternet/kernel';
import '@web-applets/sdk/dist/components/applet-frame';
import './applet-view.css';

@customElement('applet-view')
export class AppletView extends LitElement {
  renderRoot = this;

  @property({ type: Number })
  processId: number;

  @property({ type: String })
  src: string = '';

  @property({ attribute: false })
  data: any;

  connectedCallback(): void {
    super.connectedCallback();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('processId') && this.processId)
      this.attachProcess(this.processId);
  }

  attachProcess(processId: Process['id']) {
    const query = () => processes.get(processId);
    processes.subscribe(query, (process: Process) => {
      this.src = process.url;
      this.data = process.data;
    });
  }

  render() {
    if (!this.src) return;
    return html`
      <header class="applet-header"></header>
      <applet-frame src=${this.src} .data=${this.data}></applet-frame>
    `;
  }
}
