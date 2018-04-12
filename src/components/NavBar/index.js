import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase";
import styled from "styled-components";
import { Colors } from "containers/App/global_styles";
import DropDown from "./DropDown";
import { Link } from "react-router-dom";

export default class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      blink: ""
    };
  }

  render() {
    if (this.props.mode === "dash") {
      return (
        <NavBarPrimitive>
          <NameWrapper>
            <Name onClick={() => this.props.history.push("/")}>On Sets</Name>
          </NameWrapper>
          {this.renderMenu()}
        </NavBarPrimitive>
      );
    } else if (
      this.props.mode === "game" ||
      this.props.mode === "online-game"
    ) {
      return (
        <NavBarPrimitive>
          {this.props.mode === "online-game" ? this.renderPlayers() : null}
          <NameWrapper>
            <Name onClick={() => this.props.history.push("/game")}>
              On Sets
            </Name>
          </NameWrapper>
          {this.renderTimer()}
          {this.renderMenu()}
        </NavBarPrimitive>
      );
    } else if (this.props.mode === "home") {
      return (
        <NavBarPrimitive>
          <NameWrapper>
            <Name>On Sets</Name>
          </NameWrapper>
        </NavBarPrimitive>
      );
    } else {
      return null;
    }
  }

  renderPlayers = () => {
    let currentPlayer = this.props.turn % 3 + 1;
    let uid = firebase.auth().currentUser.uid;
    if (uid) {
    }
    let playerIndex = this.props.getPlayerIndex(
      firebase.auth().currentUser.uid
    );
    let you = "not in this game";
    if (playerIndex !== false) {
      you = `Player ${playerIndex + 1}`;
    }
    return (
      <InfoWrapper>
        <CurrentPlayer>
          Current: Player {currentPlayer}. (You are {you})
        </CurrentPlayer>
        <TurnNumber>
          Turn: {this.props.turn + 1}
        </TurnNumber>
      </InfoWrapper>
    );
  };

  renderTimer = () => {
    //TODO: make fill of button decrease like a status bar coresponding to fraction of time.
    let elapsed = this.calculateTime();
    let cn = "";
    if (elapsed > 49) {
      //start blinking the timer for the 10s warning
      if (this.state.blink) {
        cn = "selected";
      }
    }
    return (
      <Stall>
        <StallButton className={cn} onClick={this.handleStall}>
          STALL
        </StallButton>
        <Timer>
          {60 - elapsed}
        </Timer>
      </Stall>
    );
  };

  renderMenu = () => {
    return (
      <IconWrapper onClick={this.toggleMenu}>
        <Icon>
          <svg width="24px" height="14px" viewBox="0 0 24 14">
            <rect x="7" y="0" width="17" height="2" rx="1" />
            <rect x="0" y="6" width="24" height="2" rx="1" />
            <rect x="0" y="12" width="24" height="2" rx="1" />
          </svg>
        </Icon>
        {DropDown({
          isOnline: this.props.mode === "online-game",
          isOpen: this.state.isOpen,
          onBlur: this.handleBlur,
          onFocus: this.handleFocus
        })}
      </IconWrapper>
    );
  };

  calculateTime = () => {
    let elapsed;
    if (!this.props.stall) {
      return 0;
    }
    if (this.props.stall.began === 0) {
      elapsed = 0;
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
      }
    } else {
      // divide by 1000,   ms => seconds
      elapsed = Math.round(
        (new Date().getTime() - this.props.stall.began) / 1000
      );
      if (!this.interval) {
        this.interval = setInterval(() => {
          // this.forceUpdate();
          this.setState({ blink: !this.state.blink });
        }, 500);
      }
    }
    //TODO: 5 second warning?
    if (elapsed > 60) {
      //TODO: handle administering penalty.
      this.props.resetStall();
    }
    return elapsed;
  };
  toggleMenu = e => {
    if (!this.state.disableMenu) {
      if (this.state.isOpen) {
        this.setState({ isOpen: false });
      } else {
        this.setState({ isOpen: true });
        document.getElementById("menu").focus();
      }
    }
  };
  handleFocus = () => {
    this.setState({ disableMenu: true });
  };
  handleBlur = e => {
    // when clicking on the menu icon while menu is open, onBlur (menu) is called before the
    // onClick (menu icon), but we want the icon to still be disabled when the onClick fires.
    this.setState({ isOpen: false });
    setTimeout(() => {
      this.setState({ disableMenu: false });
    }, 250);
  };

  handleStall = () => {
    this.props.setStall();
  };
}

NavBar.PropTypes = {
  mode: PropTypes.string,
  stall: PropTypes.obj,
  resetStall: PropTypes.func,
  setStall: PropTypes.func,
  turn: PropTypes.number
};

const IconWrapper = styled.div`
  position: absolute;
  cursor: pointer;
  top: 10px;
  right: 20px;
`;
const Icon = styled.div`
  transition: all 100ms ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;
const NameWrapper = styled.div`
  position: absolute;
  width: 100%;
`;
const Name = styled.div`
  color: ${Colors.fgYel};
  margin: 0 auto;
  width: 150px;
  height: 40px;
  text-align: center;
  font-weight: 600;
  font-size: 30px;
  transition: all 400ms ease-in-out;
  cursor: pointer;
  text-shadow: 1px 1px 0 black;
  user-select: none;
  &:hover {
    color: yellow;
  }
`;
const NavBarPrimitive = styled.div`
  background-color: ${Colors.bgRed};
  box-shadow: 0px -2px 22px 10px rgba(0, 0, 0, 0.75);
  color: ${Colors.txtYel};
  height: 40px;
  margin-bottom: 20px;
  position: fixed;
  top: 0px;
  width: 100%;
  z-index: 200;
`;
const StallButton = styled.div`
  border: 2px solid ${Colors.fgRed};
  margin: 2px;
  color: white;
  padding: 2px;
  height: 25px;
  width: 75px;
  text-align: center;
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  display: inline-block;
  transition: all 100ms ease-in-out;
  &:hover {
    background-color: ${Colors.fgRed};
  }
  &.selected {
    background-color: ${Colors.fgRed};
  }
`;
const Stall = styled.div`
  border-radius: 5px;
  margin-top: 5px;
  position: absolute;
  height: 30px;
  width: 110px;
  right: 100px;
  background-color: ${Colors.bgYel};
`;
const Timer = styled.div`
  padding: 2px;
  display: inline-block;
  color: black;
`;
const CurrentPlayer = styled.div``;
const TurnNumber = styled.div``;
const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 5vw;
`;
