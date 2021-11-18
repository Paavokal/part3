require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const { response } = require('express')
const app = express()
app.use(express.static('build'))
app.use(express.json())
app.use(cors())


//Morgan
morgan.token("person", (res) => { 
    return JSON.stringify(res.body)
})
app.use(
    morgan( 
        ':method :url :status :res[content-length] - :response-time ms :person'
    )
)

//GET ALL PERSONS
  app.get('/api/persons', (req, res) => {
      Person.find({}).then(persons => {
          res.json(persons)
      })
  })

  // INFO PAGE
  app.get('/info',(req,res) => {
    Person.count({},(err,count) => {
        res.send(`Phonebook has info for ${count} people</br></br>${new Date()}`)
    })   
  })

//GET ONE PERSON
  app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } 
            else {
                res.status(404).end()
            }      
        })
        .catch(error => {
            console.log("WROND ID")
            next(error)
        })
  })
//DELETE PERSON
  app.delete('/api/persons/:id', (req, res, next) => {
      Person.findByIdAndRemove(req.params.id)
      .then(result => {
          res.status(204).end()
      })
      .catch(error => next(error))
  })

//POST NEW PERSON
    app.post('/api/persons', (req, res, next) => {
    const body = req.body
  
    if (body.name === undefined) {
      return res.status(400).json({ error: 'name missing' })
    }
  
    const person = new Person({
        name: body.name,
        number: body.number
    })
  
    person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
  })

//UPDATE PERSON
  app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
  
    const person = {
      name: body.name,
      number: body.number
    }
  
    Person.findByIdAndUpdate(req.params.id, person, { new: true })
      .then(updatedPerson => {
        res.json(updatedPerson)
      })
      .catch(error => next(error))
  })


//UNKNOWN ENDPOINT
const unknownEndpoint = (request, response) => {
response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

//ERROR HANDLER
const errorHandler = (error, req, res, next) => {
console.error(error.message)
    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
      }
    else if (error.name === 'MongoServerError') {
        return res.status(400).json({ error: error.message })
      }
    
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})