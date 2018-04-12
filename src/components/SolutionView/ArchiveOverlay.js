import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

// TODO: Add link arrow to Dash.
export default class ArchiveOverlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      player1: null,
      player2: null
    };
  }
  componentWillMount() {}
  render() {
    let player1 = this.props.players[0].uid;
    let player2 = this.props.players[1].uid;
    let challengerIndex = this.props.getPlayerIndex(
      this.props.challenge.caller_uid
    );

    let otherPlayerIndex = challengerIndex == 1 ? 0 : 1;

    let challenge = "Now";
    if (!this.props.challenge.now) challenge = "Never";

    let challengeSummary;
    if (this.props.challenge.isForceout) {
      challengeSummary =
        "Game resulted in a Forceout. All players were scored equally.";
    } else {
      challengeSummary = `Player ${challengerIndex +
        1} called challenge ${challenge} on Player ${otherPlayerIndex + 1}.`;
    }
    return (
      <Overlay>
        <Textbox>
          This game is Archived.
          <Row>
            • Player 1 ({this.props.players[0].name}):
            <Score>{this.props.scores[player1]}</Score>
          </Row>
          <Row>
            • Player 2 ({this.props.players[1].name}):
            <Score>{this.props.scores[player2]}</Score>
          </Row>
          <Bar />
          <Row>{challengeSummary}</Row>
        </Textbox>
      </Overlay>
    );
  }
}
const Bar = styled.div`
  width: auto;
  height: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.7);
  margin-bottom: 10px;
`;
const Score = styled.div`
  float: right;
  padding-right: 15px;
  font-size: 24px;
`;
const Row = styled.div`
  text-align: left;
  width: auto;
  height: 50px;
  padding: 5px;
  line-height: 35px;
  margin-bottom: 10px;
  font-size: 16px;
`;
const Textbox = styled.div`
  width: 500px;
  height: 400px;
  margin: 0 auto;
  color: white;
  padding: 20px;
  text-align: center;
  font-size: 20px;
  transition: all 150ms ease-in-out;
  &:hover {
    box-shadow: 0px 0px 31px 5px rgba(0, 0, 0, 0.75);
    background-color: rgba(112, 128, 144, 0.9);
  }
`;
const Overlay = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 501;
  width: 100vw;
  height: 100vh;
  background-color: rgba(50, 50, 50, 0.5);
`;
