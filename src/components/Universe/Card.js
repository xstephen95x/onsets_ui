import React from "react";
import styled from "styled-components";

export default class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: false,
      red: true,
      green: true,
      blue: true,
      yellow: true
    };
  }

  componentWillMount() {
    this.setState({
      red: this.props.r,
      green: this.props.g,
      blue: this.props.b,
      yellow: this.props.y
    });
  }

  render() {
    const Dot = styled.div`
      height: 50px;
      border: 1px solid black;
      width: 50px;
      margin: 0 auto;
      margin-bottom: 5px;
      border-radius: 25px;
      &.red {
        background-color: red;
        opacity: ${this.state.red ? 1 : 0};
      }
      &.blue {
        background-color: blue;
        opacity: ${this.state.blue ? 1 : 0};
      }
      &.green {
        background-color: green;
        opacity: ${this.state.green ? 1 : 0};
      }
      &.yellow {
        background-color: yellow;
        opacity: ${this.state.yellow ? 1 : 0};
      }
    `;

    let className = "";
    if (this.state.isSelected) className = "selected";
    return (
      <CardWrapper className={className} onClick={this.toggleSelected}>
        <Dot className="blue" />
        <Dot className="red" />
        <Dot className="green" />
        <Dot className="yellow" />
      </CardWrapper>
    );
  }

  toggleSelected = () => {
    this.setState({ isSelected: !this.state.isSelected });
  };
}

export const CardWrapper = styled.div`
  padding: 10px;
  margin: 11px;
  width: 83px;
  height: 240px;
  border-radius: 20px;
  transition: all 200ms ease-in-out;
  background: #fcfae8;
  box-shadow: 3px 3px 5px 0px rgba(0, 0, 0, 0.5);
  &:hover {
    box-shadow: 3px 3px 25px -1px rgba(77, 77, 77, 0.5);
  }
  &.selected {
    background: #f0e68c;
  }
`;
