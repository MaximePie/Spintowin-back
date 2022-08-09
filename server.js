import 'dotenv/config';
import express from 'express'
import mongoose from 'mongoose'
import {url} from './database/databaseService.js'
import bodyParser from "body-parser"
import cors from "cors"
import routes from './routes/routes.js'
import AWS from "aws-sdk";

const app = express();

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
})

app.use(cors());
app.use(bodyParser.json());
mongoose.connect(url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log(error));


// Importing Routes
app.use('/', routes);

const defaultPort = 4001;
const port = process.env.PORT || defaultPort;
app.listen(port, () => console.log(`Listening on port ${port}`));
