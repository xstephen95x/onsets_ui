/**
 * GameSetup
 * Renders before the GameBoard, for players to set variations and universe size
 *
 */
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Variations from "components/Variations";
import Resources from "components/Cube/Resources";
import { Colors } from "containers/App/global_styles";

export default class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      universeSize: "",
      error: null
    };
  }

  render() {
    return (
      <UniverseSize>
        <Title>Choose a Universe Size</Title>
        <ChoiceWrapper>
          {["6", "7", "8", "9", "10", "11", "12", "13", "14"].map(num => {
            return (
              <Choice
                key={num}
                tabIndex="0"
                onClick={() => this.handleClick(num)}
              >
                {num}
              </Choice>
            );
          })}
        </ChoiceWrapper>
      </UniverseSize>
    );
  }

  handleClick = num => {
    this.props.setUniverse(num);
  };
}

const ErrorPrimitive = styled.div`
  margin-left: 10px;
  display: inline-block;
  font-size: 20px;
  color: red;
  text-align: center;
`;
const Title = styled.div`
  color: ${Colors.modalTxt};
  width: 100%;
  margin-bottom: 10px;
  text-align: center;
`;
export const Choice = styled.div`
  margin: auto;
  text-align: center;
  background: #c0c0c0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid black;
  cursor: pointer;
  outline: none;
  transition: all 150ms ease-in-out;
  &:hover {
    transform: scale(1.1);
    background: #f0f0f0;
  }
`;
const ChoiceWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const UniverseSize = styled.div`
  font-size: 30px;
  background-color: ${Colors.modal};
  margin-top: 10px;
  width: 750px;
  height: 120px;
  border-radius: 5px;
  box-shadow: 2px 2px 10px 0px rgba(0, 0, 0, 0.75);
`;
