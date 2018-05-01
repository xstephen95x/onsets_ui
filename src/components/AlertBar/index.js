// @flow
import React from "react";
import PropTypes from "prop-types";
import { Colors } from "containers/App/global_styles";
import styled from "styled-components";
import firebase from "firebase";

type Props = {
  alert: ?string,
  challenge?: Challenge,
  players?: Array<Player>,
  getPlayerIndex: string => number
};

type State = {
  message: string,
  banner: ?string
};

export default class AlertBar extends React.Component<Props, State> {
  state = {
    message: "",
    banner: undefined
  };

  componentWillReceiveProps(nextProps: Props) {
    this.createBanner(nextProps);
  }

  componentWillMount() {
    this.createBanner(this.props);
  }

  render() {
    return (
      <div>
        <AlertBarPrimitive className={this.props.alert ? "open" : ""}>
          {this.props.alert}
        </AlertBarPrimitive>
        {this.renderBanner()}
      </div>
    );
  }

  renderBanner = () => {
    if (this.state.banner) {
      return <Banner>{this.state.banner}</Banner>;
    } else {
      return null;
    }
  };

  createBanner = (props: Props): void => {
    if (props.challenge && props.players) {
      let player1 = props.players[0].uid;
      let player2 = props.players[1].uid;

      let challenge = "Now";
      if (!props.challenge.now) challenge = "Never";

      let banner;
      if (props.challenge.forceout) {
        banner = "Game resulted in a last cube Forceout. All players are scored equally.";
      } else {
        let challengerIndex = props.getPlayerIndex(props.challenge.caller_uid);
        //NOTE: 2-player depenedent
        let otherIndex = 1;
        if (challengerIndex === 1) otherIndex = 0;
        banner = `Player ${challengerIndex +
          1} called challenge ${challenge} on Player ${otherIndex + 1}.`;
      }
      this.setState({ banner });
    }
  };
}

const Banner = styled.div`
  width: 100%;
  box-shadow: 0px 5px 17px -1px rgba(0, 0, 0, 0.75);
  height: 30px;
  position: fixed;
  text-align: center;
  color: white;
  line-height: 30px;
  background: ${Colors.banner};
  top: 40px;
  z-index: 500;
`;
const AlertBarPrimitive = styled.div`
  width: 100%;
  height: 50px;
  text-align: center;
  line-height: 55px;
  font-size: 25px;
  background-color: ${Colors.alert};
  z-index: 50;
  position: fixed;
  top: -50px;
  transition: all 100ms ease-in-out;
  &.open {
    top: 40px;
  }
`;
