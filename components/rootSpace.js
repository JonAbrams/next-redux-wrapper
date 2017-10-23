import Space from "spaceace";

export const initialState = {
  rootVal: "probably never seen?"
};

export const makeRootSpace = () => {
  return new Space(initialState);
};
