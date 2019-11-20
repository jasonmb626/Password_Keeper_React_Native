import {
  GET_SERVICES,
  UPDATE_SERVICE,
  ADD_SERVICE,
  DELETE_SERVICE,
  CLEAR_SERVICES
} from "../actions/services";

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_SERVICES:
      return [...action.payload];
    case UPDATE_SERVICE:
      return state.map(service => {
        if (service.id === action.payload.id)
          return {
            id: action.payload.id,
            service: action.payload.service,
            username: action.payload.username,
            password: action.payload.password,
            notes: action.payload.notes
          };
        else return service;
      });
    case ADD_SERVICE:
      return [...state, action.payload];
    case DELETE_SERVICE:
      return state.filter(service => service.id !== action.payload);
    case CLEAR_SERVICES:
      return [];
    default:
      return state;
  }
};
