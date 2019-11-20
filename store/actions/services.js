import {
  updateServiceToDB,
  getServicesFromDB,
  addServiceToDB,
  reenctryptWithNewPasswordToDB
} from "../../db";
import CryptoJS from "crypto-js";

import uuid from "uuid";
export const ADD_SERVICE = "ADD_SERVICE";
export const UPDATE_SERVICE = "UPDATE_SERVICE";
export const GET_SERVICES = "GET_SERVICES";
export const DELETE_SERVICE = "DELETE_SERVICE";
import { UPDATE_PASSWORD } from "../actions/auth";

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
  // Encrypt
  var ciphertext = CryptoJS.AES.encrypt("Facebook", "123456");

  // Decrypt
  var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), "123456");
  var plaintext = bytes.toString(CryptoJS.enc.Utf8);
  console.log(ciphertext.toString());
  console.log(plaintext);

  const cipherData = await getServicesFromDB(username);
  console.log(`username ${username}`);
  console.log(`password ${password.toString()}`);
  let decrypted = [];
  if (password !== "") {
    decrypted = cipherData._array.map(entry => {
      let decrypt = entry;
      let bytes;
      let decryptedEntry;
      bytes = CryptoJS.AES.decrypt(
        entry.service.toString(),
        password.toString()
      );
      decryptedEntry = bytes.toString(CryptoJS.enc.Utf8);
      console.log(`decryptedEntry: ${decryptedEntry}`);
      decrypt.service = decryptedEntry;
      bytes = CryptoJS.AES.decrypt(entry.username, password.toString());
      decrypt.username = bytes.toString(CryptoJS.enc.Utf8);
      bytes = CryptoJS.AES.decrypt(entry.password, password.toString());
      decrypt.password = bytes.toString(CryptoJS.enc.Utf8);
      bytes = CryptoJS.AES.decrypt(entry.notes, password.toString());
      decrypt.notes = bytes.toString(CryptoJS.enc.Utf8);
      console.log("encrypted");
      console.log(entry);
      console.log("decrypted");
      console.log(decrypt);
      return decrypt;
    });
  } else {
    decrypted = cipherData._array;
  }
  // console.log("decrypted");
  // console.log(decrypted);
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
