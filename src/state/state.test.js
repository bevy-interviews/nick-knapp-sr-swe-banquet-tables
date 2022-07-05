import { reducerTypes } from '.';
import data from '../data.json';

const getGuest = (state, tableIndex, guestIndex) => {
  return state.data[tableIndex].guests[guestIndex];
}

const getTable = (state, tableIndex) => {
  return state.data[tableIndex];
}

describe('MOVE_GUEST reducer', () => {
  const initialState = { data, error: null };

  test('moves guest within table', () => {

    const initialSecondGuest = getGuest(initialState, 0, 1);
    const initialThirdGuest = getGuest(initialState, 0, 2);
    const initialFourthGuest = getGuest(initialState, 0, 3);
    const newState = reducerTypes.MOVE_GUEST({ data }, {
      draggedId: initialFourthGuest.id,
      hoveredId: initialSecondGuest.id,
    });
    expect(getGuest(newState, 0, 1).id).toEqual(initialFourthGuest.id);
    expect(getGuest(newState, 0, 2).id).toEqual(initialSecondGuest.id);
    expect(getGuest(newState, 0, 3).id).toEqual(initialThirdGuest.id);

  });

  test('moves guest between tables', () => {
    const initialFirstTableSecondGuest = getGuest(initialState, 0, 1);
    const initialFirstTableThirdGuest = getGuest(initialState, 0, 2);
    const initialThirdTableThirdGuest = getGuest(initialState, 2, 2);
    const initialThirdTableFourthGuest = getGuest(initialState, 2, 3);

    const newState = reducerTypes.MOVE_GUEST({ data }, {
      draggedId: initialThirdTableThirdGuest.id,
      hoveredId: initialFirstTableSecondGuest.id,
    });

    expect(getGuest(newState, 0, 1).id).toEqual(initialThirdTableThirdGuest.id);
    expect(getGuest(newState, 0, 2).id).toEqual(initialFirstTableSecondGuest.id);
    expect(getGuest(newState, 0, 3).id).toEqual(initialFirstTableThirdGuest.id);
    expect(getGuest(newState, 2, 2).id).toEqual(initialThirdTableFourthGuest.id);
  });

  test(`don't move guest to full table`, () => {
    const initialFirstTableThirdGuest = getGuest(initialState, 0, 2);
    const initialThirdTableSecondGuest = getGuest(initialState, 2, 1);

    const newState = reducerTypes.MOVE_GUEST({ data }, {
      draggedId: initialThirdTableSecondGuest.id,
      hoveredId: initialFirstTableThirdGuest.id,
    });
    expect(getGuest(newState, 2, 1).id).toEqual(initialThirdTableSecondGuest.id);
    expect(newState.error).not.toBeNull();
  });

  test(`don't move guest to doNotPair`, () => {
    const initialFirstTableFirstGuest = getGuest(initialState, 0, 0);
    const initialSecondTableFirstGuest = getGuest(initialState, 1, 0);

    let newState = reducerTypes.MOVE_GUEST({ data }, {
      draggedId: initialFirstTableFirstGuest.id,
      hoveredId: initialSecondTableFirstGuest.id,
    });

    expect(getGuest(newState, 0, 0).id).toEqual(initialFirstTableFirstGuest.id);
    expect(newState.error).not.toBeNull();
  });

  test('moves guest to new table without hovering on another guest', () => {
    const initialSecondTableFirstGuest = getGuest(initialState, 1, 0);
    const thirdTable = getTable(initialState, 2);

    let newState = reducerTypes.MOVE_GUEST({ data }, {
      draggedId: initialSecondTableFirstGuest.id,
      hoveredId: thirdTable.id,
    });

    expect(getGuest(newState, 2, thirdTable.guests.length - 1).id).toEqual(initialSecondTableFirstGuest.id);
  });
});