require('dotenv').config()

const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const Person = require("./models/person")
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("build"))
app.use(cors())
app.use(morgan(":method :url :status :response-time ms - :req-body"))
morgan.token("req-body", (request, response) => {
  if (request.method === "POST") {
    return JSON.stringify(request.body)
  }
  return ""
})


//
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
]

const countId = () => {
  const countId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0
  return countId
}


//
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>")
})
app.get("/info", (request, response) => {
  const info = `
  Phonebook has info for ${countId()} people
  <br>${new Date()}
  `
  response.send(info)
})


// 
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log(body)
  if (body.content === undefined) {
    return response.status(400).json({ error: 'acontent missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

// app.delete("/api/persons/:id", (request, response) => {
//   const id = Number(request.params.id)
//   persons = persons.filter((person) => person.id !== id)

//   response.status(204).end()
// })


//
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
