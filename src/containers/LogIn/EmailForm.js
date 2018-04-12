/* Email Form
 *
 */
import React, { PropTypes } from "react";
import firebase from "firebase";
import styled from "styled-components";

import Button from "muicss/lib/react/button";
import Form from "muicss/lib/react/form";
import Input from "muicss/lib/react/input";
import Textarea from "muicss/lib/react/textarea";
import * as Auth from "./auth_service";

export default class EmailForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inModal: false,
      isSignUp: false,
      email: "",
      password: "",
      password2: "",
      displayName: "",
      alert: null
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.alert) {
      this.setState({ alert: nextProps.alert });
    }
  }
  render() {
    let greeting = "Log In with Email";
    if (this.state.isSignUp) {
      greeting = "Create an account with Email";
    }
    return (
      <EmailModal
        onMouseEnter={() => {
          this.setState({ inModal: true });
        }}
        onMouseLeave={() => {
          this.setState({ inModal: false });
        }}
        className={this.state.inModal && "hover"}
      >
        {this.renderLoginOptions()}
        <LoginForm>
          <form
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <Legend className={this.state.inModal && "hover"}>
              {greeting}
            </Legend>
            {this.renderAlert()}
            <Input
              label="Email Address"
              onChange={e => {
                e.preventDefault();
                this.setState({ email: e.target.value });
              }}
              type="email"
              floatingLabel={true}
              required={true}
            />
            <Input
              label="Password"
              onChange={e => {
                e.preventDefault();
                this.setState({ password: e.target.value });
              }}
              type="password"
              floatingLabel={true}
              required={true}
            />
            {this.state.isSignUp &&
              <div>
                <Input
                  label="Confirm Password"
                  onChange={e => {
                    this.setState({ password2: e.target.value });
                  }}
                  type="password"
                  floatingLabel={true}
                  required={true}
                />
                <Input
                  label="Choose a Display Name"
                  onChange={e => {
                    this.setState({ displayName: e.target.value });
                  }}
                  type="text"
                  floatingLabel={true}
                  required={true}
                />
              </div>}
            {this.renderButton()}
          </form>
        </LoginForm>
      </EmailModal>
    );
  }

  renderAlert = () => {
    if (this.state.alert) {
      return (
        <Alert>
          {this.state.alert}
        </Alert>
      );
    } else {
      return null;
    }
  };
  renderLoginOptions = () => {
    let loginClass = "";
    let signupClass = "";
    if (!this.state.isSignUp) {
      loginClass = "selected";
      if (this.state.inModal) {
        loginClass = "selected-hover";
        signupClass = "hover";
      }
    } else {
      signupClass = "selected";
      if (this.state.inModal) {
        loginClass = "hover";
        signupClass = "selected-hover";
      }
    }
    return (
      <SelectionBar>
        <Login
          className={loginClass}
          onClick={() => {
            this.setState({ isSignUp: false });
          }}
        >
          Log In
        </Login>
        <Signup
          className={signupClass}
          onClick={() => {
            this.setState({ isSignUp: true });
          }}
        >
          Sign Up
        </Signup>
      </SelectionBar>
    );
  };

  renderButton = () => {
    if (this.state.isSignUp) {
      return (
        <Button onClick={this.handleSignUp} color="primary" variant="raised">
          Sign Up
        </Button>
      );
    } else {
      return (
        <Button onClick={this.handleLogIn} color="primary" variant="raised">
          Log In
        </Button>
      );
    }
  };

  handleSignUp = () => {
    const displayName = this.state.displayName;
    if (this.state.password !== this.state.password2) {
      this.setState({ alert: "Passwords do not match." });
    } else if (this.state.password.length < 6) {
      this.setState({ alert: "Password must be more than 6 characters" });
    } else {
      Auth.createNewEmailUser(
        this.state.email,
        this.state.password
      ).then(err => {
        if (err) {
          this.setState({ alert: err });
        } else {
          Auth.setDisplayName(displayName);
        }
      });
    }
  };

  handleLogIn = () => {
    Auth.emailLogIn(this.state.email, this.state.password).then(err => {
      if (err) this.setState({ alert: err });
    });
  };
}

const Alert = styled.div`
  margin: 10px 0;
  color: red;
`;
const Legend = styled.div`
  text-align: center;
  font-size: 24px;
  margin: 15px 0;
  color: grey;
  transition: all 150ms ease-in-out;
  &.hover {
    color: black;
  }
`;
const SelectionBar = styled.div`
  width: 100%;
  height: 50px;
  border-top-left-radius: 10px;
`;
const Signup = styled.div`
  color: grey;
  cursor: pointer;
  width: 50%;
  text-align: center;
  font-size: 16px;
  line-height: 40px;
  height: 40px;
  border-top-right-radius: 10px;
  float: right;
  transition: all 200ms ease-in-out;
  &.selected {
    color: black;
    font-weight: 700;
    font-size: 18px;
  }
  &.selected-hover {
    color: black;
    cursor: default;
    font-weight: 700;
    font-size: 18px;
  }
  &.hover {
    background: rgba(150, 150, 150, 0.3);
  }
`;
const Login = styled.div`
  color: grey;
  width: 50%;
  cursor: pointer;
  text-align: center;
  font-size: 16px;
  line-height: 40px;
  height: 40px;
  border-top-left-radius: 10px;
  float: left;
  transition: all 200ms ease-in-out;
  &.selected {
    color: black;
    font-weight: 700;
    font-size: 18px;
  }
  &.selected-hover {
    color: black;
    cursor: default;
    font-weight: 700;
    font-size: 18px;
  }
  &.hover {
    background: rgba(100, 100, 100, 0.3);
  }
`;

const EmailModal = styled.div`
  width: 500px;
  border-radius: 10px;
  margin: 0 auto;
  margin-bottom: 25px;
  transition: all 150ms ease-in-out;
  &.hover {
    box-shadow: 3px 5px 30px -4px rgba(0, 0, 0, 0.75);
    color: black;
  }
`;
const LoginForm = styled.div`
  width: inherit;
  padding-top: 5px;
  padding-left: 60px;
  padding-right: 60px;
  padding-bottom: 20px;
`;
