// @flow

/**
 * Gamepage.
 * Static version of game, meant for players to use while in person
 */
import React from "react";
import type { Node } from "react";
import styled from "styled-components";

import Board from "components/Board";
import Universe from "components/Universe";
import Resources from "components/Cube/Resources";
import NavBar from "components/NavBar";
import ScratchPad from "components/ScratchPad";
import Variations from "components/Variations";
import UniverseSetup from "components/Universe/UniverseSetup";
import GoalArea from "components/GoalArea";
import Button from "muicss/lib/react/button";
import UniverseGrid from "components/Universe/UniverseGrid";
import AlertBar from "components/AlertBar";
import { rollCubes, shuffleCards } from "shared/game_setup_service";

import type { RouterHistory, Location, Match } from "react-router-dom";
type Props = { match: Match, location: Location, history: RouterHistory };
type State = GameStateOffline;

export default class Gamepage extends React.Component<Props, State> {
  state = {
    alert: undefined,
    cards: undefined,
    challenge: undefined,
    cubes: undefined,
    forbidden: [],
    goal: undefined,
    movingCube: undefined,
    permitted: [],
    required: [],
    stage: "new",
    stall: { began: 0 },
    turn: 0,
    variations: []
  };

  componentWillMount() {
    this.setState({ cubes: rollCubes(), stage: "universe" });
  }

  render() {
    return (
      <GameWrapper>
        <NavBar
          mode="game"
          history={this.props.history}
          stall={this.state.stall}
          resetStall={this.resetStall}
          setStall={this.setStall}
          turn={this.state.turn}
        />
        <AlertBar alert={this.state.alert} />
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
          <ScratchPad mode="game" challenge={this.state.challenge} />
          {this.renderBoard()}
          {this.renderVariations()}
        </BoardPrimitive>
      </GameWrapper>
    );
  }

  // ----- Render Control ------

  renderGoalArea = (): Node => {
    if (["goal", "ingame", "challenge", "reveal"].includes(this.state.stage)) {
      return (
        <GoalArea
          cubes={this.state.cubes}
          goal={this.state.goal}
          isDisabled={this.state.stage === "goal"}
          isOnline={false}
          markUsed={this.markUsed}
          movingCube={this.state.movingCube}
          setGoal={this.setGoal}
          setMovingCube={this.setMovingCube}
        />
      );
    } else {
      return null;
    }
  };

  renderBoard = (): Node => {
    if (["ingame", "challenge", "reveal"].includes(this.state.stage)) {
      return Board({
        game: this.state,
        movingCube: this.state.movingCube,
        moveCubeTo: this.moveCubeTo
      });
    }
  };

  renderVariations = (): Node => {
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

  markUsed = (cube: Cube): void => {
    if (!this.state.cubes) throw new Error("Internal Rep Error");
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

  setUniverse = (size: number) => {
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

  setVariation = (variation: string): void => {
    let variations = this.state.variations;
    if (!this.state.variations[0]) {
      variations[0] = variation;
    } else if (this.state.variations[1] == null) {
      variations[1] = variation;
    } else if (this.state.variations[2] == null) {
      variations[2] = variation;
      this.setState({ stage: "goal" });
    } else {
      return;
    }
    this.setState({ variations: variations });
  };

  endTurn = () => {
    this.setState({ turn: this.state.turn + 1 });
  };

  setGoal = (goal: Goal, value: number) => {
    this.setState({ goal: goal });
    this.setState({ stage: "ingame" });
    this.setState({ goal_value: value });
    this.endTurn();
  };

  setMovingCube = (cube?: Cube) => {
    if (!cube) this.setState({ movingCube: undefined });
    else this.setState({ movingCube: cube });
  };

  moveCubeTo = (category: BoardArea): void => {
    const movingCube = this.state.movingCube;
    if (movingCube) {
      let update = {};
      update[category] = this.state[category].concat([movingCube]);
      this.setState(update);
      this.setMovingCube();
      this.removeFromResources(movingCube);
    }
  };

  removeFromResources = (cube: Cube): void => {
    let cubes = this.state.cubes;
    if (!cubes || !this.state.cubes) return;
    let newResources = this.state.cubes[cube.type].filter(resource => {
      return resource.index !== cube.index;
    });
    cubes[cube.type] = (newResources: any);
    this.setState({ cubes: cubes });
    this.endTurn();
  };
}

const ResourcesWrapper = styled.div`
  width: 750px;
  height: 180px;
  margin-top: 70px;
`;
const GameWrapper = styled.div`
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
