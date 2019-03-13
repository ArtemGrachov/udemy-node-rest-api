Run
```
npm start
```

Server will start on `http://localhost:8080`

## POST `/auth/signup`

Request body:
```
{
  email: string,
  name: string,
  password: string
}
```

Response body:
```
{
  message: string,
  userId: string
}
```


## POST `/auth/login`

Request body:
```
{
  email: string,
  password: password
}
```

Response body:
```
{
  token: string,
  userId
}
```