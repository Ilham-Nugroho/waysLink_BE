const express = require("express");
const router = require("./src/routes");

const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

app.use("/api/v1", router);
app.use("/uploads", express.static("uploads"));

const port = 4000;
app.listen(port, () => {
  console.log("Server running on PORT " + port);
});
