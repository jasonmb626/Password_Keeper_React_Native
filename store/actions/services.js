import { updateServiceToDB, getServicesFromDB, addServiceToDB } from "../../db";
import CryptoJS from "crypto-js";

import uuid from "uuid";
export const ADD_SERVICE = "ADD_SERVICE";
export const UPDATE_SERVICE = "UPDATE_SERVICE";
export const GET_SERVICES = "GET_SERVICES";
export const DELETE_SERVICE = "DELETE_SERVICE";

export const addUpdateService = serviceData => async dispatch => {
  if (serviceData.id) {
    try {
      await updateServiceToDB(serviceData);
      dispatch({
        type: UPDATE_SERVICE,
        payload: serviceData
      });
    } catch (err) {
      console.log("Error");
      console.error(err);
    }
  } else {
    serviceData.id = uuid();
    try {
      await addServiceToDB(serviceData);
      dispatch({
        type: ADD_SERVICE,
        payload: serviceData
      });
    } catch (err) {
      console.log("Error");
      console.error(err);
    }
  }
};

export const deleteService = serviceId => async dispatch => {
  try {
    await deleteServiceFromDB(serviceId);
    dispatch({
      type: DELETE_SERVICE,
      payload: serviceId
    });
  } catch (err) {
    console.log("Error");
    console.error(err);
  }
};

export const getServices = (username, password) => async dispatch => {
  const cipherData = await getServicesFromDB(username);
  let decrypted = [];
  if (password !== "") {
    decrypted = cipherData._array.map(entry => {
      const decrypt = entry;
      let bytes;
      bytes = CryptoJS.AES.decrypt(entry.service, password);
      decrypt.service = bytes.toString(CryptoJS.enc.Utf8);
      bytes = CryptoJS.AES.decrypt(entry.username, password);
      decrypt.username = bytes.toString(CryptoJS.enc.Utf8);
      bytes = CryptoJS.AES.decrypt(entry.password, password);
      decrypt.password = bytes.toString(CryptoJS.enc.Utf8);
      bytes = CryptoJS.AES.decrypt(entry.notes, password);
      decrypt.notes = bytes.toString(CryptoJS.enc.Utf8);
      return decrypt;
    });
  } else {
    decrypted = cipherData._array;
  }
  console.log(decrypted);
  dispatch({
    type: GET_SERVICES,
    payload: decrypted
  });
};
