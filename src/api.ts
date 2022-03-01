import express from "express";
import helmet from "helmet";

const app = express();
app.use(helmet());

app.get("/blockchain", (req, res) => {});

app.post("/transcation", (req, res) => {});

app.get("/mine", (req, res) => {});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
