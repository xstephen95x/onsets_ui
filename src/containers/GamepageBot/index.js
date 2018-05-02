// @flow

/**
 * Gamepage Bot
 * Bot games are only 2 player: 1 user and 1 bot
 * All state changes to the game should be methods in this file, which can be passed to children.
 * Lifecycle methods at the top, then render logic , then general methods.
 * this.state.game is an object of type GameState which is assumed to be synced
 * in realtime with the firebase database.
 * FIXME: fix render/setState anti-patterns.
 * FIXME: Handle a forceout (moving last cube onto the board)
 * TODO: on challenge never, let the player submit an answer
 *
 * Written by Stephen L. White
 */
import React from "react";
import type { Node } from "react";
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

import type { RouterHistory, Location, Match } from "react-router-dom";
type Props = { match: Match, location: Location, history: RouterHistory };

const v4 = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
const PlayerCount = 2;
const AlertTimeout = 5000; //ms

type State = {
  botId: ?string,
  auth: ?boolean,
  movingCube: ?Cube,
  alert: ?string,
  game: ?GameState
};

export default class GamepageBot extends React.Component<Props, State> {
  state = {
    alert: undefined,
    auth: undefined,
    botId: undefined,
    game: undefined,
    movingCube: undefined
  };

  componentWillMount() {
    const botId = String(this.props.match.params.botId);
    if (!botId) return;
    firebase
      .database()
      .ref(`bots/${botId}`)
      .once("value", snapshot => {
        if (process.env.NODE_ENV === "test") {
          this.setState({ auth: true });
        } else {
          this.attachAuthListener();
        }
        this.setState({ botId });
        if (snapshot.exists()) {
          this.attachGameListener();
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
      return (
        <div>
          <NavBar mode="home" />
          <LogIn />
        </div>
      );
    }
  }

  // ----- Render Control ------
  renderGameBoard = (): Node => {
    let boardClass = "";
    if (this.state.alert) boardClass = "alert";
    if (this.state.game && this.state.game.challenge) boardClass = "alert";
    if (!this.state.game) return null;
    return (
      <GamePrimitive>
        <NavBar
          mode="online-game"
          history={this.props.history}
          getPlayerIndex={this.getPlayerIndex}
          stall={this.state.game && this.state.game.stall}
          resetStall={this.resetStall}
          setStall={this.setStall}
          turn={this.state.game && this.state.game.turn}
        />
        <AlertBar
          alert={this.state.alert}
          challenge={this.state.game && this.state.game.challenge}
          getPlayerIndex={this.getPlayerIndex}
          players={this.state.game.players}
          solutions={this.state.game.solutions}
        />
        {this.renderChallengeButtons()}
        <BoardPrimitive className={boardClass}>
          <ResourcesWrapper>
            {this.state.game &&
              Resources({
                isDisabled: this.state.game.challenge ? true : false,
                setMovingCube: this.setMovingCube,
                movingCube: this.state.movingCube,
                turn: this.state.game.turn,
                cubes: this.state.game.cubes
              })}
            {this.renderGoalArea()}
          </ResourcesWrapper>
          {this.renderSolutions()}
          {this.state.game && (
            <ScratchPad
              getPlayerIndex={this.getPlayerIndex}
              mode="online-game"
              submitSolution={this.submitSolution}
              challenge={this.state.game.challenge}
              solutions={this.state.game.solutions}
            />
          )}
          {this.renderBoard()}
          {this.renderUniverse()}
        </BoardPrimitive>
      </GamePrimitive>
    );
  };

  renderChallengeButtons = (): Node => {
    //TODO: don't display if last mover
    //TODO: add Forceout Button
    if (!this.state.game) return;
    let lastMover = this.state.game.turn % PlayerCount - 1;
    let myIndex = this.getPlayerIndex(firebase.auth().currentUser.uid);
    if (lastMover === -1) lastMover = PlayerCount - 1;
    if (lastMover === myIndex) return;
    if (this.state.game && this.state.game.stage === "ingame") {
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
            onClick={() => this.setChallenge("now")}>
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
            onClick={() => this.setChallenge("never")}>
            Never
          </Button>
        </ButtonsWrapper>
      );
    } else if (
      this.state.game &&
      this.state.game.challenge &&
      this.state.game.challenge.forceout &&
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
          onClick={() => this.setChallenge("never")}>
          Never
        </Button>
      );
    } else {
      return null;
    }
  };

