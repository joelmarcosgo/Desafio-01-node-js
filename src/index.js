const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username)
  if(!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExists = users.some((user) => user.username === username)
  if(userExists) {
    return response.status(400).json({ error: "User already exists!" })
  }

  const user = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const dateFormat = new Date(deadline)

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoUpdate = user.todos.find(todo => todo.id === id)
  if(!todoUpdate) {
    return response.status(404).json({ error: "ToDo not found!" })
  }

  todoUpdate.title = title;
  todoUpdate.deadline = new Date(deadline);
  
  return response.json(todoUpdate);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoDone = user.todos.find(todo => todo.id === id)
  if(!todoDone) {
    return response.status(404).json({ error: "ToDo not found!" })
  }

  todoDone.done = true;
  
  return response.json(todoDone);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) {
    return response.status(404).json({ error: "Not Found!" })
  }

  user.todos.splice(todo, 1)

  return response.status(204).send();
});

module.exports = app;