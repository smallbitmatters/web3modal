import { ClientCtrl, CoreUtil, ModalCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-metamask-connector-view')
export class W3mMetamaskConnectorView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private connecting = true
  @state() private error = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.onConnect()
  }

  // -- private ------------------------------------------------------ //
  private readonly connector = ClientCtrl.client().getConnectorById('injected')
  private readonly metamaskUrl = 'https://metamask.io/download/'

  private async onConnect() {
    try {
      const { ready } = this.connector
      if (ready) {
        this.error = false
        this.connecting = true
        await ClientCtrl.client().connectConnector('injected', OptionsCtrl.state.selectedChain?.id)
        ModalCtrl.close()
      }
    } catch (err) {
      this.error = true
      this.connecting = false
    }
  }

  private onInstall() {
    CoreUtil.openHref(this.metamaskUrl, '_blank')
  }

  private onMobile() {
    RouterCtrl.push('Qrcode')
  }

  private readyTemplate() {
    return html`
      <div class="w3m-connecting-title">
        ${this.connecting ? html`<w3m-spinner></w3m-spinner>` : null}
        <w3m-text variant="large-bold" color=${this.error ? 'error' : 'secondary'}>
          ${this.error ? 'Connection declined' : 'Continue in MetaMask...'}
        </w3m-text>
      </div>
      <w3m-button
        .onClick=${this.onConnect.bind(this)}
        .disabled=${!this.error}
        .iconRight=${SvgUtil.RETRY_ICON}
      >
        Try Again
      </w3m-button>
    `
  }

  private notReadyTemplate() {
    return html`
      <div class="w3m-install-title">
        <w3m-text variant="large-bold">Install MetaMask</w3m-text>
        <w3m-text color="secondary" align="center" variant="medium-thin">
          To connect MetaMask wallet, install the browser extension.
        </w3m-text>
      </div>
      <div class="w3m-install-actions">
        <w3m-button .onClick=${this.onInstall.bind(this)} .iconLeft=${SvgUtil.ARROW_DOWN_ICON}>
          Install Extension
        </w3m-button>
        <w3m-button .onClick=${this.onMobile} .iconLeft=${SvgUtil.MOBILE_ICON}>
          MetaMask Mobile
        </w3m-button>
      </div>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { ready } = this.connector
    const classes = {
      'w3m-injected-wrapper': true,
      'w3m-injected-error': this.error
    }

    return html`
      <w3m-modal-header title="MetaMask"></w3m-modal-header>
      <w3m-modal-content>
        <div class=${classMap(classes)}>
          <w3m-wallet-image walletId="metaMask" size="lg"></w3m-wallet-image>
          ${ready ? this.readyTemplate() : this.notReadyTemplate()}
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-metamask-connector-view': W3mMetamaskConnectorView
  }
}
