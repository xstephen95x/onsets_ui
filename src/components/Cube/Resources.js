import React from "react";
import Cube from "components/Cube";
import styled from "styled-components";
import { Colors } from "containers/App/global_styles";

// export default class Resources extends React.Component {
export default ({ cubes, turn, movingCube, setMovingCube, isDisabled }) => {
  const renderCubes = cubes => {
    if (!cubes) {
      return null; //there may be no numbers
    }
    return cubes.map((cube, i) => {
      return (
        <Cube
          key={`cube-${i}`}
          cube={cube}
          movingCube={movingCube}
          isDisabled={isDisabled}
          straight={isDisabled}
          goalPosition={""}
          setMovingCube={setMovingCube}
        />
      );
    });
  };

  return (
    <ResourcesWrapper>
      {renderCubes(cubes.colors)}
      {renderCubes(cubes.operators)}
      {renderCubes(cubes.universe)}
      {turn < 1 && renderCubes(cubes.numbers)}
    </ResourcesWrapper>
  );
};

export const ResourcesWrapper = styled.div`
  background-color: ${Colors.lightRed};
  border-radius: 5px;
  box-shadow: 5px 5px 10px 0px rgba(0, 0, 0, 0.5);
  display: inline-flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 160px;
  margin-right: 20px;
  padding: 15px 5px;
  transition: all 150ms ease-in-out;
  width: 550px;
`;
