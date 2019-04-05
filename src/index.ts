import { setupGpio } from "./gpio";

const handleFirst = () => {
  console.log("first");
};

const handleSecond = () => {
  console.log("second");
};

const handleThird = () => {
  console.log("third");
};

setupGpio(new Map([[11, handleFirst], [12, handleSecond], [13, handleThird]]));
