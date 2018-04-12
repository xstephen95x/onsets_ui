import React from "react";
import { shallow, mount } from "enzyme";
import renderer from "react-test-renderer";
import Gamepage from "../index.js";
import { MemoryRouter } from "react-router-dom";
import { DragDropContext } from "react-dnd";
import { RowPrimitive, CountPrimitive } from "../GameList";
import TestBackend from "react-dnd-test-backend";
import "jest-styled-components";
import toJson from "enzyme-to-json";
import Dash from "../";

import fb from "firebase";
jest.mock("firebase");

function wrapInTestContext(DecoratedComponent) {
  return DragDropContext(TestBackend)(
    class TestContextContainer extends React.Component {
      render() {
        return <DecoratedComponent {...this.props} />;
      }
    }
  );
}
const injectMock = data => {
  fb.setMock(data);
  let WrappedGamepage = wrapInTestContext(Dash);
  return mount(
    <MemoryRouter>
      <WrappedGamepage match={{ params: { gameId: "id1" } }} />
    </MemoryRouter>
  );
};
const games = {
  id1: {},
  id2: { players: [{ name: "steph", uid: "uid1" }] }
};
describe("The Dash", () => {
  it("shows a list of active games", () => {
    let wrapper = injectMock({ game: games, auth: "uid1" });
    expect(wrapper.find(RowPrimitive).length).toEqual(2);
  });
  it("shows the number of players in a game", () => {
    let wrapper = injectMock({ game: games, auth: "uid1" });
    const count = wrapper.find(RowPrimitive).at(1).find(CountPrimitive);
    expect(count.text()).toEqual("1");
    // must find the component under the router for snapshot
    expect(toJson(wrapper.find(Dash))).toMatchSnapshot();
  });
});
