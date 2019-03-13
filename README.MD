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
  password: string
}
```

Response body:
```
{
  token: string,
  userId: string
}
```

## GET `/feed/posts`

Response body:
```
[
  {
    _id: string,
    title: string,
    content: string,
    imageUrl: string
  }
]
```

## GET `/feed/post/:postId`

Response body:
```
{
  _id: string,
  title: string,
  content: string,
  imageUrl: string
}
```

## POST `/feed/post`

Request body:
```
{
  title: string,
  content: string,
  imageUrl: string
}
```

Response body:
```
{
  message: string,
  post: {
    _id: string,
    title: string,
    content: string,
    imageUrl: string
  },
  creator: {
    _id: string,
    name: string
  }
}
```

## PUT `/feed/post/:postId`

Request body:
```
{
  title: string,
  content: string,
  imageUrl: string
}
```

Response body:
```
{
  message: string,
  post: {
    _id: string,
    title: string,
    content: string,
    imageUrl: string
  }
}
```

## DELETE `/feed/post/:postId`

Response body:

```
{
  message: string
}
```