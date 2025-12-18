import express from "express";
import instanceRoutes from "./routes/instance/instance.routes.js";
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 8000; // TODO <-- Put it in .env file

app.use(express.json()); // <-- express js body parser

app.get('/', (req, res) => {
    res.json({ data: "LXD Agent" });
});

app.use('/api/v1/instance', instanceRoutes);

app.listen(port, () => {
    console.log(`Running on port ${port}`);
});