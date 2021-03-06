// @flow
import * as React from "react";
import type { Node } from "react";
import firebase from "firebase";
import styled from "styled-components";
import Button from "muicss/lib/react/button";
import uuidv4 from "uuid/v4";
import type { RouterHistory, Location, Match } from "react-router-dom";

import NavBar from "components/NavBar";
import LogIn from "containers/LogIn";

let playOnline = {
  fontSize: "16px",
  width: "200px",
  height: "100px"
};

type Props = { match: Match, location: Location, history: RouterHistory };
type State = {
  auth: boolean,
  games: Array<string>
};

export default class Home extends React.Component<Props, State> {
  state = {
    auth: false,
    games: []
  };

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
            <a target="_blank" href="http://agloa.org/on-sets/" rel="noopener noreferrer">
              On Sets
            </a>{" "}
            Online matches are 2-player shakes where you face off against a bot. You can also play{" "}
            <Bold
              onClick={() => {
                this.props.history.push("/play");
              }}>
              {" "}
              <a>On Sets offline </a>
            </Bold>{" "}
            with your friends.
          </H3>
          {this.renderGameList()}
        </HomeWrapper>
        {this.state.auth && (
          <ButtonWrapper>
            <Button variant="fab" color="primary" onClick={this.createNewGame} style={newGameStyle}>
              {" "}
              +{" "}
            </Button>
          </ButtonWrapper>
        )}
      </div>
    );
  }

  renderGameList = (): Node => {
    if (this.state.auth) {
      return (
        <GameListWrapper>
          <H3>Active Game List</H3>
          <RowContainer>{this.renderGameListInner()}</RowContainer>
        </GameListWrapper>
      );
    } else {
      return <LogIn />;
    }
  };

  renderGameListInner = (): Node => {
    if (!this.state.games) {
      return (
        <div>
          No Games Yet. <Bold onClick={this.createNewGame}>Start One</Bold> now!
        </div>
      );
    } else if (this.state.games.length === 0) {
      return <div>Loading...</div>;
    } else {
      return this.state.games.map((game, i) => {
        return (
          <RowPrimitive
            className={i % 2 ? "even" : "odd"}
            key={`game_row_${i}`}
            onClick={() => {
              this.props.history.push(`/bot/${game}`);
            }}>
            {game}
            <ArchiveThumbnail clickHandler={() => this.archiveGame(game)} />
          </RowPrimitive>
        );
      });
    }
  };

  fetchGameList = (): void => {
    if (!firebase.auth().currentUser) return;
    firebase
      .database()
      .ref(`users/${firebase.auth().currentUser.uid}/games`)
      .on("value", snapshot => {
        this.setState({ games: snapshot.val() });
      });
  };

  createNewGame = (): void => {
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

  archiveGame = (uuid: string): void => {
    // Users archive games by removing them from their game list
    // then marking the game as archived. The server moves games
    // marked archived to the archived branch.

    let userPath = `users/${firebase.auth().currentUser.uid}/games`;
    let gamePath = `bots/${uuid}`;

    firebase
      .database()
      .ref(userPath)
      .transaction(node => {
        if (!node) node = [];
        return node.filter(id => id !== uuid);
      });

    firebase
      .database()
      .ref(gamePath)
      .transaction(
        node => {
          if (!node) return 0;
          console.log(node);
          node.archived = true;
          node.stage = "archived";
          return node;
        },
        () => {},
        true
      );
  };

  attachAuthListener = (): void => {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ auth: Boolean(user) });
      if (user) this.fetchGameList();
    });
  };
}

