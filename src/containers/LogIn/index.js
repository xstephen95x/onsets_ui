import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase";
import styled from "styled-components";
import Button from "muicss/lib/react/button";
import * as Auth from "./auth_service";
import NavBar from "components/NavBar";
import EmailForm from "./EmailForm";
import G from "./google.svg";

export default class LogIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alert: ""
    };
  }
  render() {
    if (firebase.auth().currentUser) {
      return null;
    } else {
      return (
        <LoginWrapper>
          <EmailForm alert={this.state.alert} />
          <NavBar mode="home" />
          <SocialLoginArea>
            <div>Or sign in with Google / Github</div>
            <AuthButton className="google" onClick={this.handleGoogleAuth}>
              <img src={G} style={{ width: "40px" }} />
            </AuthButton>
            <AuthButton className="github" onClick={this.handleGithubAuth}>
              <svg viewBox="0 0 16 16">
                <path
                  fillRule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
            </AuthButton>
          </SocialLoginArea>
        </LoginWrapper>
      );
    }
  }
  handleGoogleAuth = e => {
    Auth.handleGoogleAuth(e).then(err => {
      if (err) {
        this.setState();
      }
    });
  };
  handleGithubAuth = e => {
    Auth.handleGithubAuth(e).then(err => {
      if (err) {
        this.setState({ alert: err });
      }
    });
  };
}
const LoginWrapper = styled.div`
  margin-top: 100px;
  width: 100%;
  height: 500px;
  text-align: center;
`;

const SocialLoginArea = styled.div`
  border-radius: 10px;
  margin: 0 auto;
  width: 300px;
  height: 150px;
  padding-top: 30px;
  transition: all 150ms ease-in-out;
  &:hover {
    box-shadow: 3px 5px 30px -4px rgba(0, 0, 0, 0.75);
  }
`;
const AuthButton = styled.div`
  margin: 10px;
  display: inline-block;
  width: 50px;
  height: 50px;
  text-align: center;
  padding: 5px;
  border-radius: 25px;
  transition: all 150ms ease-in-out;
  box-shadow: 1px 1px 1px 1px rgba(133, 129, 133, 1);
  &.github {
    background-color: #d3d9e2;
    &:hover {
      box-shadow: 1px 5px 10px 1px rgba(133, 129, 133, 1);
      background-color: #e8ebf2;
    }
  }
  &.google {
    background-color: #dd4b39;
    &:hover {
      box-shadow: 1px 5px 10px 1px rgba(133, 129, 133, 1);
      background-color: #f03838;
    }
  }
`;
