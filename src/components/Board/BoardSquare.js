// @flow

import React from "react";
import PropTypes from "prop-types";
import Cube from "../Cube";
import styled from "styled-components";
import { Colors } from "containers/App/global_styles";
import { DropTarget } from "react-dnd";
import type { ConnectDropTarget } from "react-dnd";

type Area = "permitted" | "forbidden" | "required";

type Props = {
  connectDropTarget: ConnectDropTarget,
  isOver: boolean,
  moveCubeTo: Area => {},
  movingCube: Cube,
  cubes: Array<Cube>,
  area: Area
};

class BoardSquare extends React.Component<Props> {
  render() {
    const { connectDropTarget, isOver, moveCubeTo, movingCube, cubes, area } = this.props;
    let renderCubes = cubes;
    if (!cubes) {
      renderCubes = [];
    }
    let className = "foo";
    if (movingCube) className = "ready";
    if (isOver) className = "over";

    return connectDropTarget(
      <div style={{ display: "inline-block" }}>
        <Wrapper
          onTouchStart={() => {
            this.props.moveCubeTo(this.props.area);
          }}
          className={className}>
          <Title>{area}</Title>
          <CubeContainer>
            {renderCubes.map((value, i) => {
              return (
                <Cube
                  key={`${area}-cube-${i}`}
                  cube={value}
                  goalPosition={""}
                  isDisabled={true}
                  straight={true}
                />
              );
            })}
          </CubeContainer>
        </Wrapper>
      </div>
    );
  }
}

const target = {
  drop(props, monitor, component) {
    props.moveCubeTo(props.area);
  }
};
function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

export default DropTarget("cube", target, collect)(BoardSquare);

BoardSquare.propTypes = {
  cubes: PropTypes.array
};

const Title = styled.div`
  font-size: 22px;
  font-weight: 700;
  font-family: serif;
  user-select: none;
  color: white;
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.8);
  text-transform: capitalize;
`;
const CubeContainer = styled.div`
  margin-left: 10px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;
export const Wrapper = styled.div`
  width: 240px;
  height: 350px;
  background-color: ${Colors.bgYel};
  display: inline-block;
  vertical-align: top;
  margin-right: 10px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 10px;
  transition: box-shadow 300ms ease-in-out, background-color 150ms linear;
  &.foo {
    box-shadow: 3px 3px 3px 0px rgba(0, 0, 0, 0.3);
  }
  &.ready {
    box-shadow: 5px 5px 5px 3px rgba(0, 0, 0, 0.5);
  }
  &.over {
    background-color: ${Colors.hlYel};
    box-shadow: 5px 5px 5px 3px rgba(0, 0, 0, 0.5);
  }
`;
