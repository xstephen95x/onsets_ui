/**
 * Gamepage Bot
 * Bot games are only 2 player: 1 user and 1 bot
 * All state changes to the game should be methods in this file, which can be passed to children.
 * Lifecycle methods at the top, then render logic , then general methods.
 * FIXME: fix render/setState anti-patterns.
 * FIXME: Handle a forceout (moving last cube onto the board)
 */
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import firebase from "firebase";

import Board from "components/Board";
import Universe from "components/Universe";
import Resources from "components/Cube/Resources";
import NavBar from "components/NavBar";
import ScratchPad from "components/ScratchPad";
import Variations from "components/Variations";
import Loading from "components/Loading";
import UniverseSetup from "components/Universe/UniverseSetup";
import GoalArea from "components/GoalArea";
import SolutionView from "components/SolutionView";
import UniverseGrid from "components/Universe/UniverseGrid";
import AlertBar from "components/AlertBar";
import LogIn from "containers/LogIn";
import { rollCubes, shuffleCards } from "shared/game_setup_service";
import Invalid from "containers/NotFound/Invalid";
import Button from "muicss/lib/react/button";

const v4 = new RegExp(
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
);
const PlayerCount = 2;

export default class GamepageBot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      botId: null,
      auth: null,
      movingCube: null,
      alert: null,
      game: {
        stage: "universe", // new, universe, goal, ingame, challenge, archived
        stall: {
          staller: 0,
          began: 0
        },
        turn: 0,
        players: {
          0: {
            uid: null,
            name: null
          },
          1: null
        },
        playerCount: 0,
        permitted: [],
        required: [],
        forbidden: [],
        cards: [],
        universe: 0,
        cubes: {
          colors: [],
          operators: [],
          universe: [],
          numbers: []
        }
      }
    };
  }

  componentWillMount() {
    const botId = this.props.match.params.botId;
    firebase
      .database()
      .ref(`bots/${botId}`)
      .once("value", snapshot => {
        if (snapshot.exists()) {
          this.setState({ botId });
          this.attachGameListener();
          if (process.env.NODE_ENV === "test") {
            this.setState({ auth: true });
          } else {
            this.attachAuthListener();
          }
        } else {
          let isValidBotId = v4.test(botId);
          if (isValidBotId) {
            this.createBotGame(botId);
          } else {
            this.setState({ botId: "invalid" });
          }
        }
      });
  }

  componentWillUnmount() {
    this.detachGameListener();
  }

  render() {
    if (this.state.botId === "invalid") {
      return <Invalid history={this.props.history} />;
    } else if (this.state.auth) {
      return this.renderGameBoard();
    } else if (this.state.auth === null) {
      return <Loading />;
    } else {
      return <LogIn />;
    }
  }

  // ----- Render Control ------
  renderGameBoard = () => {
    let boardClass = "";
    if (this.state.alert) boardClass = "alert";
    if (this.state.game.challenge) boardClass = "alert";
    return (
      <GamePrimitive>
        <NavBar
          mode="online-game"
          history={this.props.history}
          getPlayerIndex={this.getPlayerIndex}
          stall={this.state.game.stall}
          resetStall={this.resetStall}
          setStall={this.setStall}
          turn={this.state.game.turn}
        />
        <AlertBar
          alert={this.state.alert}
          challenge={this.state.game.challenge}
          getPlayerIndex={this.getPlayerIndex}
          players={this.state.game.players}
          solutions={this.state.game.solutions}
        />
        {this.renderChallengeButtons()}
        <BoardPrimitive className={boardClass}>
          <ResourcesWrapper>
            {Resources({
              isDisabled: this.state.game.challenge ? true : false,
              setMovingCube: this.setMovingCube,
              movingCube: this.state.movingCube,
              turn: this.state.game.turn,
              cubes: this.state.game.cubes
            })}
            {this.renderGoalArea()}
          </ResourcesWrapper>
          {this.renderSolutions()}
          <ScratchPad
            getPlayerIndex={this.getPlayerIndex}
            mode="online-game"
            submitSolution={this.submitSolution}
            challenge={this.state.game.challenge}
            solutions={this.state.game.solutions}
          />
          {this.renderBoard()}
          {this.renderUniverse()}
        </BoardPrimitive>
      </GamePrimitive>
    );
  };
  renderChallengeButtons = () => {
    //TODO: don't display if last mover
    //TODO: add Forceout Button
    let myIndex = this.getPlayerIndex(firebase.auth().currentUser.uid);
    let lastMover = this.state.game.currentPlayer - 1;
    if (lastMover === -1) lastMover = 2;
    if (lastMover === myIndex) {
      return null;
    }
    if (this.state.game.stage === "ingame") {
      return (
        <ButtonsWrapper>
          <Button
            style={{
              position: "fixed",
              bottom: "80px",
              right: "20px",
              width: "100px"
            }}
            color="primary"
            variant="raised"
            onClick={() => this.setChallenge("now")}
          >
            Now
          </Button>
          <Button
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              width: "100px"
            }}
            color="danger "
            variant="raised"
            onClick={() => this.setChallenge("never")}
          >
            Never
          </Button>
        </ButtonsWrapper>
      );
    } else if (
      this.state.game.challenge &&
      this.state.game.challenge.isForceout &&
      this.state.game.stage !== "reveal"
    ) {
      return (
        <Button
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "100px"
          }}
          color="danger "
          variant="raised"
          onClick={() => this.setChallenge("never")}
        >
          Never
        </Button>
      );
    } else {
      return null;
    }
  };
  renderSolutions = () => {
    if (["reveal", "archived"].includes(this.state.game.stage)) {
      return (
        <SolutionView
          online={true}
          stage={this.state.game.stage}
          concedeSolution={this.concedeSolution}
          archiveGame={this.archiveGame}
          reviewSolution={this.reviewSolution}
          getPlayerIndex={this.getPlayerIndex}
          solutions={this.state.game.solutions}
          players={this.state.game.players}
          challenge={this.state.game.challenge}
          scores={this.state.game.scores}
        />
      );
    } else {
      return null;
    }
  };
  renderGoalArea = () => {
    if (
      ["goal", "ingame", "challenge", "archived"].includes(
        this.state.game.stage
      )
    ) {
      return (
        <GoalArea
          markUsed={this.markUsed}
          setMovingCube={this.setMovingCube}
          goalsetterUID={this.state.game.players[0].uid}
          isOnline={true}
          movingCube={this.state.movingCube}
          setGoal={this.setGoal}
          cubes={this.state.game.cubes}
          goal={this.state.game.goal}
        />
      );
    } else {
      return null;
    }
  };
  renderBoard = () => {
    if (["ingame", "challenge", "archived"].includes(this.state.game.stage)) {
      return (
        <Board
          game={this.state.game}
          movingCube={this.state.movingCube}
          moveCubeTo={this.moveCubeTo}
        />
      );
    }
  };
  renderUniverse = () => {
    if (this.state.game.stage === "universe") {
      if (this.state.game.players[1] === firebase.auth().currentUser.uid) {
        // if client is the 2nd player
        return <UniverseSetup setUniverse={this.setUniverse} />;
      } else {
        return null;
      }
    } else if (
      ["goal", "ingame", "challenge", "archived"].includes(
        this.state.game.stage
      )
    ) {
      return (
        <div>
          {Universe({ cards: this.state.game.cards })}
          <UniverseGrid cards={this.state.game.cards} />
        </div>
      );
    }
  };

  // --------- Methods -------------

  createBotGame = botId => {
    const path = `bots/${botId}`;
    firebase
      .database()
      .ref(path)
      .set({ stage: "new" })
      .then(() => {
        this.setUpGame().then(() => {
          this.updateGame("stage", "universe");
        });
      });
  };

  markUsed = cube => {
    let numbers = this.state.game.cubes.numbers;
    for (var i = 0; i < numbers.length; i++) {
      if (numbers[i].index === cube.index) {
        numbers[i].wasUsed = true;
      }
    }
    let game = this.state.game;
    game.cubes.numbers = numbers;
    this.setState({ game });
  };

  archiveGame = scores => {
    this.updateGame("stage", "archived");
    this.updateGame("scores", scores);
    this.updateGame("archived", true);
  };

  submitSolution = submission => {
    //Assume that only appropriate players can call this function once
    const myUID = firebase.auth().currentUser.uid;
    this.updateGame(`solutions/${myUID}`, submission);
  };

  getPlayerIndex = query => {
    //TODO: Updat with bot_first
    if (this.state.game.players) {
      for (var i = 0; i < this.state.game.players.length; i++) {
        let uid = this.state.game.players[i].uid;
        if (uid === query) {
          return i;
        }
      }
    }
    return false;
  };

  setChallenge = type => {
    // in a 2-player game, one player is current (mover) IFF the other player
    // is the last mover. Only the current player is allowed to call a
    // challenge, since challenges must be called on last movers

    let callerIndex = this.state.game.turn % PlayerCount;
    let botIsLastMover =
      (this.state.game.bot_first && callerIndex == 1) ||
      (!this.state.game.bot_first && callerIndex == 0);
    if (botIsLastMover) {
      this.updateGame("challenge", {
        began: new Date().getTime(),
        now: type === "now" || type === "forceout",
        forceout: type === "forceout",
        caller_uid: firebase.auth().currentUser.uid
      });
      this.updateGame("stage", "challenge");
    } else {
      this.setAlert("You can not call a challenge.");
    }
  };

  setGoal = (goal, value) => {
    if (this.state.game.players[0].uid == firebase.auth().currentUser.uid) {
      this.updateGame("goal", goal).then(() => {
        this.updateGame("stage", "ingame");
        this.endTurn();
      });
      this.updateGame("goal_value", value);
    } else {
      this.setAlert("Only Player 1 can set the goal.");
    }
  };

  setUniverse = size => {
    this.updateGame("universe", size);
    this.updateGame("cards", shuffleCards(size));
    this.updateGame("stage", "goal");
  };

  detachGameListener = () => {
    firebase
      .database()
      .ref()
      .off();
  };

  attachGameListener = () => {
    firebase
      .database()
      .ref(`bots/${this.props.match.params.botId}`)
      .on("value", snapshot => {
        let value = snapshot.val();
        if (value) {
          if (snapshot.val().stage === "new") {
            this.setUpGame().then(() => {
              this.updateGame("stage", "universe");
            });
          } else {
            this.setState({ game: value });
          }
        }
      });
  };

  attachAuthListener = () => {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ auth: Boolean(user) });
    });
  };

  resetStall = () => {
    this.updateGame("stall/began", 0);
  };

  setStall = () => {
    if (this.state.game.stall.began === 0) {
      const timestamp = new Date().getTime();
      this.updateGame("stall/began", timestamp);
      let stalled_i = this.getPlayerIndex(firebase.auth().currentUser.uid) - 1;
      if (stalled_i === -1) stalled_i = 2; //modulo wrap
      this.updateGame("stall/stalled_index", stalled_i);
    }
  };

  setAlert = alert => {
    this.setState({ alert: alert });
    setTimeout(() => {
      this.setState({ alert: null });
    }, 5000);
  };

  setUpGame = () => {
    let gamePlayers = {};
    let a, b;
    // ~ 50/50 chance of who goes first

    //TODO: set a random state variable
    if (Math.round(Math.random)) {
      a = 1;
      b = 0;
    } else {
      a = 0;
      b = 1;
    }
    gamePlayers[a] = {
      name: firebase.auth().currentUser.displayName,
      uid: firebase.auth().currentUser.uid
    };
    gamePlayers[b] = {
      name: "SuperBot",
      uid: this.props.match.params.botId
    };

    // if b == 1 => bot is player 2
    let bot_first = b ? false : true;

    return new Promise((resolve, reject) => {
      firebase
        .database()
        .ref(`bots/${this.props.match.params.botId}`)
        .transaction(
          data => {
            let blankGame = {
              turn: 0,
              stall: {
                began: 0
              },
              players: gamePlayers,
              bot_first: bot_first,
              uuid: this.props.match.params.botId,
              playerCount: 2,
              movingCube: 0,
              stage: "universe",
              cards: [],
              universe: 0,
              cubes: rollCubes()
            };
            return blankGame;
          },
          () => {
            resolve(true);
          }
        );
    });
  };

  endTurn = () => {
    console.log("=> TURN:", this.state.game.turn, this.state.game.turn + 1);
    this.updateGame("turn", this.state.game.turn + 1);
  };

  setMovingCube = cube => {
    this.setState({ movingCube: cube });
  };

  updateGame = (path, value) => {
    return new Promise((resolve, reject) => {
      firebase
        .database()
        .ref(`bots/${this.state.botId}/${path}`)
        .transaction(
          data => {
            return value;
          },
          () => {
            resolve(true);
          }
        );
    });
  };

  moveCubeTo = area => {
    //area = 'permitted' | 'forbidden' | 'required'.
    const movingCube = this.state.movingCube;
    let currentPlayerIndex = this.state.game.turn % 2;
    let currentPlayerUID = this.state.game.players[currentPlayerIndex].uid;

    if (movingCube) {
      if (currentPlayerUID === firebase.auth().currentUser.uid) {
        const res = this.state.game.cubes; //resources
        const all = [].concat(res.operators, res.colors, res.universe);

        // Filter out undefined cubes. Why?
        const size = all.filter(function(value) {
          return value !== undefined;
        }).length;

        // Handle a forceout
        if (size === 1) {
          //FIXME: Shouldn't this be 2? Check forceout rules
          if (area === "permitted" || area === "required") {
            this.setChallenge("forceout");
          } else {
            this.setAlert("Last cube cannot be moved to Forbidden.");
            return; //don't move it
          }
        }

        //TODO: Make this.path
        firebase
          .database()
          .ref(`bots/${this.state.botId}/${area}`)
          .transaction(data => {
            if (this.state.game[area]) {
              return this.state.game[area].concat([movingCube]);
            } else {
              return [movingCube];
            }
          });
        this.removeFromResources(movingCube);
        this.recordMove(movingCube, area);
        this.setMovingCube(null);
      } else {
        this.setAlert("It is not your turn to move.");
      }
    }
  };

  recordMove(cube, area) {
    firebase
      .database()
      .ref(`bots/${this.state.game.uuid}/log`)
      .transaction(data => {
        if (!data) data = [];
        data.push({
          area,
          cube
        });
        return data;
      });
  }

  removeFromResources = cube => {
    let cubes = this.state.game.cubes;
    let newResources = this.state.game.cubes[cube.type].filter(resource => {
      return resource.index !== cube.index;
    });
    cubes[cube.type] = newResources;
    this.updateGame("cubes", cubes).then(() => {
      this.endTurn();
    });
  };
}

// Styled Components
const ResourcesWrapper = styled.div`
  width: 750px;
  height: 180px;
  margin-top: 60px;
`;
const GamePrimitive = styled.div`
  padding-bottom: 80px;
`;
const BoardPrimitive = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  max-width: calc(768px + 16px * 2);
  padding: 0 16px;
  transition: all 100ms ease-in-out;
  &.alert {
    margin-top: 50px;
  }
`;

export const Pregame = styled.div`
  background: rgba(0, 0, 0, 0.3);
  position: fixed;
  width: 100%;
  height: 100%;
  text-align: center;
`;
const PregameInner = styled.div`
  margin: 0 auto;
  margin-top: 300px;
  color: black;
  font-size: 50px;
`;
export const ButtonsWrapper = styled.div``;
