// @flow

/**
 * App
 *
 * App acts as the root of the entire application. Routes should be
 * defined here, all at the top level.
 */
import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase";

import { BrowserRouter, Switch, Route } from "react-router-dom";
import Gamepage from "containers/Gamepage";
import GamepageBot from "containers/GamepageBot";
import Home from "containers/Home";
import LogIn from "containers/LogIn";
import NotFound from "containers/NotFound";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

import CustomDragLayer from "../../components/Cube/CustomDragLayer";

import "./global_styles";

firebase.initializeApp({
  apiKey: "AIzaSyDzMg9007tPnm5aY1Jr5HaWrNhc-PtVZwI",
  authDomain: "on-sets.firebaseapp.com",
  databaseURL: "https://on-sets.firebaseio.com",
  projectId: "on-sets",
  storageBucket: "on-sets.appspot.com",
  messagingSenderId: "632428363886"
});

type Props = {};
class App extends React.Component<Props> {
  render() {
    // Declare all routes at the top level, then check auth on each page.
    return (
      <div>
        <CustomDragLayer />
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/play" component={Gamepage} />
            <Route path="/bot/:botId" component={GamepageBot} />
            <Route path="*" component={NotFound} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
