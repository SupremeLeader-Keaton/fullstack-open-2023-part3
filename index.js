require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const Person = require("./models/person")

const app = express()
app.use(express.static("build"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method)
  console.log("Path:  ", request.path)
  console.log("Body:  ", request.body)
  console.log("---")
  next()
}
app.use(requestLogger)
app.use(cors())
app.use(morgan(":method :url :status :response-time ms - :req-body"))
morgan.token("req-body", (request, response) => {
  if (request.method === "POST") {
    return JSON.stringify(request.body)
  }
  return ""
})

//
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>")
})

const countId = async () => {
  try {
    const count = await Person.countDocuments()
    return count
  } catch (error) {
    console.log("Error counting documents:", error.message)
    return 0
  }
}
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

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

app.post("/api/persons", (request, response) => {
  const body = request.body
  console.log(body)
  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({ error: "name or number missing" })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then((savedPerson) => {
    response.json(savedPerson)
  })
})

// app.delete("/api/persons/:id", (request, response) => {
//   const id = Number(request.params.id)
//   persons = persons.filter((person) => person.id !== id)

//   response.status(204).end()
// })
app.delete("/api/persons/:id", (request, response, next) => {
  console.log(request.params.id)
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

//
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  }

  next(error)
}
app.use(errorHandler) // this has to be the last loaded middleware.

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
