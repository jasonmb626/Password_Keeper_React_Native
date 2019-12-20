import React, { createContext, useState } from 'react';
import {
  updateServiceToDB,
  getServicesForUserFromDB,
  addServiceToDB,
  reenctryptWithNewPasswordToDB,
  deleteServiceFromDB
} from '../db/db';
import CryptoJS from 'crypto-js';
import {ServiceModel} from '../db/Service';

import uuid from 'uuid';

export interface ServiceProvider {
  services: ServiceModel[] | null;
  setServices: React.Dispatch<React.SetStateAction<ServiceModel[]>> | null;
}

export const Services = createContext<ServiceProvider>({
  services: null,
  setServices: null
});

const ServiceProvider: React.FC = props => {
  const [services, setServices] = useState<ServiceModel[]>([]);

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
  let decrypted: ServiceModel[] = [];
  let error = false;
  if (password !== '') {
    if (Array.isArray(cipherData)) {
      decrypted = cipherData.map(entry => {
        let decrypt = { ...entry } as ServiceModel;
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
    decrypted = cipherData as ServiceModel[];
  }
  return decrypted;
};

export const changePassword = (services: ServiceModel[], newPassword: string) => {
  console.log('change password');
  console.log(services);
  services.forEach(async service => {
    const revisedService = { ...service } as ServiceModel;
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
  serviceData: ServiceModel,
  password: string,
  services: ServiceProvider,
  userId: string
) => {
  let isNewEntry = false;

  if (!serviceData.id) {
    serviceData.id = uuid();
    isNewEntry = true;
  }
  const revisedService = { ...serviceData } as ServiceModel;
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
          else return { ...service } as ServiceModel;
        });
        services.setServices(revisedServices);
      }
    } catch (err) {
      console.log('Error');
      console.error(err);
    }
  } else {
    try {
      await addServiceToDB(revisedService, userId);
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
