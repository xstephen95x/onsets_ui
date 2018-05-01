import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase";
import styled from "styled-components";
import Pencil from "./pencil.svg";
import { Colors } from "containers/App/global_styles";
import Button from "muicss/lib/react/button";

const replaceLastChar = (inp, char) => inp.slice(0, inp.length - 1).concat(char);

export default class ScratchPad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      solution: "",
      restriction: ""
    };
  }

  componentWillMount() {
    this.loadSolution(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.loadSolution(nextProps);
  }

  render() {
    let fob = "";
    if (!this.state.isOpen) fob = "closed";
    return (
      <ScratchPadPrimitive tabIndex="0" className={this.state.isOpen ? "open" : "closed"}>
        <Fob className={fob} onClick={this.toggleScratchPad}>
          <PencilPrimitive src={Pencil} />
        </Fob>
        <div>
          <form>
            <Row>
              Restriction:{" "}
              <Input
                readOnly={this.state.isDisabled}
                placeholder="c = ⊆ , e = Λ, i u = ∩ ∪"
                type="text"
                value={this.state.restriction}
                onChange={this.handleRestrictionChange}
              />
            </Row>
            <Row>
              Solution:{" "}
              <Input
                readOnly={this.state.isDisabled}
                placeholder="c = ⊆ , e = Λ, i u = ∩ ∪"
                type="text"
                value={this.state.solution}
                onChange={this.handleSolutionChange}
              />
            </Row>
          </form>
          {this.renderButtons()}
        </div>
      </ScratchPadPrimitive>
    );
  }

  loadSolution = props => {
    if (props.solutions && props.mode === "online-game") {
      let mySolution = props.solutions[firebase.auth().currentUser.uid];
      if (mySolution) {
        this.setState({
          solution: mySolution.solution,
          restriction: mySolution.restriction,
          isDisabled: true
        });
      }
    }
  };

  renderButtons = () => {
    //If last mover and challenge now, prevent submission.
    //if challenger and challenge never, prevent submission.

    if (this.props.challenge && this.props.mode === "online-game") {
      let isDisabled;
      const myUID = firebase.auth().currentUser.uid;
      if (this.props.solutions) {
        isDisabled = this.props.solutions.hasOwnProperty(myUID);
      }
      if (this.props.challenge.forceout) {
        if (this.props.getPlayerIndex(myUID)) {
          // if forceout, render 1 button to all 3 players
          return (
            <ButtonWrapper>
              <Button
                disabled={isDisabled}
                style={{
                  backgroundColor: Colors.fgYel,
                  fontWeight: "700",
                  letterSpacing: "2px"
                }}
                onClick={this.handleSubmit}>
                Submit
              </Button>
            </ButtonWrapper>
          );
        }
      }
      if (this.props.challenge.caller_uid === myUID) {
        if (this.props.challenge.now) {
          return (
            <ButtonWrapper>
              <Button
                disabled={isDisabled}
                style={{
                  backgroundColor: Colors.fgYel,
                  fontWeight: "700",
                  letterSpacing: "2px"
                }}
                onClick={this.handleSubmit}>
                Submit
              </Button>
            </ButtonWrapper>
          );
        } else {
          return null;
        }
      } else {
        if (this.props.challenge.now) {
          return null;
        } else {
          return (
            <ButtonWrapper>
              <Button
                disabled={isDisabled}
                style={{
                  backgroundColor: Colors.fgYel,
                  fontWeight: "700",
                  letterSpacing: "2px"
                }}
                onClick={this.handleSubmit}>
                Submit
              </Button>
            </ButtonWrapper>
          );
        }
      }
    }
  };

  toggleScratchPad = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  handleSolutionChange = (event, test) => {
    let input = event.target.value.toUpperCase();
    let last = input[input.length - 1];
    switch (last) {
      case "(":
        break;
      case ")":
        break;
      case "R":
        break;
      case "G":
        break;
      case "B":
        break;
      case "Y":
        break;
      case "V":
        break;
      case "-":
        input = replaceLastChar(input, "—"); // long dash, utf em dash
        break;
      case "'":
        input = replaceLastChar(input, "′"); // utf prime
        break;
      case "U":
        input = replaceLastChar(input, "∪");
        break;
      case "I":
        input = replaceLastChar(input, "∩");
        break;
      case "E":
        input = replaceLastChar(input, "Λ");
        break;
      default:
        //only allow valid chars
        input = replaceLastChar(input, "");
    }
    this.setState({ solution: input });
  };
  handleRestrictionChange = (event, test) => {
    let input = event.target.value.toUpperCase();
    let last = input[input.length - 1];
    switch (last) {
      case "(":
        break;
      case ")":
        break;
      case "C":
        input = replaceLastChar(input, "⊆");
        break;
      case "=":
        break;
      case "R":
        break;
      case "G":
        break;
      case "B":
        break;
      case "Y":
        break;
      case "V":
        break;
      case "-":
        input = replaceLastChar(input, "—"); // long dash, utf em dash
        break;
      case "'":
        input = replaceLastChar(input, "′"); // utf prime
        break;
      case "U":
        input = replaceLastChar(input, "∪");
        break;
      case "I":
        input = replaceLastChar(input, "∩");
        break;
      case "E":
        input = replaceLastChar(input, "Λ");
        break;
      default:
        //only allow valid chars
        input = replaceLastChar(input, "");
    }
    this.setState({ restriction: input });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.props.submitSolution({
      solution: this.state.solution,
      restriction: this.state.restriction
    });
  };

  handleDecline = event => {
    event.preventDefault();
    this.props.submitSolution({
      declined: true
    });
  };
}

