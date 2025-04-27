import jwt from 'jsonwebtoken'

function authenticate(req, res) {
  const clientData = req.body.data
  console.log(req.body)
  const token = jwt.sign({ clientData }, 'plsmakethismoresecure', (err, token) => {
    console.log(err, token)
  })
  res.send({ token })
}

export { authenticate }