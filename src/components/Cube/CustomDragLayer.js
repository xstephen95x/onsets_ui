import React from "react";
import { DragLayer } from "react-dnd";
import styled from "styled-components";
import { Colors } from "containers/App/global_styles";
import CubeInner from "./CubeInner";

const CustomDragLayer = ({ item, initialOffset, currentOffset }) => {
  //NOTE: top level must not be styled-component. (dnd)
  const layerStyle = {
    pointerEvents: "none",
    zIndex: "500",
    position: "fixed",
    left: "0px",
    right: "0px",
    top: "0px",
    width: "100%",
    height: "100%"
  };
  let cube = {};
  if (item && item.cube) {
    cube = item.cube;
  }
  return (
    <div style={layerStyle}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        <Cube>
          <CubeInner cube={cube} />
        </Cube>
      </div>
    </div>
  );
};

function getItemStyles(initialOffset, currentOffset) {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none"
    };
  }
  let { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform: transform,
    WebkitTransform: transform
  };
}

function collect(monitor) {
  return {
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset()
  };
}

export default DragLayer(collect)(CustomDragLayer);

const Cube = styled.div`
  background-color: ${Colors.cube};
  border-radius: 10px;
  border: 3px solid black;
  box-shadow: 4px 3px 15px 0px rgba(0, 0, 0, 0.8);
  color: black;
  font-family: serif;
  font-size: 22px;
  font-weight: 700;
  height: 50px;
  left: 3px;
  line-height: 45px;
  position: absolute;
  text-align: center;
  transform: rotate(10deg) scale(1.05);
  transition: all 150ms ease-in-out;
  width: 50px;
`;
