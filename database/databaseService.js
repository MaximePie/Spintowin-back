/**
 * This file provides all the data we need to Database Access based on the info provided by the .env file
 */

const params = {
  username: process.env.DATABASE_USERNAME,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  databaseName: process.env.DATABASENAME,
};

const url = `mongodb+srv://${params.username}:${params.password}@${params.host}/${params.databaseName}?retryWrites=true&w=majority`;
exports.url = url;
