import {
  updateServiceToDB,
  getServicesForUserFromDB,
  addServiceToDB,
  reenctryptWithNewPasswordToDB,
  deleteServiceFromDB
} from "../../db";
import CryptoJS from "crypto-js";

import uuid from "uuid";
export const ADD_SERVICE = "ADD_SERVICE";
export const UPDATE_SERVICE = "UPDATE_SERVICE";
export const GET_SERVICES = "GET_SERVICES";
export const DELETE_SERVICE = "DELETE_SERVICE";
export const CLEAR_SERVICES = "CLEAR_SERVICES";

import { UPDATE_PASSWORD } from "../actions/auth";

export const clearServices = () => {
  return {
    type: CLEAR_SERVICES
  };
};

export const addUpdateService = (serviceData, password) => async dispatch => {
  let isNewEntry = false;

  if (!serviceData.id) {
    serviceData.id = uuid();
    isNewEntry = true;
  }
  const revisedService = { ...serviceData };
  revisedService.service = CryptoJS.AES.encrypt(
    serviceData.service,
    password
  ).toString();
  revisedService.username = CryptoJS.AES.encrypt(
    serviceData.username,
    password
  ).toString();
  revisedService.password = CryptoJS.AES.encrypt(
    serviceData.password,
    password
  ).toString();
  revisedService.notes = CryptoJS.AES.encrypt(
    serviceData.notes,
    password
  ).toString();
  if (!isNewEntry) {
    try {
      await updateServiceToDB(revisedService);
      dispatch({
        type: UPDATE_SERVICE,
        payload: serviceData
      });
    } catch (err) {
      console.log("Error");
      console.error(err);
    }
  } else {
    try {
      await addServiceToDB(revisedService);
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
  const cipherData = await getServicesForUserFromDB(username);
  let decrypted = [];
  let error = false;
  if (password !== "") {
    decrypted = cipherData._array.map(entry => {
      let decrypt = { ...entry };
      let bytes;
      try {
        bytes = CryptoJS.AES.decrypt(entry.service, password);
        decrypt.service = bytes.toString(CryptoJS.enc.Utf8);
        bytes = CryptoJS.AES.decrypt(entry.username, password);
        decrypt.username = bytes.toString(CryptoJS.enc.Utf8);
        bytes = CryptoJS.AES.decrypt(entry.password, password);
        decrypt.password = bytes.toString(CryptoJS.enc.Utf8);
        bytes = CryptoJS.AES.decrypt(entry.notes, password);
        decrypt.notes = bytes.toString(CryptoJS.enc.Utf8);
      } catch (err) {
        error = true;
        return entry;
      }
      return decrypt;
    });
  } else {
    decrypted = cipherData._array;
  }
  if (!error) {
    dispatch({
      type: GET_SERVICES,
      payload: decrypted
    });
  } else {
    dispatch({
      type: GET_SERVICES,
      payload: cipherData._array
    });
  }
};

export const changePassword = (services, newPassword) => dispatch => {
  console.log("change password");
  console.log(services);
  services.forEach(async service => {
    const revisedService = { ...service };
    if (newPassword) {
      revisedService.service = CryptoJS.AES.encrypt(
        service.service,
        newPassword
      ).toString();
      revisedService.username = CryptoJS.AES.encrypt(
        service.username,
        newPassword
      ).toString();
      revisedService.password = CryptoJS.AES.encrypt(
        service.password,
        newPassword
      ).toString();
      revisedService.notes = CryptoJS.AES.encrypt(
        service.notes,
        newPassword
      ).toString();
    }
    try {
      await reenctryptWithNewPasswordToDB(revisedService, newPassword);
    } catch (err) {
      console.error("Error reencrypting passwords to DB");
      console.error(error);
    }
  });
  dispatch({
    type: UPDATE_PASSWORD,
    password: newPassword
  });
};
