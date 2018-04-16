// @flow
/**
 * Gamepage.
 * Static version of game, meant for players to use while in person
 */
import React from "react";
import styled from "styled-components";

import Board from "components/Board";
import Universe from "components/Universe";
import Resources from "components/Cube/Resources";
import NavBar from "components/NavBar";
import ScratchPad from "components/ScratchPad";
import Variations from "components/Variations";
import UniverseSetup from "components/Universe/UniverseSetup";
import GoalArea from "components/GoalArea";
import SolutionView from "components/SolutionView";
import Button from "muicss/lib/react/button";
import UniverseGrid from "components/Universe/UniverseGrid";
import AlertBar from "components/AlertBar";
import { rollCubes, shuffleCards } from "shared/game_setup_service";

export default class Gamepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alert: null,
      challenge: null,
      solutions: null,
      auth: null,
      movingCube: null,
      stage: "universe", // new , universe, variations, goal, ingame, challenge, reveal
      stall: {
        staller: 0,
        began: 0
      },
      turn: 0,
      variations: {
        0: null,
        1: null,
        2: null
      },
      players: {
        0: null,
        1: null,
        2: null
      },
      playerCount: 0,
      currentPlayer: null,
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
    };
  }

  componentWillMount() {
    this.setState({ cubes: rollCubes() });
  }

  render() {
    return this.renderGameBoard();
  }

  // ----- Render Control ------
  renderGameBoard = () => {
    return (
      <GamePrimitive>
        <NavBar
          mode="game"
          history={this.props.history}
          getPlayerIndex={this.getPlayerIndex}
          stall={this.state.stall}
          resetStall={this.resetStall}
          setStall={this.setStall}
          turn={this.state.turn}
        />
        <AlertBar alert={this.state.alert} />
        {this.renderChallengeButtons()}
        <BoardPrimitive className={this.state.alert ? "alert" : ""}>
          <ResourcesWrapper>
            {Resources({
              isDisabled: this.state.challenge ? true : false,
              setMovingCube: this.setMovingCube,
              movingCube: this.state.movingCube,
              turn: this.state.turn,
              cubes: this.state.cubes
            })}
            {this.renderGoalArea()}
          </ResourcesWrapper>
          {this.renderSolutions()}
          <ScratchPad
            mode="game"
            submitSolution={this.submitSolution}
            challenge={this.state.challenge}
          />
          {this.renderBoard()}
          {this.renderVariations()}
        </BoardPrimitive>
      </GamePrimitive>
    );
  };

  renderChallengeButtons = () => {
    if (this.state.stage === "ingame") {
      return (
        <div>
          <Button
            style={{
              position: "fixed",
              bottom: "80px",
              right: "20px",
              width: "100px"
            }}
            color="primary"
            variant="raised"
            onClick={this.challengeNow}>
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
            onClick={this.challengeNow}>
            Never
          </Button>
        </div>
      );
    } else {
      return null;
    }
  };
  renderSolutions = () => {
    if (this.state.stage === "reveal") {
      return (
        <SolutionView
          online={true}
          solutions={this.state.solutions}
          players={this.state.players}
          challenge={this.state.challenge}
        />
      );
    } else {
      return null;
    }
  };
  renderGoalArea = () => {
    if (["goal", "ingame", "challenge", "reveal"].includes(this.state.stage)) {
      return (
        <GoalArea
          markUsed={this.markUsed}
          isOnline={false}
          isDisabled={this.state.stage === "goal"}
          setMovingCube={this.setMovingCube}
          movingCube={this.state.movingCube}
          setGoal={this.setGoal}
          cubes={this.state.cubes}
          goal={this.state.goal}
        />
      );
    } else {
      return null;
    }
  };
  renderBoard = () => {
    if (["ingame", "challenge", "reveal"].includes(this.state.stage)) {
      return Board({
        game: this.state,
        movingCube: this.state.movingCube,
        moveCubeTo: this.moveCubeTo
      });
    }
  };
  renderVariations = () => {
    if (this.state.stage === "universe") {
      return <UniverseSetup setUniverse={this.setUniverse} />;
    } else if (["goal", "ingame", "challenge", "reveal"].includes(this.state.stage)) {
      return (
        <div>
          {Universe({ cards: this.state.cards })}
          <UniverseGrid cards={this.state.cards} />
          <Variations setVariation={this.setVariation} variations={this.state.variations} />
        </div>
      );
    } else if (this.state.stage === "variations") {
      return (
        <div>
          <Variations setVariation={this.setVariation} variations={this.state.variations} />
          {Universe({ cards: this.state.cards })}
          <UniverseGrid cards={this.state.cards} />
        </div>
      );
    }
  };

  // --------- Methods -------------

  markUsed = cube => {
    let numbers = this.state.cubes.numbers;
    for (var i = 0; i < numbers.length; i++) {
      if (numbers[i].index === cube.index) {
        numbers[i].wasUsed = true;
      }
    }
    let cubes = this.state.cubes;
    cubes.numbers = numbers;
    this.setState({ cubes });
  };

  submitSolution = submission => {
    this.setState({ solutions: submission });
    this.setState({ stage: "reveal" });
  };

  challengeNow = () => {
    this.setState({
      challenge: {
        began: new Date().getTime(),
        now: true
      }
    });
  };

  challengeNever = () => {
    this.setState({
      challenge: {
        began: new Date().getTime(),
        now: false
      }
    });
  };

  setUniverse = size => {
    this.setState({ universe: size });
    this.setState({ cards: shuffleCards(size) });
    this.setState({ stage: "variations" });
  };

  resetStall = () => {
    this.setState({ stall: { began: 0 } });
  };

  setStall = () => {
    if (this.state.stall.began === 0) {
      let stall = {
        began: new Date().getTime()
      };
      this.setState({ stall: stall });
    }
  };

  setVariation = variation => {
    let variations = this.state.variations;
    if (this.state.variations[0] == null) {
      variations[0] = variation;
    } else if (this.state.variations[1] == null) {
      variations[1] = variation;
    } else if (this.state.variations[2] == null) {
      variations[2] = variation;
      this.setState({ stage: "goal" });
    } else {
      return;
    }
    this.setState((variations: variations));
  };

  endTurn = () => {
    this.setState({ turn: this.state.turn + 1 });
  };

  setGoal = (goal, value) => {
    this.setState({ goal: goal });
    this.setState({ stage: "ingame" });
    this.setState({ goal_value: value });
    this.endTurn();
  };

  setMovingCube = cube => {
    if (!cube) {
      this.setState({ movingCube: null });
    } else {
      this.setState({ movingCube: cube });
    }
  };

  moveCubeTo = category => {
    const movingCube = this.state.movingCube;
    if (movingCube) {
      let update = {};
      update[category] = this.state[category].concat([movingCube]);
      this.setState(update);
      this.setMovingCube(null);
      this.removeFromResources(movingCube);
    }
  };

  removeFromResources = cube => {
    let cubes = this.state.cubes;
    let newResources = this.state.cubes[cube.type].filter(resource => {
      return resource.index !== cube.index;
    });
    cubes[cube.type] = newResources;
    this.setState({ cubes: cubes });
    this.endTurn();
  };
}

const ResourcesWrapper = styled.div`
  width: 750px;
  height: 180px;
  margin-top: 70px;
`;
const GamePrimitive = styled.div`
  padding-bottom: 80px;
`;
const BoardPrimitive = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 800px;
  padding: 0 16px;
`;
