import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Card from "./Card";

//NOTE: functional components are only faster when called as functions.
// If invoked with <Universe /> , instead of {Universe(cards)}, the function is
// just wrapped in a component and has no benefit.
export default ({ cards }) => {
  return (
    <UniversePrimitive>
      {cards.map((card, i) => {
        return (
          <Card
            key={"universe-card-" + i}
            r={card.r}
            g={card.g}
            b={card.b}
            y={card.y}
          />
        );
      })}
    </UniversePrimitive>
  );
};

const UniversePrimitive = styled.div`
  width: 750px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;
