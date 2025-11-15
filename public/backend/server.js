const express = require("express");
const cors = require("cors");



const app = express();
app.use(cors());
app.use(express.json());




app.post("/predict", (req, res) => {
    const { Glucose, BMI, Age } = req.body;

    let risk = "No Diabetes";

    if (Glucose > 140 || BMI > 30 || Age > 45) {
        risk = "Diabetes Detected";
    }

    res.json({ result: risk });
});

const helmet = require("helmet");
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "connect-src": ["'self'", "http://localhost:5000"],
    },
  })
);
app.listen(5000, () => {
    console.log("Server running on http://Localhost:5000")
})
