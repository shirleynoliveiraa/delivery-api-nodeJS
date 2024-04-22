import express from "express";
import winston from "winston";
import deliveryRouter from "./src/routes/deliveryRoutes.js"
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

global.fileName = "pedidos.json";

//logs, isso é dificil de decorar assim do nada, é sempre bom ver a documentação do site
//e ir fazendo esse formato. Da pra usar esse nos meus próximos codigos
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: "silly",
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({filename: "my-bank-api.log"})
  ],
  format: combine(
    label({ label: "my-bank-api"}),
    timestamp(),
    myFormat
  )
});

const app = express();
app.use(express.json());
app.use("/delivery", deliveryRouter);

app.listen(3000, async () => {
  try {
    await readFile(fileName);
    logger.info("API started!");
  } catch (error) {
    logger.error(error);
  }
});