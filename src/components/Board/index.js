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
      {["forbidden", "permitted", "required"].map((name, i) => {
        return (
          <BoardSquare
            key={`board-square-${i}`}
            type={name}
            cubes={game[name]}
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
