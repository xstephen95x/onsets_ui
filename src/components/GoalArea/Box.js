import React from "react";
import styled from "styled-components";
import { DropTarget } from "react-dnd";
import Cube from "components/Cube";

const Box = ({
  i,
  cube,
  goal,
  invert,
  isOver,
  isNumber,
  markUsed,
  position,
  movingCube,
  setGoalCube,
  setMovingCube,
  connectDropTarget
}) => {
  let className = position;
  if (isOver && isNumber) {
    className = position + " active";
  }
  let isDisabled = goal ? true : false;
  const handleTouch = () => {
    if (movingCube && movingCube.type === "numbers") {
      let validMove = setGoalCube(i, null, movingCube, true);
      if (validMove) {
        markUsed(movingCube);
        setMovingCube(null);
      }
    }
  };

  return connectDropTarget(
    <div>
      <BoxWrapper onTouchStart={handleTouch} className={className}>
        {cube !== 0 && (
          <Cube
            cube={cube}
            invert={invert}
            straight={true}
            isDisabled={isDisabled}
            goalPosition={`${i}`}
            movingCube={movingCube}
            setMovingCube={setMovingCube}
            setGoalCube={setGoalCube}
          />
        )}
      </BoxWrapper>
    </div>
  );
};

const target = {
  drop(props, monitor, component) {
    const cube = monitor.getItem().cube;
    let didSet = false;
    if (cube.type === "numbers") {
      didSet = props.setGoalCube(props.i, null, cube);
    }
    return { i: props.i, didSet: didSet };
  }
};

function collect(connect, monitor) {
  let isNumber = false;
  let item = monitor.getItem();
  if (item && item.cube.type === "numbers") isNumber = true;
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isNumber: isNumber
  };
}

export default DropTarget("cube", target, collect)(Box);

export const BoxWrapper = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  transition: all 100ms ease-in-out;
  &.active {
    background: rgba(255, 255, 0, 0.7);
    box-shadow: 0 0 10px 5px rgba(255, 255, 0, 0.7);
  }
  &.one {
    top: 56px;
    &.active {
      background: rgba(255, 255, 0, 0.7);
      box-shadow: 0 0 10px 5px rgba(255, 255, 0, 0.7);
    }
  }
  &.two {
    top: 107px;
    &.active {
      background: rgba(255, 255, 0, 0.7);
      box-shadow: 0 0 10px 5px rgba(255, 255, 0, 0.7);
    }
  }
  &.three {
    left: 56px;
    top: 107px;
    &.active {
      background: rgba(255, 255, 0, 0.7);
      box-shadow: 0 0 10px 5px rgba(255, 255, 0, 0.7);
    }
  }
  &.four {
    left: 107px;
    top: 107px;
    &.active {
      background: rgba(255, 255, 0, 0.7);
      box-shadow: 0 0 10px 5px rgba(255, 255, 0, 0.7);
    }
  }
  &.five {
    left: 82px;
    top: 56px;
    &.active {
      background: rgba(255, 255, 0, 0.7);
      box-shadow: 0 0 10px 5px rgba(255, 255, 0, 0.7);
    }
  }
`;
