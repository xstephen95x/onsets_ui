/*
 * Cubes are 1 of 4 types: color, operator, universe, or number.
   Color cubes should have equal probabily of each color (r,g,b,y)
   Operator cubes have equal prob of being: union, intersect, complement, without
 */
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Colors } from "containers/App/global_styles";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import CubeInner from "./CubeInner";

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

class Cube extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isInverted: false,
      wasUsed: false,
      tilt: 0
    };
  }
  componentDidMount() {
    let tilt = 0;
    if (!this.props.straight) {
      let rando = getRandom(0, 15);
      let isEven = rando % 2 === 0;
      let charge = isEven ? "-" : "";
      tilt = `${charge}${rando}`;
    }
    this.setState({ tilt: tilt });
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true
    });
  }
  componentWillMount() {
    if (this.props.cube.wasUsed) {
      this.setState({ wasUsed: true });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cube.wasUsed) {
      this.setState({ wasUsed: true });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextState.tilt !== this.state.tilt ||
      nextState.wasUsed !== this.state.wasUsed ||
      nextProps.movingCube !== this.props.movingCube ||
      nextProps.cube.inverted !== undefined ||
      nextProps.goalPosition !== this.props.goalPosition ||
      nextProps.isDisabled !== this.props.isDisabled ||
      nextProps.isDragging !== this.props.isDragging
    );
  }

  render() {
    let style = { outline: "none" };
    let CubePrimitive = this.makeCubeStyle();
    let shouldBeVisible = !this.state.wasUsed;
    let isSelected =
      this.props.movingCube &&
      this.props.movingCube.index === this.props.cube.index &&
      this.props.movingCube.touch;
    if (this.props.goalPosition) shouldBeVisible = true;
    const { isDragging, connectDragSource } = this.props;

    if (this.props.cube === undefined) return null;
    if (isDragging || !shouldBeVisible) {
      style.opacity = "0";
    }
    if (this.props) {
      let className = "enabled";
      if (!this.props.isDisabled && shouldBeVisible) {
        if (this.props.cube.inverted) {
          className = className + " inverted";
        }
        if (isSelected) {
          className = className + " selected";
        }
        return connectDragSource(
          <div style={style}>
            {this.renderInvertButton(isSelected)}
            <CubePrimitive
              tabIndex="0"
              onDoubleClick={() => {
                if (this.props.goalPosition) {
                  this.props.invert(this.props.goalPosition);
                }
              }}
              onTouchStart={() => {
                let cube = this.props.cube;
                cube.touch = true;
                this.props.setMovingCube(cube);
              }}
              onBlur={() => {
                this.props.setMovingCube(null);
              }}
              className={className}>
              {CubeInner({ cube: this.props.cube })}
            </CubePrimitive>
          </div>
        );
      } else {
        className = "disabled";
        if (this.props.cube.inverted) {
          className = className + " inverted";
        }
        return (
          <div style={style}>
            <CubePrimitive className={className}>
              <CubeInner cube={this.props.cube} />
            </CubePrimitive>
          </div>
        );
      }
    } else {
      return null;
    }
  }
  renderInvertButton = isSelected => {
    if (isSelected && this.props.goalPosition && this.props.cube.type === "numbers") {
      return (
        <Inverter
          onTouchStart={() => {
            this.props.invert(this.props.goalPosition);
          }}
        />
      );
    }
  };
  makeCubeStyle = () => {
    let style = styled.div`
      background-color: ${Colors.cube};
      border-radius: 10px;
      border: 3px solid black;
      color: black;
      font-family: serif;
      font-size: 22px;
      font-weight: 700;
      height: 50px;
      line-height: 45px;
      outline: none;
      text-align: center;
      user-select: none;
      width: 50px;
      margin: ${this.props.goalPosition ? "0" : "5px"};
      transition: all 100ms ease-in-out;
      transform: rotate(${this.state.tilt}deg);
      outline: none;
      &.disabled {
        &.inverted {
          transform: rotate(-180deg);
        }
      }
      &.enabled {
        cursor: pointer;
        &.selected {
          transform: scale(1.1);
          box-shadow: 3px 2px 10px 0px rgba(0, 0, 0, 0.5);
          background-color: ${Colors.cubeSelected};
        }
        &:hover {
          transform: scale(1.05);
          box-shadow: 3px 2px 10px 0px rgba(0, 0, 0, 0.5);
        }
        &.inverted {
          transform: rotate(-180deg);
        }
      }
    `;
    return style;
  };
}

const cubeSource = {
  beginDrag(props) {
    props.setMovingCube(props.cube);
    return {
      cube: props.cube
    };
  },
  endDrag(props, monitor, component) {
    let result = monitor.getDropResult();
    let from = props.goalPosition;
    if (props.setGoalCube && result && result.didSet) {
      let to = result.i;
      props.setGoalCube(to, from, 0); //reset
    }
    if (result && result.didSet && from === "") {
      component.setState({ wasUsed: true });
    }
    props.setMovingCube(undefined);
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

export default DragSource("cube", cubeSource, collect)(Cube);

Cube.propTypes = {
  setMovingCube: PropTypes.func,
  setGoalCube: PropTypes.func,
  goalPosition: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  straight: PropTypes.bool.isRequired,
  cube: PropTypes.object.isRequired
};

const Inverter = styled.div`
  width: 40px;
  height: 40px;
  background: red;
  position: absolute;
  border-radius: 15px;
  top: -20px;
  right: -20px;
  z-index: 10000;
`;
