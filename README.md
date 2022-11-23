# TRIVIA QUEST API

**Trivia Quest** is a node JS API for multiple choice questions. You can request any questions based by category or difficulty with the option to specify the number of questions you get per request. Authenticated users have more capabilities which I am still improving (any feedback is much appreciated)

## Author

[Martin Thuo](https://twitter.com/mertoenjosh)

## API Features

- Pagination and Question Limiting
- Field Limiting i.e you can opt to get a response of only specific fields
- Sorting
- Role based authentication
  - User signup and login
  - Password reset
- Role based restrictions
  - User (default)
  - Admin (Still in development)
- Error handling utility

## API Security Features

- Added aditional security headers with [_helmet_](https://helmetjs.github.io/).
- Implemented rate limit with [_express-rate-limit_](https://www.npmjs.com/package/express-rate-limit) to prevent ddos.
- Sanitized input with [_express-mongo-sanitize_](https://www.npmjs.com/package/express-mongo-sanitize) to avoid NoSQL injections.
- Added [_xss-clean_](https://www.npmjs.com/package/xss-clean) to prevent from Cross-Site Scripting.
- Added [_hpp_](https://www.npmjs.com/package/hpp) to prevent parameter polution.

## Testing The API

- To test the API on your local environment here are a few things that you need:

  - Clone the project and open in your text editor
  - Open terminal in the current working directory and run `npm i`
  - Run the node server by running `npm run dev`

- The project should not work as expected yet. This is because you need a few environments variable.
  Create a file named `.env` and paste the following code replacing the values with your own:

```conf
NODE_ENV=development
PORT=3000
DATABASE_TEST=
DATABASE_PASSWORD=

JWT_SECRET=
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_HOST='smtp.mailtrap.io'
EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_PORT=25
```

> NB: Modify your DB connection string and replace the password with `<PASSWORD>` and save the password in the separate `DATABASE_PASSWORD` variable if you are using a remote database.
> eg DATABASE=mongodb+srv://username:<PASSWORD>@mongo_cluster/database_name?retryWrites=true&w=majority

- The code is using mailtrap for email sending simulation, create a mailbox and add the required configurations in the file.
