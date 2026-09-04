import { persons } from './src/persons.js';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] :response-time ms :postBody'))

const PORT = process.env.PORT || 3001
const baseUrl = `/api/persons`

morgan.token('postBody', (req: Request) => {
  return JSON.stringify(req.body)
})

morgan.token(`status`, (req: Request, res: Response) => {
  const status = (typeof res.headersSent !== `boolean`
    ? Boolean(res.header)
    : res.headersSent)
    ? res.statusCode
    : undefined

  if (!status) {
    return ''
  }
  // get status color
  const color =
    status >= 500
      ? 31 // red
      : status >= 400
        ? 33 // yellow
        : status >= 300
          ? 36 // cyan
          : status >= 200
            ? 32 // green
            : 0 // no color
  return `\x1b[${color}m${status}\x1b[0m`
})

app.get('/', (req: Request, res: Response) => {
  res.send(`
    <h1>Ciao, planeta</h1>
    <h2>💞 Marco loves Kiki! 🥰</h2>
    <h3><a href=${baseUrl}>GET persons</h3>
    `)
})

app.get('/info', (req: Request, res: Response) => {
  res.send(`
    <p>Phonebook contains ${persons.length} people</p>
    <p>${new Date()}</p>`)
})

app.get(`${baseUrl}`, (req: Request, res: Response) => {
  res.json(persons)
})

app.get(`${baseUrl}/:id`, (req: Request, res: Response) => {
  const id = req.params.id
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete(`${baseUrl}/:id`, (req: Request, res: Response) => {
  const id = req.params.id

  // Mutate in place
  const index = persons.findIndex(p => p.id === id);

  if (index !== -1) {
    persons.splice(index, 1);
    console.log(`Deleted ${id}. Remaining: ${persons.length}`);
  }

  res.status(204).end()
})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.floor(Math.random() * 10000)
    : 0
  return String(maxId + 1)
}

const isDuplicatePersonName = (name: string) =>
  persons.some(person => {
    return person.name === name
  })

app.post(`${baseUrl}`, (req: Request, res: Response) => {
  const body = req.body

  if (!body) {
    return res.status(400).json({
      error: 'no person data provided'
    })
  }

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name and number are required'
    })
  }

  if (typeof body.name !== "string" || body.name.trim() === "" || typeof body.number !== "string" || body.number.trim() === "") {
    return res.status(400).json({ error: 'name and number must be strings' })
  }

  if (isDuplicatePersonName(body.name)) {
    return res.status(400).json({
      error: `${body.name} already exists in the phone book`
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  }

  persons.push(person)

  res.json(person)
})

app.listen(PORT, () => {
  console.log(`🔎 server running on port:${PORT}`)
})