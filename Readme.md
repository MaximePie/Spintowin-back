# Learning Buddy Node

This projects provides a second backoffice, it is just developed for 
training purpose.

## Dependencies list 
Here are all the dependencies for this project and their role

- [dotEnv](https://www.npmjs.com/package/dotenv) to guarantee the use of `.env` files.
- [Express](https://expressjs.com/) To make cool NodeJS app fast 
- [Mongoose](https://mongoosejs.com/docs/) Used for database communication 
- [Nodemon](https://www.npmjs.com/package/nodemon) Useful tool for nodeJS developing 

- [Cors](https://www.npmjs.com/package/cors) and [BodyParser](https://www.npmjs.com/package/body-parser) to allow 
communications with the outer world

## Database
Here are the instructions to install a DB communication system

### Connecting 
To connect to the DB, fill your `.env` file with the credentials. 

```js
const mongoose = require('mongoose');
const { url } = require('./databaseService');
mongoose.connect(url,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log(error));
```

### Models 
Here is a basic example of a model declaration from [mongoose documentation](https://mongoosejs.com/)
```js
const Cat = mongoose.model('Cat', { name: String });
```

:warning: It is also possible to use a Schema instead of `{name: String}` for longer Entity definition

```js
const kittySchema = new mongoose.Schema({
  name: String
});
kittySchema.methods.speak = () => console.log("Mow");

const Kitten = mongoose.model('Kitten', kittySchema);
```

#### Foreign Key

To use Foreign Key in model relationship, refer to [this guide](https://mongoosejs.com/docs/guide.html)

1. Create your model
2. Use the appropriate Schema
```js

```

---

#### Create
Basic example of Entity Creation in database  
```js
const kitty = new Cat({ name: 'Titouan' });
kitty.save().then(() => console.log('meow'));
```

--- 

#### Read
Basic example which gets all the Entities. Use the `response` object provided by the function in `app.get` method 
(or whatever, as long as we have a `response` object)

```js
Cat.find().then(data => response.status(200).json(data));
```

Or find with a condition 

```js
Cat.find({ name: 'Titouan' })
```

## Testing the API with Postman
To test the work, I use [Postman](https://www.postman.com/) because it's fabulous.

### Testing with a get method

1. Create a new request, and use the appropriate URL and TADA !
![image](https://user-images.githubusercontent.com/16031936/113304226-1cf57c80-9302-11eb-9ed6-1794b6115519.png)

### Testing with a post method 

1. Create a new Request, use the appropriate URL
![image](https://user-images.githubusercontent.com/16031936/113304325-3696c400-9302-11eb-9fe6-1e7223629a07.png)

2. Change the header's Content-Type value in the header to `application/json`
![image](https://user-images.githubusercontent.com/16031936/113304411-4d3d1b00-9302-11eb-98ae-4ead34740d45.png)

3. Send the data in a raw body 
![image](https://user-images.githubusercontent.com/16031936/113304593-79589c00-9302-11eb-8ba7-0b414e5ba090.png)


## Configuring CORS

It is possible to set the CORS to be allowed only from specific sources. We can do it later. Follow 
[this](https://bezkoder.com/node-express-mongodb-crud-rest-api/) for more info.
