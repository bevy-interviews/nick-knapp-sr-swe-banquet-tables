import { useReducer, createContext, useContext } from "react";

import data from '../data.json';
import {
  move,
  remove,
  insert,
  push,
} from "../lib/utils";

const initialState = { data, error: null };

export const reducerTypes = {
  MOVE_GUEST(state, { draggedId, hoveredId }) {
    // TODO: Implement logic based on the assignment's requirements
  },
  DRAG_END(state) {
    return { ...state, error: null };
  }
}

const reducer = (state, action) => reducerTypes[action.type](state, action);

const Context = createContext();

export const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Context.Provider value={{ state, dispatch }}>
    {children}
  </Context.Provider>
}

export const useStateContext = () => {
  const { state, dispatch } = useContext(Context);
  const moveGuest = (action) => dispatch({ type: 'MOVE_GUEST', ...action });
  const dragEnd = (action) => dispatch({ type: 'DRAG_END', ...action });
  return [state, { moveGuest, dragEnd }];
}
