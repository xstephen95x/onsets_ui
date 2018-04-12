import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase";
import styled from "styled-components";
import { Colors } from "containers/App/global_styles";
import Box from "./Box";
import goal_solver from "./goal_solver";

/*
 * Cubes are 1 of 4 types: color, operator, universe, or number.
   Color cubes should have equal probabily of each color (r,g,b,y)
   Operator cubes have equal prob of being: union, intersect, complement, without
 */
export default class GoalArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cubes: [0, 0, 0, 0, 0, 0] //each index is a cube
    };
  }

  componentWillMount() {
    if (this.props.goal) {
      this.setState({ cubes: this.props.goal });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.goal) {
      this.setState({ cubes: nextProps.goal });
    }
  }

  render() {
    const boxes = ["", "one", "two", "three", "four", "five"];
    // ⇧ ✓
    return (
      <GoalAreaWrapper>
        {this.renderSubmit()}
        {boxes.map((position, i) => {
          return (
            <Box
              movingCube={this.props.movingCube}
              invert={this.invert}
              setMovingCube={this.props.setMovingCube}
              setGoalCube={this.setGoalCube}
              key={`box-${i}`}
              position={position}
              i={i}
              markUsed={this.props.markUsed}
              goal={this.props.goal}
              cube={this.state.cubes[i]}
            />
          );
        })}
      </GoalAreaWrapper>
    );
  }

  invert = position => {
    let was = false;
    if (this.state.cubes[position].inverted) {
      was = true;
    }
    let cubes = this.state.cubes;
    cubes[position].inverted = was ? false : true;
    this.setState({ cubes: cubes });
  };

  renderSubmit = () => {
    if (!this.props.goal) {
      let className = "";
      if (!goal_solver(this.state.cubes)) className = "invalid";
      if (this.props.isOnline && this.props.goalsetterUID === firebase.auth().currentUser.uid) {
        return (
          <Submit className={className} onClick={() => this.submitGoal(this.state.cubes)}>
            <Arrow />
          </Submit>
        );
      } else if (!this.props.isOnline) {
        return (
          <Submit className={className} onClick={() => this.submitGoal(this.state.cubes)}>
            <Arrow />
          </Submit>
        );
      }
    }
  };

  /** theres many cases:
   *  (resources -> open box), (resources -> occupied box),
   * (box -> occupied box), (box -> same box), (box -> open box),
   * (box -> random drop), also is called for setting a cube
   * and un-setting by passing a 0 as cube.
   * Returns true if a cube was placed on the GoalArea
   */
  setGoalCube = (to, from, cube, shouldCheck) => {
    let cubes = this.state.cubes;
    if (to === from) {
      return false;
    }
    if (cubes[to] !== 0 && cube === 0) {
      cubes[from] = 0;
      this.setState({ cubes });
      return false;
    }
    if (cubes[to] === 0) {
      if (shouldCheck) {
        for (var i = 0; i < cubes.length; i++) {
          if (cubes[i].index === cube.index) {
            cubes[i] = 0;
          }
        }
      }
      cubes[to] = cube;
      this.setState({ cubes });
      return true;
    }
    return false;
  };

  submitGoal = goal => {
    let value = goal_solver(goal);
    if (value) {
      this.props.setGoal(goal, value);
    }
  };
}

GoalArea.propTypes = {
  isOnline: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
  setMovingCube: PropTypes.func.isRequired,
  movingCube: PropTypes.object,
  setGoal: PropTypes.func.isRequired,
  goal: PropTypes.array
};

export const GoalAreaWrapper = styled.div`
  box-shadow: 5px 5px 10px 0px rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  background: ${Colors.lightRed};
  position: absolute;
  font-size: 30px;
  display: inline;
  width: 162px;
  height: 162px;
  padding: 5px;
`;

const Arrow = styled.div`
  position: absolute;
  right: 15px;
  top: 9px;
  z-index: 2;
  &::before {
    content: "⇗";
  }
`;
export const Submit = styled.div`
  cursor: pointer;
  font-size: 20px;
  width: 0px;
  background: #00af00;
  height: 0px;
  float: right;
  border-top: 60px solid transparent;
  border-left: 60px solid ${Colors.lightRed};
  transition: all 200ms ease-in-out;
  &.invalid {
    cursor: no-drop;
    background: #cc0000;
    &:hover {
      background: #ff0000;
    }
  }
  &:hover {
    background: #00ff00;
  }
`;
