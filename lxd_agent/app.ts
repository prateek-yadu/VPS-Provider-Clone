import express from "express"

const app = express()
const port = 4000 // TODO <-- Put it in .env file

app.use(express.json())

app.get('/', (req, res)=>{
    res.send("LXD Agent")
})

app.listen(port, ()=>{
    console.log(`Running on port ${port}`)
})