import { useReducer, createContext, useContext } from "react";

import data from "../data.json";
import {
  move,
  remove,
  insert,
  prepend,
  push,
} from "../lib/utils";

const initialState = { data, error: null };

export const reducerTypes = {
  MOVE_GUEST(state, { draggedId, hoveredId }) {
    let newState = state;
    // Only execute if we have IDs for drag and hover
    if (draggedId && hoveredId) {
      // New table logic assumes that table ids and guest ids cannot have the same value
      const tempData = state.data;
      let oldTable = tempData.find((table) => table.guests.findIndex((guest) => guest.id === draggedId) !== -1);
      const oldTableIndex = tempData.findIndex((table) => table === oldTable);
      let newTable = tempData.find((table) => table.guests.findIndex((guest) => guest.id === hoveredId) !== -1) || tempData.find((table) => table.id === hoveredId);
      const newTableIndex = tempData.findIndex((table) => table === newTable);

      const draggedData = oldTable.guests.find((guest) => guest.id === draggedId);
      const draggedIndex = oldTable.guests.findIndex((guest) => guest.id === draggedId);
      const hoverIndex = newTable.guests.findIndex((guest) => guest.id === hoveredId);

      // check to see if the guest is in the same table, prepend them to the one hovered over

      if ( oldTableIndex === newTableIndex ) {
        if ( hoverIndex === -1 ) {
          newTable.guests = remove(newTable.guests, draggedIndex);
          newTable.guests = push(newTable.guests, draggedData);
        } else if ( hoverIndex === 0 ) {
          newTable.guests = remove(newTable.guests, draggedIndex);
          newTable.guests = prepend(newTable.guests, draggedData);
        } else {
          newTable.guests = move(newTable.guests, draggedIndex, hoverIndex);
        }
        newState.data[newTableIndex] = newTable;
      } else {
        // check for errors before moving to new table
        const guestDoNotPair = draggedData.doNotPair?.filter(value => newTable.guests.map((guest) => guest.id).includes(value)) || [];
        const tableDoNotPair = newTable.guests.filter((guest) => guest.doNotPair?.includes(draggedId)).map((guest) => guest.id) || [];
        const doNotPairArr = guestDoNotPair.concat(tableDoNotPair);
        if ( newTable.guests?.length >= newTable.size ) {
          // ensure no table has more guests than its limit
          return {...state, error: {id: newTable.id, message: `${newTable.name} is full`}}
        } else if ( doNotPairArr?.length > 0 ) {
          // ensure that no guest at the table is on another guest's no seat list
          return { ...state,
            error: {
              id: newTable.id, 
              message: `${draggedData.name} can't sit next to: ${newTable.guests.filter((guest) => doNotPairArr.includes(guest.id)).map((guest) => guest.name).join(', ')}`
            }
          }
        } else if ( !newTable.guests.find((guest) => guest === draggedData) ) {
          // only run if the guest isn't already in the table
          oldTable.guests = remove(oldTable.guests, draggedIndex);
          if ( hoverIndex === -1 ) {
            newTable.guests = push(newTable.guests, draggedData);
          } else if ( hoverIndex === 0 ) {
            newTable.guests = prepend(newTable.guests, draggedData);
          } else {
            newTable.guests = insert(newTable.guests, hoverIndex, draggedData);
          }
        }
        newState.data[oldTableIndex] = oldTable;
        newState.data[newTableIndex] = newTable;
      }
    }
    return { ...newState, error: null };
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
