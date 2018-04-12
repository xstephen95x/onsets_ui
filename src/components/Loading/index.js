/**
 * Loading Page
 * Uses SpinKit, see:
 * https://www.npmjs.com/package/styled-spinkit
 */
import React, { PropTypes } from "react";
import styled from "styled-components";
import { Circle } from "styled-spinkit";

export default class Loading extends React.Component {
  render() {
    return (
      <LoadingWrapper>
        <Circle size={100} color={"#4F000B"} />
      </LoadingWrapper>
    );
  }
}

const LoadingWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100vh;
  background-color: #f7ee7f;
`;
