import React from "react";
import styled from "styled-components";
import firebase from "firebase";

export default ({ isOnline, isOpen, onFocus, onBlur }) => {
  return (
    <Menu
      id="menu"
      tabIndex="0"
      onFocus={onFocus}
      onBlur={onBlur}
      className={isOpen ? "open" : ""}
    >
      <Tip />
      {isOnline &&
        <MenuItem onClick={() => firebase.auth().signOut()}>Log Out</MenuItem>}

      <MenuItem> Edit Profile </MenuItem>
    </Menu>
  );
};

const Tip = styled.div`
  position: absolute;
  top: -8px;
  right: 35px;
  width: 0;
  height: 0;
  border-bottom: 8px solid #2e4053;
  border-right: 8px solid transparent;
  border-left: 8px solid transparent;
`;
const MenuItem = styled.div`
  width: 90%;
  text-align: center;
  height: 40px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 40px;
  transition: all 100ms ease-in-out;
  border-radius: 5px;
  &:hover {
    font-size: 17px;
    background: rgba(255, 255, 255, 0.2);
  }
`;
const Menu = styled.div`
  background: #2e4053;
  border-radius: 10px;
  box-shadow: 0px 5px 30px -4px rgba(0, 0, 0, 0.75);
  color: #e5e7e9;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  min-height: 60px;
  opacity: 0;
  position: absolute;
  right: -20px;
  top: -130px;
  transition: all 100ms ease-in-out;
  width: 210px;
  z-index: 98;
  &.open {
    transform: translate(0px, 180px);
    opacity: 1;
  }
  &:focus {
    outline: none;
  }
`;
