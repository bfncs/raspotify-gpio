import express, { Application } from "express";
// import rpio from "rpio";

const { PORT = 8080 } = process.env;
const app: Application = express();

app.get("/", (_, res) => {
  res.send("Ok.");
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}.`);
});
