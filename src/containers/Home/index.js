import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase";
import { Link } from "react-router-dom";
import styled from "styled-components";
import NavBar from "components/NavBar";
import Button from "muicss/lib/react/button";
import uuidv4 from "uuid/v4";

export default class Home extends React.Component {
  render() {
    let playOnline = {
      fontSize: "16px",
      width: "200px",
      height: "100px"
    };
    return (
      <div>
        <NavBar mode="home" />
        <HomeWrapper>
          <Header>Welcome to On-Sets online!</Header>
          <Header>This app is currently in development</Header>
          <Header>
            Visit <a href="http://agloa.org/on-sets/">Here</a> to learn more
          </Header>
          <Button
            color="primary"
            variant="raised"
            style={playOnline}
            onClick={() => {
              this.props.history.push(`/bot/${uuidv4()}`);
            }}
          >
            Play Against Bot
          </Button>
          <Button
            style={playOnline}
            onClick={() => {
              this.props.history.push("/play");
            }}
          >
            Play Locally
          </Button>
        </HomeWrapper>
      </div>
    );
  }
}

const GamePic = styled.img`
  width: 512px;
  position: absolute;
`;
const Header = styled.h1`
  position: relative;
  width: 750px;
  margin: 0 auto;
`;
const HomeWrapper = styled.div`
  font-size: 26px;
  width: 100%;
  position: absolute;
  top: 70px;
  text-align: center;
  color: black;
`;
