## Notes app with Postgres Database backend

## Scripts
To run the server

```
npm run start
```

## Env variables to conncect with postgres
```
PGDATABASE=
PGUSER=
PGPWD=
PGHOST=
PGPORT=
JWTSECRET=
PORT=
```


## DB Structure
```
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);


CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```