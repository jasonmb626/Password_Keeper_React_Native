import React, { createContext, useState } from 'react';
import {
  updateServiceToDB,
  getServicesForUserFromDB,
  addServiceToDB,
  reenctryptWithNewPasswordToDB,
  deleteServiceFromDB
} from '../db';
import CryptoJS from 'crypto-js';

import uuid from 'uuid';

export interface IService {
  id: string;
  user?: string;
  service: string;
  username: string;
  password: string;
  notes: string;
}

export interface ServiceProvider {
  services: IService[] | null;
  setServices: React.Dispatch<React.SetStateAction<IService[]>> | null;
}

export const Services = createContext<ServiceProvider>({
  services: null,
  setServices: null
});

const ServiceProvider: React.FC = props => {
  const [services, setServices] = useState<IService[]>([]);

  return (
    <Services.Provider value={{ services, setServices }}>
      {props.children}
    </Services.Provider>
  );
};

export const getServices = async (
  username: string | null,
  password: string | null
) => {
  if (username === null || password === null) {
    return;
  }

  const cipherData = await getServicesForUserFromDB(username);
  let decrypted: IService[] = [];
  let error = false;
  if (password !== '') {
    if (Array.isArray(cipherData)) {
      decrypted = cipherData.map(entry => {
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
      if (error) return cipherData;
    }
  } else {
    if (Array.isArray) decrypted = cipherData as IService[];
  }
  return decrypted;
};

export const changePassword = (services: IService[], newPassword: string) => {
  console.log('change password');
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
      await reenctryptWithNewPasswordToDB(revisedService);
    } catch (err) {
      console.error('Error reencrypting passwords to DB');
      console.error(err);
    }
  });
};

export const addUpdateService = async (
  serviceData: IService,
  password: string,
  services: ServiceProvider
) => {
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
      if (services && services.services && services.setServices) {
        const revisedServices = services.services.map(service => {
          if (service.id === serviceData.id) return serviceData;
          else return { ...service };
        });
        services.setServices(revisedServices);
      }
    } catch (err) {
      console.log('Error');
      console.error(err);
    }
  } else {
    try {
      await addServiceToDB(revisedService);
      if (services && services.services && services.setServices) {
        services.setServices([...services.services, serviceData]);
      }
    } catch (err) {
      console.log('Error');
      console.error(err);
    }
  }
};

export const deleteService = async (
  serviceId: string,
  services: ServiceProvider
) => {
    try {
      await deleteServiceFromDB(serviceId);
      if (services && services.services && services.setServices) {
        services.setServices(services.services.filter(service => service.id !== serviceId));
      }
    } catch (err) {
      console.log('Error');
      console.error(err);
    }
  
};

export default ServiceProvider;
