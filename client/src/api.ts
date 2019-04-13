import axios from "axios";

export const play = async () => {
  axios.post('/play');
};

export const pause = async () => {
  axios.post('/pause');
};