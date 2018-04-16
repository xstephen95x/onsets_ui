import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase";
import styled from "styled-components";
import { Colors } from "containers/App/global_styles";
import DropDown from "./DropDown";
import { Link } from "react-router-dom";

const PLAYER_COUNT = 2;

export default class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      blink: ""
    };
  }

  render() {
    if (this.props.mode === "game" || this.props.mode === "online-game") {
      return (
        <NavBarPrimitive>
          {this.props.mode === "online-game" ? this.renderQue() : null}
          <NameWrapper>
            <Name onClick={() => this.props.history.push("/")}>On Sets</Name>
          </NameWrapper>
          {this.renderMenu()}
        </NavBarPrimitive>
      );
    } else if (this.props.mode === "home") {
      return (
        <NavBarPrimitive>
          <NameWrapper>
            <Name onClick={() => (window.location.href = window.location.origin)}>On Sets</Name>
          </NameWrapper>
        </NavBarPrimitive>
      );
    } else {
      return null;
    }
  }

  renderPlayers = () => {
    let currentPlayer = this.props.turn % PLAYER_COUNT + 1;
    let playerIndex = this.props.getPlayerIndex(firebase.auth().currentUser.uid);
    let message = "You are not in this game";
    if (playerIndex !== false) {
      if (currentPlayer === playerIndex) message = "It's your turn!";
      else message = "It's the Bot's turn.";
    }
    return (
      <InfoWrapper>
        <CurrentPlayer>{message}</CurrentPlayer>
        <TurnNumber>Turn: {this.props.turn + 1}</TurnNumber>
      </InfoWrapper>
    );
  };

  renderQue = () => {
    let currentPlayer = this.props.turn % PLAYER_COUNT;
    let playerIndex = this.props.getPlayerIndex(firebase.auth().currentUser.uid);
    let aiClass = "";
    let userClass = "";
    if (currentPlayer === playerIndex) {
      aiClass = "inactive";
    } else {
      userClass = "inactive";
    }
    return (
      <QueWrapper>
        {UserThumb(userClass)}
        {AI_Thumb(aiClass)}
      </QueWrapper>
    );
  };

  renderTimer = () => {
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
        <Timer>{60 - elapsed}</Timer>
      </Stall>
    );
  };

  renderMenu = () => {
    return (
      <IconWrapper onClick={this.toggleMenu}>
        <HamburgerIcon>
          <svg width="24px" height="14px" viewBox="0 0 24 14">
            <rect x="7" y="0" width="17" height="2" rx="1" />
            <rect x="0" y="6" width="24" height="2" rx="1" />
            <rect x="0" y="12" width="24" height="2" rx="1" />
          </svg>
        </HamburgerIcon>
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
      elapsed = Math.round((new Date().getTime() - this.props.stall.began) / 1000);
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
const HamburgerIcon = styled.div`
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
  font-family: "Vollkorn", serif;
  &:hover {
    color: yellow;
  }
`;
const NavBarPrimitive = styled.div`
  background-color: ${Colors.bgRed};
  box-shadow: 0px -2px 15px 5px rgba(0, 0, 0, 0.75);
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

const AI_Thumb = cn => {
  return (
    <AIThumbnail className={cn}>
      <svg
        fill="none"
        height="100%"
        viewBox="0 0 32 32"
        width="100%"
        x="0"
        y="0"
        preserveAspectRatio="xMidYMid meet"
        focusable="false">
        <path
          d="M23.43 21l1.19-2h5.643L32 16l-3.495-6h-4.91l-1.697-2.97H20V5h3.102l1.696 3h2.543l-3.49-6H17v8h2.783l1.166 2H17v4h3.626l1.68-3H26.8l1.157 2H23.48l-1.682 3H17v7h5.453l-1.155 2H17v3h6.846l5.242-9h-3.336l-1.18 2H20v-2z"
          fill="#000000"
        />
        <path
          d="M8.57 21l-1.19-2H1.746L0 16l3.495-6h4.91l1.697-2.97H12V5H8.898L7.202 8H4.66l3.494-6H15v8h-2.783l-1.166 2H15v4h-3.626l-1.68-3H5.198l-1.156 2H8.52l1.682 3H15v7H9.547l1.155 2H15v3H8.154l-5.242-9h3.336l1.18 2H12v-2z"
          fill="#000000"
        />
      </svg>
    </AIThumbnail>
  );
};

const UserThumb = cn => {
  return (
    <UserThumbnail className={cn}>
      <svg version="1.1" width="100%" viewBox="0 0 100 100">
        <path
          d="M26.797,73.25c-0.163,0-0.329-0.022-0.493-0.07c-0.927-0.272-1.459-1.244-1.187-2.172  c1.663-5.677,9.919-9.122,14.355-10.973c0.856-0.357,1.826-0.762,2.071-0.92c0.079-0.052,0.125-0.093,0.151-0.119  c-6.581-5.919-7.097-13.854-7.097-16.163c0-7.993,5.291-16.083,15.402-16.083s15.402,8.091,15.402,16.083  c0,2.306-0.514,10.227-7.077,16.144c-0.004,0.013-0.009,0.025-0.013,0.038c0.023,0.011,0.07,0.052,0.149,0.104  c0.239,0.154,1.209,0.559,2.065,0.916c4.436,1.851,12.692,5.295,14.356,10.973c0.271,0.928-0.26,1.899-1.188,2.172  c-0.926,0.271-1.9-0.259-2.172-1.188c-1.193-4.074-8.726-7.217-12.345-8.728c-1.273-0.531-2.114-0.882-2.622-1.209  c-1.199-0.782-1.59-1.754-1.706-2.433c-0.254-1.472,0.555-2.621,0.72-2.837c0.07-0.092,0.149-0.177,0.236-0.253  c4.493-3.945,6.095-9.664,6.095-13.7c0-6.061-3.725-12.583-11.902-12.583c-8.177,0-11.902,6.523-11.902,12.583  c0,4.036,1.601,9.754,6.095,13.7c0.086,0.076,0.166,0.161,0.236,0.253c0.165,0.216,0.973,1.365,0.72,2.837  c-0.117,0.679-0.507,1.65-1.701,2.429c-0.513,0.331-1.354,0.682-2.628,1.214c-3.619,1.51-11.15,4.652-12.344,8.727  C28.252,72.755,27.554,73.25,26.797,73.25z"
          fill="#000000"
        />
      </svg>
    </UserThumbnail>
  );
};

const UserThumbnail = styled.div`
  position: absolute;
  top: -7px;
  left: -30px;
  width: 55px;
  height: 55px;
  &.inactive {
    transform: scale(0.7);
  }
`;
const AIThumbnail = styled.div`
  transition: all 100ms ease-in-out;
  position: absolute;
  top: 5px;
  left: 30px;
  width: 30px;
  height: 30px;
  &.inactive {
    transform: scale(0.7);
  }
`;
const QueWrapper = styled.div`
  display: flex;
  flex-direction: row;
  position: absolute;
  left: 5vw;
`;
