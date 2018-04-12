import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Colors } from "containers/App/global_styles";
import Variations from "./variation_list";
import Tooltip from "react-tooltip"; //  https://www.npmjs.com/package/react-tooltip

export default class VariationsBox extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let getVariations = () => {
      let names = [];
      Variations.forEach(elm => {
        names.push(elm.name);
      });
    };

    return (
      <VariationsPrimitive>
        <Title>Variations</Title>
        {Variations.map((variation, i) => {
          let isCalled = Object.values(this.props.variations);
          let isSelected = isCalled.includes(variation.name);
          return (
            <VarationPrimitive
              key={"variation-choice-" + i}
              tabIndex="0"
              data-tip={variation.desc}
              data-for={`${variation.name}-var`}
              className={isSelected ? "selected" : "unselected"}
              onClick={
                isSelected ? null : this.handleClick.bind(this, variation)
              }
            >
              {variation.name}
              <div style={{ fontFamily: "helvetica" }}>
                <Tooltip
                  id={`${variation.name}-var`}
                  multiline={true}
                  place="top"
                  effect="solid"
                />
              </div>
            </VarationPrimitive>
          );
        })}
      </VariationsPrimitive>
    );
  }

  handleClick = (variation, e) => {
    this.props.setVariation(variation.name);
  };
}

const Title = styled.div`
  user-select: none;
  text-align: center;
  font-size: 26px;
  margin-top: -7px;
  width: 100%;
`;
const VariationsPrimitive = styled.div`
  background-color: ${Colors.lightRed};
  border-radius: 5px;
  box-shadow: 5px 5px 10px -2px rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  height: 150px;
  margin-bottom: 20px;
  padding: 15px;
  width: 750px;
`;
const VarationPrimitive = styled.div`
  background-color: ${Colors.lightYel};
  border-radius: 5px;
  border: 2px solid ${Colors.bgRed};
  display: inline-block;
  height: 40px;
  margin: 3px;
  padding: 5px;
  font-size: 15px;
  font-weight: 700;
  line-height: 25px;
  transition: all 150ms ease-in-out;
  &.selected {
    background-color: ${Colors.bgRed};
    color: white;
    text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.3);
  }
  &.unselected {
    cursor: pointer;
    &:hover {
      background-color: ${Colors.hlYel};
    }
  }
  &:focus {
    outline: none;
  }
`;
