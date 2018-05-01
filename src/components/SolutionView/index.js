// @flow

/**
 * Solution View
 * Displays solutions from other players
 * provides a place for disputing solutions
 */
import React from "react";
import type { Node } from "react";
import firebase from "firebase";
import styled from "styled-components";
import Button from "muicss/lib/react/button";
import ArchiveOverlay from "./ArchiveOverlay";

type State = {
  solverUid1: string,
  solverUid2?: string,
  solverIndex1: number,
  solverIndex2?: number,
  submission1: SolutionSubmission,
  submission2?: SolutionSubmission
};

type Props = {
  online: boolean,
  stage: string,
  getPlayerIndex: string => number,
  solutions: SolutionStrings,
  players: Array<Player>,
  challenge: Challenge,
  scores?: Scores
};

export default class SolutionView extends React.Component<Props, State> {
  componentWillMount() {
    this.determineSolvers();
  }

  render() {
    if (this.props.online) {
      return <SolutionPrimitive>{this.renderSolutions()}</SolutionPrimitive>;
    } else {
      return null;
    }
  }

  renderArchivedOverlay = () => {
    return (
      <ArchiveOverlay
        players={this.props.players}
        getPlayerIndex={this.props.getPlayerIndex}
        challenge={this.props.challenge}
        solutions={this.props.solutions}
        scores={this.props.scores}
      />
    );
  };

  renderSolutions = (): Node => {
    let forceout = this.props.challenge.forceout;
    return (
      <div>
        {this.renderSolution("1")}
        {this.renderSolution("2")}
      </div>
    );
  };

  renderSolution = (i: string): Node => {
    let solverUid = "solverUid" + i;
    let solverIndex = "solverIndex" + i;
    let submission = "submission" + i;
    let restriction = "null";
    let score = "";
    if (this.props.scores && this.props.scores[this.state[solverUid]] !== null) {
      score = this.props.scores[this.state[solverUid]];
    }
    if (this.state[submission]) {
      if (this.state[submission].restriction) {
        restriction = this.state[submission].restriction;
      }
    } else {
      restriction = "";
    }
    console.log(this.props.scores);
    return (
      <Row>
        <TopRow>
          • Player {i} {" : "}
          {this.props.players[this.state[solverIndex]].name}
          <ScoreBox>{score}</ScoreBox>
          <SolutionBox>
            {restriction}
            <Label>Restriction</Label>
          </SolutionBox>
          <SolutionBox>
            {this.state[submission] && this.state[submission].solution}
            <Label>Solution</Label>
          </SolutionBox>
        </TopRow>
      </Row>
    );
  };

  determineSolvers = () => {
    //NOTE: can be 2 solvers during forceout
    let challengerIndex = this.props.getPlayerIndex(this.props.challenge.caller_uid);
    let opponentIndex = challengerIndex ? 0 : 1;

    let solverIndex1 = this.props.challenge.now ? challengerIndex : opponentIndex;
    let solverUid1 = this.props.players[solverIndex1].uid;
    let submission1 = this.props.solutions[solverUid1];
    this.setState({ solverUid1, solverIndex1, submission1 });

    let solverIndex2 = this.props.challenge.now ? opponentIndex : challengerIndex;
    let solverUid2 = this.props.players[solverIndex2].uid;
    this.setState({ solverUid2, solverIndex2 });

    if (this.props.challenge.forceout) {
      let submission2 = this.props.solutions[solverUid2];
      this.setState({ submission2 });
    }
  };
}

const Row = styled.div`
  padding-left: 10px;
  line-height: 55px;
  width: 100%;
  min-height: 50px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  transition: all 100ms ease-in-out;
  background: #f9f9f9;
  &:hover {
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.15);
    background: #ffffff;
  }
`;
const Label = styled.div`
  font-size: 10px;
`;
const TopRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;
const SolutionBox = styled.div`
  border-bottom: 1px dashed black;
  text-align: center;
  height: 30px;
  font-size: 25px;
  align-self: center;
  line-height: 25px;
  margin: 0 auto;
  min-width: 150px;
`;
const DecisionPrimitive = styled.div`
  line-height: 30px;
  padding: 10px;
  margin-bottom: 10px;
  width: 100%;
  height: 50px;
  &:hover {
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.15);
  }
  &.accepted {
    background-color: rgba(0, 100, 250, 0.5);
  }
  &.rejected {
    background-color: rgba(200, 0, 0, 0.5);
  }
`;
const ButtonWrapper = styled.div`
  width: 300px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
const SolutionPrimitive = styled.div`
  padding: 10px;
  background-color: #f9f9f9;
  box-shadow: 3px 3px 25px 2px rgba(0, 0, 0, 0.61);
  width: 750px;
  margin-bottom: 25px;
`;
const ScoreBox = styled.div`
  color: red;
  width: 20px;
  margin: 0 auto;
  font-size: 26px;
`;
