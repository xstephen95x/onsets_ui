/**
 * Board
 * the forbidden, permitted, required  playing mat.
 */
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import firebase from "firebase";

import BoardSquare from "./BoardSquare";

export default ({ game, moveCubeTo, movingCube }) => {
  return (
    <InPlayPrimitive>
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
    </InPlayPrimitive>
  );
};

const InPlayPrimitive = styled.div`
  font-size: 40px;
  width: 750px;
  height: 380px;
`;
