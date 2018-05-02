// @flow

/**
 * Board
 * Has 3 'areas'
 * They are rendered in the order:
 * [Forbiden] [Permitted] [Required]
 *
 */
import React from "react";
import type { Node } from "react";
import styled from "styled-components";

import BoardSquare from "./BoardSquare";

type Area = "permitted" | "forbidden" | "required";

export default ({
  game,
  moveCubeTo,
  movingCube
}: {
  game: GameState,
  moveCubeTo: Area => {},
  movingCube: Cube
}): Node => {
  return (
    <PlayingMat>
      {["forbidden", "permitted", "required"].map((area, i) => {
        let cubes = game[area];
        if (!cubes) cubes = [];
        return (
          <BoardSquare
            connectDropTarget={() => {}}
            isOver={false}
            key={`board-square-${area}`}
            area={area}
            cubes={cubes}
            moveCubeTo={moveCubeTo}
            movingCube={movingCube}
          />
        );
      })}
    </PlayingMat>
  );
};

const PlayingMat = styled.div`
  font-size: 40px;
  width: 750px;
  height: 380px;
`;