  renderSolutions = (): Node => {
    if (!this.state.game) return null;
    if (!["reveal", "archived"].includes(this.state.game.stage)) return null;
    if (!this.state.game || !this.state.game.solutions || !this.state.game.challenge) return null;

    //NOTE: will not render solutions without scores
    return (
      <SolutionView
        online={true}
        stage={this.state.game.stage}
        solutions={this.state.game.solutions}
        getPlayerIndex={this.getPlayerIndex}
        players={this.state.game.players}
        challenge={this.state.game.challenge}
        scores={this.state.game.scores}
      />
    );
  };
  renderGoalArea = () => {
    if (!this.state.game) return;
    if (["goal", "ingame", "challenge", "archived"].includes(this.state.game.stage)) {
      return (
        <GoalArea
          markUsed={this.markUsed}
          setMovingCube={this.setMovingCube}
          goalsetterUID={this.state.game && this.state.game.players[0].uid}
          isOnline={true}
          movingCube={this.state.movingCube}
          setGoal={this.setGoal}
          cubes={this.state.game && this.state.game.cubes}
          goal={this.state.game && this.state.game.goal}
        />
      );
    } else {
      return null;
    }
  };

  renderBoard = (): Node => {
    if (!this.state.game) return;
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

  renderUniverse = (): Node => {
    if (this.state.game && this.state.game.stage === "universe") {
      let isSecondPlayer = this.state.game.players[1].uid === firebase.auth().currentUser.uid;
      if (isSecondPlayer) return <UniverseSetup setUniverse={this.setUniverse} />;
      else return null;
    } else if (
      this.state.game &&
      ["goal", "ingame", "challenge", "archived"].includes(this.state.game.stage)
    ) {
      return (
        <div>
          {Universe({ cards: this.state.game.cards })}
          <UniverseGrid cards={this.state.game && this.state.game.cards} />
        </div>
      );
    }
  };

  // --------- Methods -------------

  createBotGame = (botId: string): Promise<void> => {
    const path = `bots/${botId}`;
    return firebase
      .database()
      .ref(path)
      .set({ stage: "new" })
      .then(() => {
        this.attachGameListener();
        this.setUpGame().then(() => {
          this.updateGame("stage", "universe");
        });
      });
  };

  markUsed = (cube: Cube) => {
    if (!this.state.game || !this.state.game.cubes) return;
    let numbers = this.state.game.cubes.numbers;
    numbers.filter;
    for (var i = 0; i < numbers.length; i++) {
      if (numbers[i].index === cube.index) {
        numbers[i].wasUsed = true;
        break;
      }
    }
    let game = this.state.game;
    if (!game.cubes) throw new Error("Internal Rep Error: Must have cubes");
    game.cubes.numbers = numbers;
    this.setState({ game });
  };

  submitSolution = (submission: SolutionSubmission): void => {
    //Assume that only appropriate players can call this function once
    const myUID = firebase.auth().currentUser.uid;
    this.updateGame(`solutions/${myUID}`, submission);
  };

  getPlayerIndex = (query: string): number => {
    if (this.state.game && this.state.game.players) {
      for (let i = 0; i < PlayerCount; i++) {
        if (this.state.game.players[i].uid === query) return i;
      }
    }
    throw new Error("Internal Rep Error: Player not found.");
  };

  setChallenge = (type: "now" | "never" | "forceout"): void => {
    // in a 2-player game, one player is current (mover) IFF the other player
    // is the last mover. Only the current player is allowed to call a
    // challenge, since challenges must be called on last movers
    if (!this.state.game) return;
    let callerIndex = this.state.game.turn % PlayerCount;
    let botIsLastMover =
      (this.state.game.bot_first && callerIndex === 1) ||
      (!this.state.game.bot_first && callerIndex === 0);
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

  setGoal = (goal: Goal, value: number): void => {
    let playerOne = firebase.auth().currentUser.uid;
    if (this.state.game && this.state.game.players[0]) {
      if (this.state.game.players[0].uid === playerOne) {
        this.updateGame("goal", goal).then(() => {
          this.updateGame("stage", "ingame");
          this.endTurn();
        });
        this.updateGame("goal_value", value);
      } else {
        this.setAlert("Only Player 1 can set the goal.");
      }
    }
  };

  setUniverse = (size: number): void => {
    this.updateGame("universe", size);
    this.updateGame("cards", shuffleCards(size));
    this.updateGame("stage", "goal");
  };

  detachGameListener = (): void => {
    firebase
      .database()
      .ref()
      .off();
  };

  attachGameListener = (): void => {
    if (!this.props.match.params.botId) return;
    let gamePath = `bots/${this.props.match.params.botId}`;
    firebase
      .database()
      .ref(gamePath)
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

  attachAuthListener = (): void => {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ auth: Boolean(user) });
    });
  };

  resetStall = (): void => {
    this.updateGame("stall/began", 0);
  };

  setStall = (): void => {
    if (!this.state.game || !this.state.game.stall || this.state.game.stall.began !== 0) return;
    let current_index = this.getPlayerIndex(firebase.auth().currentUser.uid);
    let stalled_index = current_index - 1;
    if (stalled_index === -1) stalled_index = PlayerCount - 1; //modulo wrap
    this.updateGame("stall", {
      began: new Date().getTime(),
      stalled_index
    });
  };

  setAlert = (alert: string): void => {
    this.setState({ alert: alert });
    setTimeout(() => {
      this.setState({ alert: null });
    }, AlertTimeout);
  };

  setUpGame = (): TransactionReceipt => {
    let players = {};
    // ~ 50/50 chance of who goes first
    let a, b;
    if (Math.round(Math.random())) (a = 1), (b = 0);
    else (a = 0), (b = 1);
    let bot_first = b ? false : true;

    players[a] = {
      name: firebase.auth().currentUser.displayName,
      uid: firebase.auth().currentUser.uid
    };
    players[b] = {
      name: "The Thinker",
      uid: this.props.match.params.botId
    };

    return firebase
      .database()
      .ref(`bots/${String(this.props.match.params.botId)}`)
      .transaction(data => {
        let blankGame = {
          turn: 0,
          stall: { began: 0 },
          players: players,
          bot_first: bot_first,
          uuid: this.props.match.params.botId,
          playerCount: 2,
          movingCube: 0,
          stage: "universe",
          cubes: rollCubes()
        };
        return blankGame;
      });
  };

  endTurn = () => {
    if (!this.state.game) return;
    this.updateGame("turn", this.state.game.turn + 1);
  };

  setMovingCube = (cube: ?Cube) => {
    this.setState({ movingCube: cube });
  };

  updateGame = (relPath: string, value: any): TransactionReceipt => {
    if (!this.state.botId) throw new Error("Internal Rep Error");
    let fullPath = `bots/${this.state.botId}/${relPath}`;
    return firebase
      .database()
      .ref(fullPath)
      .transaction(data => {
        return value;
      });
  };

  moveCubeTo = (area: "permitted" | "forbidden" | "required"): void => {
    if (!this.state.game) return;
    const movingCube = this.state.movingCube;
    let currentPlayerIndex = this.state.game.turn % 2;
    let currentPlayerUID = this.state.game.players[currentPlayerIndex].uid;

    if (movingCube) {
      if (currentPlayerUID === firebase.auth().currentUser.uid) {
        if (!this.state.game || !this.state.game.cubes) return;
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

        firebase
          .database()
          .ref(`bots/${String(this.state.botId)}/${area}`)
          .transaction(data => {
            if (this.state.game && this.state.game[area]) {
              return this.state.game[area].concat([movingCube]);
            } else {
              return [movingCube];
            }
          });
        this.removeFromResources(movingCube).then(() => {
          this.endTurn();
        });
        this.setMovingCube();
        this.recordMove(movingCube, area);
      } else {
        this.setAlert("It is not your turn to move.");
      }
    }
  };

  recordMove(cube: Cube, area: "permitted" | "forbidden" | "required"): TransactionReceipt {
    let uuid = this.state.game && this.state.game.uuid;
    if (!uuid) throw new Error("Internal Rep Error:");
    return firebase
      .database()
      .ref(`bots/${uuid}/log`)
      .transaction(data => {
        if (!data) data = [];
        data.push({
          area,
          cube
        });
        return data;
      });
  }

  removeFromResources = (cube: Cube): TransactionReceipt => {
    if (!this.state.game || !this.state.game.cubes) throw new Error("Internal Rep Error");
    let cubes = this.state.game.cubes;
    let newResources = this.state.game.cubes[cube.type].filter(resource => {
      return resource.index !== cube.index;
    });
    cubes[cube.type] = (newResources: any);
    return this.updateGame("cubes", cubes);
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
