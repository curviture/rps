import { h, Component, render } from "https://unpkg.com/preact?module";
import htm from "https://unpkg.com/htm?module";

const html = htm.bind(h);

// function App(props) {

//     return html`<h1>Hello ${props.name}!</h1>`
// }

function Score(props) {
  return html` <div class="info__score score">
    <span class="score__label">score</span>
    <span class="score__amount">${props.score}</span>
  </div>`;
}

function clickHandler(a) {
  console.log(a);
}

function Suit(props) {
  const suit = props.suit == "" ? "empty" : props.suit;
  const style =
    suit != "empty"
      ? `background-image: url('images/icon-${props.suit}.svg')`
      : `background-image: url('')`;
  return html`
    <div
      class="suit  suit--${suit}"
      onClick=${() => (props.clickhandler ? props.clickhandler(suit) : "")}
    >
      <div class="suit__icon" style=${style}></div>
    </div>
  `;
}

function PlayerTurnScreen(props) {
  const { suits } = props;
  console.log(suits);
  return html`
    <div class="gamescreen gamescreen--player gamescreen--simple">
      ${suits.map(
        (suit) =>
          html`<${Suit} suit="${suit}" clickhandler="${props.clickhandler}" />`
      )}
    </div>
  `;
}

function ComputerTurnScreen(props) {
  const { playerSuit, computerSuit, gameResult } = props;
  const result = gameResult == "draw" ? "draw" : `you ${gameResult}`;
  return html`
    <div class="gamescreen ${gameResult != "" ? "gamescreen--computer__large" : "gamescreen--computer"}">
      <div class="choice choice--player ${gameResult}">
        <h2 class="choice__label">you picked</h2>
        ${html`<${Suit} suit="${playerSuit}" />`}
      </div>
      ${gameResult == ""
        ? ""
        : html` <div class="gamescreen__action">
            <h2 class="gamescreen__result">${result}</h2>
            <button class="gamescreen__button" onClick=${() => {props.resetGame()}}>
              Play again
            </button>
          </div>`}
      <div class="choice choice--computer ${gameResult}">
        <h2 class="choice__label">the house picked</h2>
        ${html`<${Suit} suit="${computerSuit}" />`}
      </div>
    </div>
  `;
}

function RulesModal(props) {
  const {active} = props;
  console.log('hello, this is modal', window.innerHeight, window.innerWidth)
  console.log('active', active);
  return html`
    <div class="modal ${active ? "modal--visible" : ""}">
      <div class="modal__content">
        <div class="modal__head">
          <h2 class="modal__heading">Rules</h2>
          <a  class="modal__closer" onClick=${props.clickHandler} style=${window.innerWidth > 550 ? 'display: block' : 'display: none'}>
            <img src="images/icon-close.svg"/>
          </a>
        </div>
        <div class="modal__body">
          <img src="./images/image-rules.svg"/>
        </div>
        <div class="modal__footer">
          <a  class="modal__closer" onClick=${props.clickHandler} style=${window.innerWidth < 550 ? 'display: block' : 'display: none'}>
            <img src="images/icon-close.svg"/>
          </a>
        </div>
      </div>
    </div>
  `
}

class App extends Component {
  constructor(props) {
    super(props);
    this.playerClickHandler.bind(this);
    this.resetGame.bind(this);
    this.modalTrigger.bind(this);

    this.state = {
      gametype: "simple",
      gameResult: "",
      score: 0,
      playerTurn: true,
      computerSuit: "",
      playerSuit: "",
      suits: ["paper", "scissors", "rock"],
      rulesModalActive: false
    };
    if(localStorage.getItem('score')) {
      this.state.score = parseInt(localStorage.getItem('score'));
    }
  }
  playerClickHandler = (value) => {
    this.setState({ playerTurn: false, playerSuit: value });
    // this.setState({score : this.state.score + 1});
    setTimeout(() => {
      this.computerTurn();
      console.log("timeout");
    }, 1000);
  };
  computerTurn = () => {
    const computerSuit = this.state.suits[Math.floor(Math.random() * 3)];
    this.setState({ computerSuit: computerSuit });
  };
  resetGame = () => {
    this.setState({
      playerTurn: true,
      playerSuit: "",
      computerSuit: "",
      gameResult: "",
    });
  };
  modalTrigger = () => {
    this.setState({rulesModalActive : !this.state.rulesModalActive})
  }

  componentDidUpdate(pP, pS, s) {
    const { playerSuit, computerSuit, gameResult } = this.state;
    if (playerSuit != "" && computerSuit != "" && gameResult == "") {
      setTimeout(() => {
        let gameResult = "draw";
        let res = this.gameEval(playerSuit, computerSuit);
        if (res == 1) gameResult = "WIN";
        if (res == -1) gameResult = "LOSE";

        this.setState({
          gameResult: gameResult,
          score: this.state.score + res,
        });
      }, 2000);
    }
  }
  gameEval = (ply, ai) => {
    const rules = {
      scissors: "paper",
      paper: "rock",
      rock: "scissors",
    };
    console.log(ply, ai);
    if (rules[ply] == ai) {
      return 1;
    }
    if (rules[ai] == ply) {
      return -1;
    }
    return 0;
  };
  gameSave = () => {
    let score = this.state.score;
    if(!localStorage.getItem('score')){
      localStorage.setItem('score', score);
      return
    }
    localStorage.setItem('score', score);
  }
  render() {
    return html`
      <div class="app">
        <div class="app__wrapper">
          <div class="info">
            <div class="info__suits">
              <img src="images/logo.svg"/>
            </div>
            <${Score} score="${this.state.score}" />
          </div>
          <div class="gamestage">
            ${this.state.playerTurn
              ? html`<${PlayerTurnScreen}
                  suits="${this.state.suits}"
                  clickhandler="${this.playerClickHandler}"
                />`
              : html`<${ComputerTurnScreen}
                  playerSuit="${this.state.playerSuit}"
                  computerSuit="${this.state.computerSuit}"
                  gameResult="${this.state.gameResult}"
                  resetGame="${this.resetGame}"
                />`}
          </div>
        </div>
        <div class="footer">
          <button class="footer__button  footer__button--save" onclick="${this.gameSave}">
            save
          </button>
          <button class="footer__button" onClick=${this.modalTrigger}>Rules</button>
        </div>
        <${RulesModal} active="${this.state.rulesModalActive}" clickHandler=${this.modalTrigger}/>
      </div>
    `;
  }
}

render(html`<${App} />`, document.body);
