import { LitElement,html,css } from 'lit-element';
import { nothing } from 'lit-html';
// import {playKorean} from 'https://assiets.vdegenne.com/voices.js';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-snackbar';
import '@material/mwc-dialog';
import '@material/mwc-circular-progress';
import { words } from './words';

export class KoreanApp extends LitElement {
  static properties = {
    word: { type: String },
    setName: { type: String },
    played: { type: Boolean },
    prevent17: { type: Boolean },
  }

  static styles = css`
  :host {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: pointer;
  }
  #word-container {
    font-size: 66px;
    /* padding: 20px 20px 30px 20px; */
    min-height: 160px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    font-family: NanumSquare;
  }
  #main-button {
    --mdc-theme-primary: black;
  }

  mwc-dialog > #content {
    margin-top: 14px;
  }

  mwc-dialog > #content > mwc-button {
    display: block;
    --mdc-theme-primary: black;
    margin: 13px 0;
  }

  mwc-circular-progress {
    padding-top: 20px;
    --mdc-theme-primary: black;
  }

  mwc-icon-button {
    --mdc-icon-button-size: 46px;
    --mdc-icon-size:30px;
    position: absolute;
    bottom:5px;right:5px;
    color:grey;
  }

  mwc-snackbar {
    --mdc-snackbar-action-color: yellow;
  }

  #tags {
    position: absolute;
    top:10px;
    left: 10px;
  }
  #tags > .tag {
    padding: 3px 5px;
    background-color: #eeeeee;
    border-radius: 4px;
    display: inline-block;
    margin: 0 3px 3px 0;
  }
  `;

  constructor() {
    super();

    this.prevent17 = !new URLSearchParams(window.location.search).has('17');

    this.nextWord()

    let playingWord = null;
    this.addEventListener('click',async () => {
      if (this.word === null) {
        return;
      }
      try {
        playingWord = this.word;
        const audio = await playKorean(this.word);
        if (playingWord === this.word) {
          this.played = true;
        }
      } catch (e) {
        this.toast('Sorry, this sound is not available')
        this.played = true;
      }
    })
  }

  render() {
    return html`
    <div id="tags">
      ${this.word !== null ? this.setName.split('/').map(name => {
      return html`<div class="tag">#${name}</div>`
      }) : nothing}
    </div>

    <div id="word-container">
      ${this.word !== null ?
              html`<span style="user-select:text;cursor:text" @click="${e => e.stopPropagation()}">${this.word}</span>` :
        html`<mwc-circular-progress indeterminate></mwc-circular-progress>`
        }
    </div>

    <mwc-button raised icon="arrow_forward" id="main-button" ?disabled=${!this.played} @click="${this.nextWord}">next word
    </mwc-button>

    <span style="color:grey;margin:20px 0 0;"><span id="word-count">${words.length}</span> words</span>

    ${this.word !== null ?
      html`<mwc-icon-button icon="open_in_new" @click="${this.openExternalDialog}"></mwc-icon-button>` : nothing}

    <mwc-dialog heading="${this.word || ''}" @click="${e => e.stopPropagation()}">
      <div id="content">
        <mwc-button @click="${() => this.openIn('naver')}">
          <b slot="icon" style="line-height:18px;color:green">N</b>Naver
        </mwc-button>
        <mwc-button icon="language" label="Web Search" @click="${() => this.openIn('google')}"></mwc-button>
        <mwc-button icon="image" label="Images" @click="${() => this.openIn('images')}"></mwc-button>
      </div>
      <mwc-button slot="primaryAction" dialogAction="close">Cancel</mwc-button>
    </mwc-dialog>

    <mwc-snackbar @click="${e => e.stopPropagation()}"></mwc-snackbar>
    `;
    }

    firstUpdated() {
      const wordCount = [...new Set(words.map(set => set.w).reduce((acc, v) => acc.concat(v), []))].length;
      this.shadowRoot.querySelector('#word-count').textContent = wordCount;
    }

    openExternalDialog(e) {
    e.stopPropagation();
    this.shadowRoot.querySelector('mwc-dialog').open = true;
    }

    openIn(site) {
    switch(site) {
    case 'naver':
        window.open(`https://ko.dict.naver.com/#/search?query=${encodeURIComponent(this.word)}&range=example`,'_blank');
        break;
      case 'google':
        window.open(`https://www.google.com/search?hl=en&q=${encodeURIComponent(this.word)}`,'_blank');
        break;
      case 'images':
        window.open(`https://www.google.com/search?hl=en&q=${encodeURIComponent(this.word)}&source=lnms&tbm=isch`,'_blank');
        break;
    }
    }

    async pickNewWord() {
    this.word = null;
    let set,word,response;
    do {
    set = words[Math.floor(Math.random() * words.length - 1)];
    word = set.w[Math.floor(Math.random() * set.w.length - 1)];
    response = await fetch(`https://assiets.vdegenne.com/api/audios/korean/${word}`);
    } while(response.status !== 200);
this.setName = set.n;
this.word = word;
  }

async nextWord(e) {
  if (e) {
    e.stopPropagation();
  }
  this.played = false;
  await this.pickNewWord();
  if (!this.alreadyPlayed) {
    this.toast('Click anywhere to hear the audio')
    this.alreadyPlayed = true;
  }
}


toast(message,timeoutMs = 4000) {
  const snackbar = this.shadowRoot.querySelector('mwc-snackbar')
  snackbar.labelText = message;
  snackbar.timeoutMs = timeoutMs;
  snackbar.open = true
}
closeSnackbar() {
  const snackbar = this.shadowRoot.querySelector('mwc-snackbar')
  snackbar.open = false;
}

updated() {
  this.shadowRoot.querySelectorAll('mwc-dialog > #content mwc-button').forEach(b => {
    try {
      b.shadowRoot.querySelector('.leading-icon').style = 'height:18px'
    } catch (e) { }
  })
}
}
window.customElements.define('korean-app',KoreanApp);