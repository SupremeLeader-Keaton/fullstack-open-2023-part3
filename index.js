require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const app = express()
const Person = require("./models/person")
app.use(express.static("build"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
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

app.get("/info", async (request, response) => {
  try {
    const peopleCount = await Person.countDocuments()
    const info = `Phonebook has info for ${peopleCount} people <br> ${new Date()}`
    response.send(info)
  } catch (error) {
    response.status(500).send("Unable to retrieve people count")
  }
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

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body
  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
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
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError" || error.number === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
