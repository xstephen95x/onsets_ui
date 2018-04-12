import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase";
import { Link } from "react-router-dom";
import styled from "styled-components";
import NavBar from "components/NavBar";
import Button from "muicss/lib/react/button";
import uuidv4 from "uuid/v4";

import LogIn from "containers/LogIn";

let playOnline = {
  fontSize: "16px",
  width: "200px",
  height: "100px"
};
export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: false,
      games: []
    };
  }

  componentWillMount() {
    this.attachAuthListener();
  }
  render() {
    return (
      <div>
        <NavBar mode="home" />
        <HomeWrapper>
          <Header>Welcome to On-Sets Online!</Header>
          <H3>
            Play <a href="http://agloa.org/on-sets/">On Sets</a> in a 2-player match against a bot.
            You can also use the static version of the game as an On Sets game to play in person.
          </H3>
          {this.renderGameList()}
        </HomeWrapper>
      </div>
    );
  }

  fetchGameList = (): void => {
    if (!firebase.auth().currentUser) return;
    let path = `users/${firebase.auth().currentUser.uid}/games`;
    firebase
      .database()
      .ref(path)
      .on("value", snapshot => {
        this.setState({ games: snapshot.val() });
      });
  };

  createNewGame = () => {
    let newGameID = uuidv4();
    let path = `users/${firebase.auth().currentUser.uid}/games`;
    firebase
      .database()
      .ref(path)
      .transaction(data => {
        if (!data) data = [];
        data.push(newGameID);
        return data;
      });
    this.props.history.push(`/bot/${newGameID}`);
  };

  renderGameList = () => {
    if (this.state.auth) {
      return (
        <GameListWrapper>
          {this.state.auth && (
            <Button
              color="primary"
              variant="raised"
              style={playOnline}
              onClick={this.createNewGame}>
              Play Against Bot
            </Button>
          )}
          <Button
            style={playOnline}
            onClick={() => {
              this.props.history.push("/play");
            }}>
            Play Static
          </Button>
          <RowContainer>
            {this.state.games &&
              this.state.games.map((game, i) => {
                return (
                  <RowPrimitive
                    key={`game_row_${i}`}
                    onClick={() => {
                      this.props.history.push(`/bot/${game}`);
                    }}>
                    {game}
                  </RowPrimitive>
                );
              })}
          </RowContainer>
        </GameListWrapper>
      );
    } else {
      return <LogIn />;
    }
  };

  attachAuthListener = () => {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ auth: Boolean(user) });
      if (user) {
        this.fetchGameList();
      }
    });
  };
}

const GamePic = styled.img`
  width: 512px;
  position: absolute;
`;
const Header = styled.h1`
  position: relative;
  width: 750px;
  margin: 0 auto;
  margin-top: 20px;
`;
const H3 = styled.h3`
  position: relative;
  width: 750px;
  margin: 50px auto;
`;
const HomeWrapper = styled.div`
  font-size: 26px;
  width: 100%;
  position: absolute;
  top: 70px;
  text-align: center;
  color: black;
`;

const GameListWrapper = styled.div`
  position: relative;
  width: 80%;
  height: 100%;
  margin: 50px auto;
`;

const RowContainer = styled.div`
  border-radius: 20px;
  box-shadow: 3px 5px 30px -4px rgba(0, 0, 0, 0.75);
  margin: 0 auto;
  margin-top: 80px;
  background-color: #f2f2f2;
  padding: 5px;
`;
export const RowPrimitive = styled.div`
  margin: 0 auto;
  margin-bottom: 10px;
  margin-top: 10px;
  padding: 1vh;
  width: 98%;
  height: 50px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  transition: all 200ms ease-in-out;
  cursor: pointer;
  &:hover {
    box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.15);
  }
  &.even {
    background-color: rgba(247, 238, 127, 0.5);
  }
  &.odd {
    background-color: rgba(200, 70, 80, 0.5);
  }
`;
