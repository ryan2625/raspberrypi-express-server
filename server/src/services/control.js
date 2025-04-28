import jwt from 'jsonwebtoken'

function authenticate(req, res) {
  const clientData = req.body.data
  console.log(req.body)
  const token = jwt.sign({ clientData }, process.env.SECRET)
  res.send({ token })
}

async function testAuth(req, res, next) {
  try {
    const token = req.headers.authorization.replace('Bearer ', "")
    await jwt.verify(token, process.env.SECRET)
    next()
  }
  catch (e) {
    res.status(401).send({ error: "INVALID_REQUEST" })
  }
}

function confirmAuth(req, res) {
  res.json({ auth: "confirmed" })
}

export { authenticate, testAuth, confirmAuth }