import React from "react";
import styled from "styled-components";

export default ({ cube }) => {
  if (cube == {}) {
    return null;
  }
  if (!cube) {
    return null;
  }
  if (cube.value === "R") {
    return <Color className="red" />;
  } else if (cube.value === "G") {
    return <Color className="green" />;
  } else if (cube.value === "B") {
    return <Color className="blue" />;
  } else if (cube.value === "Y") {
    return <Color className="yellow" />;
  } else if (cube.value === "V" || cube.value === "Λ") {
    // make V's without serifs
    return (
      <div style={{ fontFamily: "helvetica" }}>
        {cube.value}
      </div>
    );
  } else {
    return (
      <div>
        {cube.value}
      </div>
    );
  }
};
const Color = styled.div`
  height: 25px;
  width: 25px;
  border-radius: 50%;
  margin: 10px;
  &.red {
    background-color: red;
  }
  &.green {
    background-color: green;
  }
  &.blue {
    background-color: blue;
  }
  &.yellow {
    background-color: gold;
  }
`;