const ArchiveThumbnail = ({ clickHandler }) => {
  return (
    <ArchivedIcon
      onClick={e => {
        e.stopPropagation();
        clickHandler();
      }}>
      <svg viewBox="0 0 100 125" width="100%" height="100%">
        <g>
          <path d="M93.548,34.032H81.946c-0.801,0-1.452,0.65-1.452,1.452s0.65,1.452,1.452,1.452h10.151v15.521   c-0.046,0.142-0.077,0.29-0.077,0.447v10.161H81.944H67.442h-0.001c-0.801,0-1.452,0.65-1.452,1.452l0.001,13.065H34.084V64.535   l0.002-0.019c0-0.801-0.65-1.452-1.452-1.452h-0.002H18.13H7.981V36.935h10.151c0.801,0,1.452-0.65,1.452-1.452   s-0.65-1.452-1.452-1.452H6.529c-0.801,0-1.452,0.65-1.452,1.452v16.972C5.031,52.598,5,52.746,5,52.903v40.645   C5,94.35,5.65,95,6.452,95h87.019c0.801,0,1.452-0.65,1.452-1.452V64.963C94.969,64.822,95,64.673,95,64.516V35.484   C95,34.682,94.35,34.032,93.548,34.032z M7.903,92.097V65.968H18.13h13.051v13.065c0,0.801,0.65,1.452,1.452,1.452h34.809   c0.385,0,0.754-0.153,1.026-0.425c0.272-0.272,0.425-0.642,0.425-1.026l-0.001-13.065h13.051h10.075v26.129H7.903z" />
          <path d="M50.037,5c-0.801,0-1.452,0.65-1.452,1.452v42.945l-15.116-15.13c-0.567-0.567-1.487-0.566-2.054-0.001   c-0.567,0.567-0.567,1.487-0.001,2.054L49.01,53.93l0.12,0.098l0.098,0.08l0.104,0.056l0.146,0.078l0.115,0.036l0.156,0.047   c0.094,0.019,0.19,0.029,0.288,0.029s0.194-0.01,0.288-0.029l0.158-0.048l0.114-0.035l0.148-0.079l0.102-0.055l0.103-0.084   l0.116-0.095l17.595-17.61c0.566-0.567,0.566-1.487-0.001-2.054c-0.567-0.565-1.487-0.566-2.054,0.001l-15.116,15.13V6.452   C51.488,5.65,50.838,5,50.037,5z" />
        </g>
      </svg>
      <ToolTip className="archived"> Archive </ToolTip>
    </ArchivedIcon>
  );
};

const ToolTip = styled.div`
  visibility: hidden;
  position: relative;
  background: black;
  font-size: 15px;
  color: white;
  left: 50px;
  top: -30px;
  border-radius: 5px;
  width: 60px;
`;
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
  position: relative;
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

const ArchivedIcon = styled.div`
  right: 5px;
  top: 5px;
  position: absolute;
  height: 40px;
  width: 40px;
  cursor: pointer;
  :hover {
    .archived {
      visibility: visible;
    }
  }
`;
const RowContainer = styled.div`
  border-radius: 20px;
  box-shadow: 3px 5px 30px -4px rgba(0, 0, 0, 0.75);
  margin: 0 auto;
  margin-top: 40px;
  background-color: #f2f2f2;
  padding: 5px;
`;
export const RowPrimitive = styled.div`
  position: relative;
  margin: 0 auto;
  margin-bottom: 10px;
  margin-top: 10px;
  padding: 1vh;
  width: 98%;
  height: 50px;
  border-radius: 5px;
  display: flex;
  transition: all 200ms ease-in-out;
  cursor: pointer;
  &:hover {
    box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.15);
  }
  &.even {
    background-color: rgba(200, 70, 80, 0.5);
  }
  &.odd {
    background-color: rgba(247, 238, 127, 0.5);
  }
`;

const Bold = styled.strong`
  color: blue;
`;

const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 30px;
  right: 30px;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  transition: transform 250ms ease-in-out, box-shadow 200ms 0ms ease-in;
  &:hover {
    transform: rotate(180deg) scale(1.05);
    box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.3);
  }
`;

const newGameStyle = {
  fontSize: "30px",
  margin: "0"
};
