/**
 * Solution View
 * Displays solutions from other players
 * provides a place for disputing solutions
 */
import React from "react";
import firebase from "firebase";
import styled from "styled-components";
import Button from "muicss/lib/react/button";
import ArchiveOverlay from "./ArchiveOverlay";

export default class SolutionView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      solver1: null,
      solver2: null,
      solver3: null
    };
  }

  componentWillMount() {
    this.determineSolvers();
  }

  render() {
    let isArchived = this.props.stage === "archived";
    if (!isArchived) {
      this.checkForEndOfGame();
    }
    if (this.props.online) {
      return (
        <SolutionPrimitive>
          {isArchived && this.renderArchivedOverlay()}
          {this.renderVerdicts("rejected")}
          {this.renderVerdicts("accepted")}
          {this.renderSolutions()}
        </SolutionPrimitive>
      );
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
  renderSolutions = () => {
    let isForceout = this.props.challenge.isForceout;
    return (
      <div>
        {this.renderSolution("1")}
        {isForceout && this.renderSolution("2")}
      </div>
    );
  };

  renderSolution = number => {
    let solver = "solver" + number;
    let solverIndex = "solverIndex" + number;
    let submission = "submission" + number;
    let restriction = "null";
    if (this.state[submission].restriction) {
      restriction = this.state[submission].restriction;
    }
    if (this.state[solver] !== firebase.auth().currentUser.uid) {
      if (this.state[submission].declined) {
        return <Row>• Player {number} did not solve.</Row>;
      }
      return (
        <Row>
          <TopRow>
            • Player {number} {" : "}
            {this.props.players[this.state[solverIndex]].name}
            <SolutionBox>
              {restriction}
              <Label>Restriction</Label>
            </SolutionBox>
            <SolutionBox>
              {this.state[submission].solution}
              <Label>Solution</Label>
            </SolutionBox>
          </TopRow>
          {this.renderButtons(this.state[solver])}
        </Row>
      );
    } else {
      //Don't render your own solution to this component.
      return null;
    }
  };

  checkForEndOfGame = () => {
    // 1. if all solutions are accepted OR
    // 2. rejected / conceded OR
    // 3. over_ruled by judge OR
    // 4. declined.
    let finishedCount = 0;
    for (let solverUID in this.props.solutions) {
      if (this.props.solutions.hasOwnProperty(solverUID)) {
        let solution = this.props.solutions[solverUID];
        let isAccepted = false;
        if (solution.accepted) {
          isAccepted = solution.accepted.length === 2;
        }
        if (solution.declined || solution.conceded || solution.over_ruled || isAccepted) {
          finishedCount++;
        }
      }
    }
    let solverCount = 2;
    if (this.props.challenge.isForceout) solverCount = 3;
    if (finishedCount === solverCount) {
      console.log("Game should now archive");
      this.props.archiveGame(this.scoreGame());
    }
  };

  determineSolvers = () => {
    // solver1 HAS TO write a solution, solver2 has the option
    // Last mover and other player can also write during forceout.
    let solver1;
    let solver2 = this.props.challenge.optional_solver_uid;
    if (this.props.challenge.now) {
      solver1 = this.props.challenge.caller_uid;
    } else {
      solver1 = this.props.challenge.last_mover_uid;
    }
    if (this.props.challenge.isForceout) {
      let solver3 = this.props.challenge.last_mover_uid;
      this.setState({
        solver1: solver1,
        solver2: solver2,
        solver3: solver3,
        solverIndex1: this.props.getPlayerIndex(solver1),
        solverIndex2: this.props.getPlayerIndex(solver2),
        solverIndex3: this.props.getPlayerIndex(solver3),
        submission1: this.props.solutions[solver1],
        submission2: this.props.solutions[solver2],
        submission3: this.props.solutions[solver3]
      });
    } else {
      this.setState({
        solver1: solver1,
        solver2: solver2,
        solverIndex1: this.props.getPlayerIndex(solver1),
        solverIndex2: this.props.getPlayerIndex(solver2),
        submission1: this.props.solutions[solver1],
        submission2: this.props.solutions[solver2],
        isForceout: this.props.challenge.isForceout
      });
    }
  };

  renderButtons = solver_uid => {
    let myUID = firebase.auth().currentUser.uid;
    let accepters = this.props.solutions[solver_uid].accepted;
    let rejecters = this.props.solutions[solver_uid].rejected;
    if (this.props.solutions[solver_uid].declined) {
      return null;
    }
    if (accepters) {
      if (accepters.includes(myUID)) {
        return null;
      }
    }
    if (rejecters) {
      if (rejecters.includes(myUID)) {
        return null;
      }
    }
    return (
      <ButtonWrapper>
        <Button size="small" color="primary" onClick={this.handleAccept.bind(this, solver_uid)}>
          Accept
        </Button>
        <Button size="small" color="danger" onClick={this.handleReject.bind(this, solver_uid)}>
          Reject
        </Button>
      </ButtonWrapper>
    );
  };

  renderVerdicts = verdict => {
    //TODO: check for judge override
    let myUID = firebase.auth().currentUser.uid;
    if (this.props.solutions[myUID] && this.props.solutions[myUID][verdict]) {
      let reviewerUID = this.props.solutions[myUID][verdict][0];
      if (reviewerUID) {
        let reviewerNumber = this.props.getPlayerIndex(reviewerUID) + 1;
        let message = `Your solution was ${verdict} by Player ${reviewerNumber} `;
        let reviewer2UID = this.props.solutions[myUID][verdict][1];
        if (reviewer2UID) {
          let reviewer2Number = this.props.getPlayerIndex(reviewer2UID) + 1;
          message += `and by player ${reviewer2Number}. `;
        }
        let disableConcede = false;
        if (verdict === "rejected") {
          message += " Would you like to call a judge?";
          if (this.props.solutions[myUID].conceded) {
            disableConcede = true;
          }
        }

        return (
          <DecisionPrimitive className={verdict}>
            {message}
            {verdict === "rejected" ? (
              <div style={{ display: "inline" }}>
                <Button
                  disabled={true}
                  size="small"
                  color="primary"
                  onClick={this.handleJudge}
                  style={{ float: "right", margin: "0" }}>
                  Judge
                </Button>
                <Button
                  disabled={disableConcede}
                  size="small"
                  color="danger"
                  onClick={this.handleConcede}
                  style={{ float: "right", margin: "0", marginRight: "5px" }}>
                  Concede
                </Button>
              </div>
            ) : null}
          </DecisionPrimitive>
        );
      }
    }
  };

  scoreGame = () => {
    //TODO: write unit-tests for this mess.
    //NOTE: see page O14 of on-sets rule book. in docs/onsets
    let nonwriter = this.props.challenge.last_mover_uid;
    if (!this.props.challenge.now) {
      nonwriter = this.props.challenge.caller_uid;
    }
    // must check challenger/mover first before third party
    let players = [this.state.solver1, this.state.solver2, nonwriter];
    let scores = {};
    for (let solverUID of players) {
      let solution = this.props.solutions[solverUID];
      let isAccepted = false;
      if (this.props.challenge.isForceout) {
        if (solution.accepted && solution.accepted.length === 3) {
          isAccepted = true;
        }
        //XXX: check for other edge cases for forceout.
        //TODO: if correct -> 4, if wrong -> 2;
      } else if (solverUID === this.state.solver1) {
        // In either now/never, solver1 gets 6 if correct, 2 otherwise.
        if (solution.accepted && solution.accepted.length === 2) {
          isAccepted = true;
        }
        if (solution.conceded) {
          scores[solverUID] = 2;
          scores[nonwriter] = 6;
        } else if (isAccepted || solution.over_ruled) {
          scores[solverUID] = 6;
          scores[nonwriter] = 2;
        }
      } else if (solverUID === this.state.solver2) {
        if (solution.accepted && solution.accepted.length === 2) {
          isAccepted = true;
        }
        if (this.props.challenge.now) {
          if (isAccepted || solution.over_ruled) {
            if (scores[this.state.solver1] === 6) {
              //  3rd party has correct solution on challenge NOW and solver 1 was correct => 4
              scores[solverUID] = 4;
            } else {
              //  3rd party has correct solution on challenge NOW and solver 1 was wrong => 6
              scores[solverUID] = 6;
            }
          } else if (solution.conceded || solution.declined) {
            // 3rd party on challenge NOW with incorrect solution or declined to write => 2
            scores[solverUID] = 2;
          }
        } else {
          if (isAccepted || solution.over_ruled) {
            // 3rd party on challenge NEVER with correct solution
            scores[solverUID] = 6;
          } else if (solution.declined && scores[this.state.solver1] === 2) {
            scores[solverUID] = 4;
          } else {
            scores[solverUID] = 2;
          }
        }
      }
    }
    return scores;
  };

  handleJudge = uid => {
    //TODO: waiting for judging module
  };
  handleConcede = () => {
    this.props.concedeSolution(firebase.auth().currentUser.uid);
  };
  handleAccept = uid => {
    this.props.reviewSolution(firebase.auth().currentUser.uid, uid, true);
  };
  handleReject = uid => {
    this.props.reviewSolution(firebase.auth().currentUser.uid, uid, false);
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
