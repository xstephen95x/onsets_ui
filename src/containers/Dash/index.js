/**
 * Dash
 * This component acts as a user's dashboard once they've logged in. Here they can see available
 * games, create new games, and access/modify user information.
 */
import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase";
import styled from "styled-components";
import LogIn from "containers/LogIn";
import GameList from "./GameList";
import Loading from "components/Loading";
import NavBar from "components/NavBar";

import Button from "muicss/lib/react/button";

export default class Dash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: null
    };
  }

  componentWillMount() {
    this.attachAuthListener();
  }

  render() {
    if (this.state.auth) {
      return (
        <div>
          <NavBar mode="dash" history={this.props.history} />
          <GameList history={this.props.history} />
          <ButtonWrapper>
            <Button
              variant="fab"
              color="primary"
              onClick={this.handleAddGame}
              style={newGameStyle}
            >
              {" "}+{" "}
            </Button>
          </ButtonWrapper>
        </div>
      );
    } else if (this.state.auth === null) {
      return <Loading />;
    } else {
      return <LogIn />;
    }
  }

  handleAddGame = () => {
    let newGame = firebase.database().ref("games").push();
    newGame.set({ stage: "new" });
  };

  attachAuthListener = () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ auth: true });
      } else {
        this.setState({ auth: false });
      }
    });
  };
}

// --- Styles ---

//TODO: make + spin
const newGameStyle = {
  fontSize: "30px",
  margin: "0"
};

const AddGame = styled.div`
  position: absolute;
  right: 50px;
  bottom: 50px;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  color: white;
  background-color: blue;
  text-align: center;
  font-size: 30px;
  vertical-align: middle;
`;

const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 5%;
  right: 5%;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  transition: transform 150ms ease-in-out, box-shadow 200ms 0ms ease-in;
  &:hover {
    transform: rotate(360deg) scale(1.05);
    box-shadow: 0px 0px 25px 2px rgba(0, 0, 0, 0.3);
  }
`;
