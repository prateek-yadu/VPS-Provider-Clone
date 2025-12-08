import express from "express";
import vmsRoutes from "./routes/vms/vms.routes.js";
import authRoutes from "./routes/auth/auth.routes.js";
import profileRoutes from "./routes/profile/profile.routes.js";
import plans from "./routes/plans/plans.routes.js";
import cookieParser from "cookie-parser";
import 'dotenv/config';

const app = express();
const port = 3000; // <-- TODO: Put it in .env file

app.use(express.json()); // <-- express js body parser
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("VPS Provider Project");
});

app.use("/api/v1/vms", vmsRoutes);

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/profile", profileRoutes);

app.use("/api/v1/plans", plans)

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
