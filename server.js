const express = require('express')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(3000, '0.0.0.0', (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
}) 