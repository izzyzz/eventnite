import axios from "/node_modules/axios/index.js";
import {
  getToken
} from "./Token.js";

export const baseURL = 'http://localhost:3000';

export const getAxiosInstance = function (middlePath = '') {
  return axios.create({
    headers: {
      Authorization: `Bearer ${getToken()}`
    },
    baseURL: `${baseURL}${middlePath}`
  });
};