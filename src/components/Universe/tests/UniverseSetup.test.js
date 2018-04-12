import React from "react";
import { mount } from "enzyme";
import { Choice } from "../UniverseSetup";
import UniverseSetup from "../UniverseSetup";

describe("UniverseSetup", () => {
  it("should deal the chosen amount of cards", () => {
    let mock = jest.fn();
    let choice = "7";
    const Wrapper = mount(<UniverseSetup setUniverse={mock} />);
    Wrapper.find(Choice)
      .findWhere(elm => elm.text() === choice && elm.type() === "div")
      .simulate("click");
    expect(mock.mock.calls[0][0]).toEqual(choice);
  });
});
