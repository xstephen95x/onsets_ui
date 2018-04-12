import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Panel from "muicss/lib/react/panel";
import Container from "muicss/lib/react/container";
import Button from "muicss/lib/react/button";

export default class Dash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      games: {},
      ids: []
    };
  }

  componentWillMount() {
    this.fetchActiveGames();
  }

  render() {
    let arch = 0;
    return (
      <Container>
        <RowContainer>
          <TitlesWrapper>
            <div>Game ID#</div>
            <div>Players In Game</div>
            <div>Join</div>
          </TitlesWrapper>
          {this.state.ids.map((game, i) => {
            if (this.state.games[game].archived) {
              arch++;
              return null;
            } else {
              let playerCount = 0;
              let players = this.state.games[game].players;
              if (players) {
                //TODO: Is this an array or object?
                playerCount = Object.keys(players).length;
              }
              return (
                <RowPrimitive
                  key={"game-row-" + i}
                  className={(i - arch) % 2 == 0 ? "even" : "odd"}
                >
                  <LinkWrapper>
                    <Link to={`/game/${game}`}>
                      {game}
                    </Link>
                  </LinkWrapper>
                  <CountPrimitive>
                    {this.state.games[game].players ? playerCount : 0}
                  </CountPrimitive>
                  <Button
                    disabled={playerCount === 3}
                    variant="raised"
                    onClick={this.handleJoin.bind(this, game)}
                    style={{ margin: "0", position: "inherit" }}
                    color="primary"
                  >
                    Join
                  </Button>
                </RowPrimitive>
              );
            }
          })}
        </RowContainer>
      </Container>
    );
  }

  handleJoin = id => {
    let uid = firebase.auth().currentUser.uid;
    let displayName = firebase.auth().currentUser.displayName;
    let players = this.state.games[id].players;
    let i;
    //XXX: should players be added to a random position?
    if (players) {
      if (!players[0]) {
        i = 0;
      } else if (!players[1] && players[0] != uid) {
        i = 1;
      } else if (!players[2] && players[1] != uid && players[2] != uid) {
        i = 2;
      } else {
        return;
      }
      firebase.database().ref(`games/${id}/players/${i}`).transaction(data => {
        return { uid: uid, name: displayName };
      });
      if (i === 2) {
        firebase.database().ref(`games/${id}/stage`).transaction(data => {
          return "universe";
        });
      }
      this.props.history.push(`/game/${id}`);
    } else {
      firebase.database().ref(`games/${id}/players`).transaction(data => {
        return { 0: { uid: uid, name: displayName } };
      });
      this.props.history.push(`/game/${id}`);
    }
  };

  fetchActiveGames = () => {
    //TODO: FUTURE: Handle pagination
    firebase.database().ref(`games`).on(
      "value",
      snapshot => {
        let allGames = snapshot.val();
        this.setState({
          games: allGames,
          ids: Object.keys(allGames)
        });
      },
      err => {
        console.log(err);
      }
    );
  };
}

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
const TitlesWrapper = styled.div`
  width: 85%;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const LinkWrapper = styled.div`
  font-family: monospace;
  line-height: 30px;
  font-size: 15px;
  line-height: 30px;
  display: inline-block;
`;
export const CountPrimitive = styled.div`
  width: 40px;
  font-size: 20px;
  height: 30px;
  margin-left: 0 auto;
  display: inline-block;
`;
