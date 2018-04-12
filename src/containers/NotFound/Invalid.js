import React from "react";
import styled from "styled-components";

export default ({ history }) => {
  return (
    <InvalidWrapper>
      The game ID that was provided does not match any active games.
      <Arrow onClick={() => history.push("/game")} />
    </InvalidWrapper>
  );
};

const InvalidWrapper = styled.div`
  font-size: 26px;
  text-align: center;
  width: 100%;
  height: 100%;
  margin-top: 100px;
`;

const Arrow = styled.div`
  margin: 0 auto;
  transition: all 150ms ease-in-out;
  &:hover {
    text-shadow: 1px 2px 10px maroon;
  }
  &::before {
    cursor: pointer;
    font-size: 80px;
    content: '↩';
    width: 50px;
  }
`;
