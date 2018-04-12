/**
 *  Universe Grid
 */
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import GridPNG from "./grid.png";
import { Colors } from "containers/App/global_styles";

export default class UniverseGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      blank: {
        isSelected: false,
        isUsed: false
      },
      g: {
        isSelected: false,
        isUsed: false
      },
      gy: {
        isSelected: false,
        isUsed: false
      },
      y: {
        isSelected: false,
        isUsed: false
      },
      b: {
        isSelected: false,
        isUsed: false
      },
      bg: {
        isSelected: false,
        isUsed: false
      },
      bgy: {
        isSelected: false,
        isUsed: false
      },
      by: {
        isSelected: false,
        isUsed: false
      },
      br: {
        isSelected: false,
        isUsed: false
      },
      brg: {
        isSelected: false,
        isUsed: false
      },
      brgy: {
        isSelected: false,
        isUsed: false
      },
      bry: {
        isSelected: false,
        isUsed: false
      },
      r: {
        isSelected: false,
        isUsed: false
      },
      rg: {
        isSelected: false,
        isUsed: false
      },
      rgy: {
        isSelected: false,
        isUsed: false
      },
      ry: {
        isSelected: false,
        isUsed: false
      }
    };
  }

  componentWillMount() {
    this.setUsed();
  }

  render() {
    const allColors = [
      "blank",
      "g",
      "gy",
      "y",
      "b",
      "bg",
      "bgy",
      "by",
      "br",
      "brg",
      "brgy",
      "bry",
      "r",
      "rg",
      "rgy",
      "ry"
    ];
    const Fob = styled.div`
      cursor: pointer;
      position: absolute;
      z-index: -5;
      border-top: 1px solid black;
      border-right: 1px solid black;
      border-bottom: 1px solid black;
      border-top-right-radius: 40px;
      border-bottom-right-radius: 40px;
      left: 300px;
      top: 80px;
      background: inherit;
      width: 40px;
      height: 100px;
      transition: inherit;
      &:hover {
        ${this.state.isOpen
          ? ""
          : "box-shadow: 5px 0px 34px -3px rgba(0, 0, 0, 0.75);"};
      }
    `;
    return (
      <Wrapper tabIndex="0" className={this.state.isOpen ? "open" : ""}>
        <Fob onClick={() => this.setState({ isOpen: !this.state.isOpen })}>
          <GridIcon src={GridPNG} />
        </Fob>
        <GridPrimitive>
          <LinePrimitive>
            <GreenLine1 />
            <GreenLine2 />
            <YellowLine1 />
            <YellowLine2 />
            <BlueLine1 />
            <BlueLine2 />
            <RedLine1 />
            <RedLine2 />
          </LinePrimitive>
          <Grid>
            {allColors.map((key, i) => {
              return (
                <Box
                  key={"box-" + key}
                  onClick={this.handleSelect.bind(this, key)}
                  className={this.state[key].isUsed ? "" : "unused"}
                >
                  {this.state[key].isSelected ? "✕" : ""}
                </Box>
              );
            })}
          </Grid>
        </GridPrimitive>
      </Wrapper>
    );
  }

  handleSelect = colors => {
    let newState = this.state;
    newState[colors].isSelected = !newState[colors].isSelected;
    this.setState(newState);
  };

  setUsed = () => {
    let newState = this.state;
    for (var i in this.props.cards) {
      if (this.props.cards.hasOwnProperty(i)) {
        let colors = this.getColors(this.props.cards[i]);
        newState[colors].isUsed = true;
      }
    }
    this.setState(newState);
  };
  getColors = card => {
    let retString = [];
    if (card.b) {
      retString.push("b");
    }
    if (card.r) {
      retString.push("r");
    }
    if (card.g) {
      retString.push("g");
    }
    if (card.y) {
      retString.push("y");
    }
    if (retString === []) {
      return "blank";
    }
    return retString.join("");
  };
}

const Wrapper = styled.div`
  z-index: 500;
  padding: 20px;
  padding-left: 70px;
  width: 300px;
  height: 250px;
  border-radius: 30px;
  position: fixed;
  left: -300px;
  top: 30vh;
  background-color: white;
  background: ${Colors.scratchPad};
  transition: all 150ms ease-in-out;
  &:focus {
    outline: none;
    background: white;
  }
  &.open {
    box-shadow: 0px 0px 24px 5px rgba(0, 0, 0, 0.5);
    left: -50px;
  }
`;
const Box = styled.div`
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  color: white;
  font-size: 50px;
  text-align: center;
  line-height: 55px;
  z-index: 50;
  border: 2px solid black;
  width: 50px;
  height: 50px;
  background-color: rgba(80, 0, 0, 0.2);
  &.selected {
    background-color: rgba(80, 0, 0, 0);
  }
  &.unused {
    background-color: rgba(80, 0, 0, 0.8);
  }
`;
const LinePrimitive = styled.div`
  position: absolute;
  width: 200px;
  height: 200px;
  z-index: 4;
`;
const Grid = styled.div`
  z-index: 5;
  position: absolute;
  width: inherit;
  height: inherit;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;
const GridPrimitive = styled.div`
  width: 200px;
  height: 200px;
  background-color: white;
`;

const GreenLine1 = styled.div`
  z-index: 10;
  left: 72px;
  position: absolute;
  width: 5px;
  height: 200px;
  background-color: green;
`;
const GreenLine2 = styled.div`
  z-index: 10;
  left: 115px;
  position: absolute;
  width: 5px;
  height: 200px;
  background-color: green;
`;
const YellowLine1 = styled.div`
  z-index: 10;
  left: 173px;
  position: absolute;
  width: 5px;
  height: 200px;
  background-color: gold;
`;
const YellowLine2 = styled.div`
  z-index: 10;
  left: 130px;
  position: absolute;
  width: 5px;
  height: 200px;
  background-color: gold;
`;
const BlueLine1 = styled.div`
  z-index: 11;
  top: 72px;
  position: absolute;
  width: 200px;
  height: 5px;
  background-color: blue;
`;
const BlueLine2 = styled.div`
  z-index: 11;
  position: absolute;
  top: 115px;
  width: 200px;
  height: 5px;
  background-color: blue;
`;
const RedLine1 = styled.div`
  z-index: 11;
  top: 130px;
  position: absolute;
  width: 200px;
  height: 5px;
  background-color: red;
`;
const RedLine2 = styled.div`
  z-index: 11;
  position: absolute;
  top: 173px;
  width: 200px;
  height: 5px;
  background-color: red;
`;
const GridIcon = styled.img`
  position: absolute;
  width: 25px;
  left: 7px;
  top: 35px;
`;