const ButtonWrapper = styled.div`
  width: 350px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
const PencilPrimitive = styled.img`
  left: 37px;
  top: 10px;
  width: 15px;
  position: absolute;
  &:hover {
    transform: scale(1.5);
  }
`;
const ChallengeBox = styled.div`
  padding-left: 10px;
  width: 400px;
  margin: 0 auto;
  left: 50;
  height: 60px;
`;
const Challenge = styled.div`
  background-color: white;
  color: black;
  font-weight: serif;
  text-align: center;
  border: 1px solid black;
  border-radius: 10px;
  width: 150px;
  height: 30px;
  display: inline-block;
  margin: 10px;
`;
const ScratchPadPrimitive = styled.div`
  position: fixed;
  bottom: -250px;
  border-radius: 20px;
  padding: 10px;
  width: 750px;
  height: 250px;
  background-color: ${Colors.scratchPad};
  margin-top: 10px;
  z-index: 449;
  transition: all 250ms ease-in-out;
  &:focus {
    outline: none;
    background: white;
  }
  &.open {
    box-shadow: 0px 0px 21px 1px rgba(0, 0, 0, 0.75);
    bottom: -50px;
  }
`;
const Input = styled.input`
  background-color: #f0f0f0;
  margin: 5px;
  float: right;
  width: 600px;
  height: 35px;
  font-size: 25px;
  font-family: helvetica;
  border: solid 1px black;
  &:focus {
    outline: none;
    box-shadow: 0px 0px 1px 3px ${Colors.fgYel};
  }
`;
const Row = styled.div`
  text-shadow: 1px 1px 3px white;
  width: 100%;
  height: 50px;
  font-size: 20px;
  line-height: 40px;
`;
const Fob = styled.div`
  cursor: pointer;
  border-top: 1px solid black;
  border-left: 1px solid black;
  border-right: 1px solid black;
  position: absolute;
  top: -35px;
  background: inherit;
  z-index: 450;
  left: 333px;
  width: 90px;
  height: 35px;
  border-top-right-radius: 50px;
  border-top-left-radius: 50px;
  transition: inherit;
  &:hover {
    > img {
      transition: all 150ms ease-in-out;
      transform: scale(1.1);
    }
  }
  &.closed {
    &:hover {
      box-shadow: 0px 1px 20px -1px rgba(0, 0, 0, 0.75);
    }
  }
`;
