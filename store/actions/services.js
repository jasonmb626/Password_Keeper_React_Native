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
import { UPDATE_PASSWORD } from "../actions/auth";

export const addUpdateService = (serviceData, password) => async dispatch => {
  let isNewEntry = false;

  console.log("add/edit action: sevice data");
  console.log(serviceData);
  if (!serviceData.id) {
    console.log("add/edit action: assigning id");
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
    serviceData.id = uuid();
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
  console.log(
    `start list of cipher data for user ${username} with password ${password}`
  );
  console.log(cipherData);
  console.log(`end list of cipher data for user ${username}`);

  let decrypted = [];
  if (password !== "") {
    decrypted = cipherData._array.map(entry => {
      let decrypt = { ...entry };
      let bytes;
      console.log(`id ${decrypt.id}`);
      bytes = CryptoJS.AES.decrypt(entry.service, password);
      console.log(`service e ${entry.service}`);
      console.log(`service d ${bytes.toString(CryptoJS.enc.Utf8)}`);
      decrypt.service = bytes.toString(CryptoJS.enc.Utf8);
      bytes = CryptoJS.AES.decrypt(entry.username, password);
      console.log(`username e ${entry.username}`);
      console.log(`username d ${bytes.toString(CryptoJS.enc.Utf8)}`);
      decrypt.username = bytes.toString(CryptoJS.enc.Utf8);
      bytes = CryptoJS.AES.decrypt(entry.password, password);
      console.log(
        `password ${entry.password} ${bytes.toString(CryptoJS.enc.Utf8)}`
      );
      decrypt.password = bytes.toString(CryptoJS.enc.Utf8);
      bytes = CryptoJS.AES.decrypt(entry.notes, password);
      console.log(`notes ${entry.notes} ${bytes.toString(CryptoJS.enc.Utf8)}`);
      decrypt.notes = bytes.toString(CryptoJS.enc.Utf8);
      return decrypt;
    });
  } else {
    decrypted = cipherData._array;
  }
  console.log(`start list of decrypted data for user ${username}`);
  console.log(decrypted);
  console.log(`end list of decrypted data for user ${username}`);
  dispatch({
    type: GET_SERVICES,
    payload: decrypted
  });
};

export const changePassword = (services, newPassword) => dispatch => {
  services.forEach(async service => {
    const revisedService = service;
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
