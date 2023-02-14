const { default: axios } = require("axios");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { createProxyMiddleware } = require("http-proxy-middleware");
const morgan = require("morgan");
const app = express();

const PORT = 3005;

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 100 requests per windowMs
});

app.use(morgan("combined"));
app.use(limiter);

app.use("/bookingservice", async (req, res, next) => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/v1/isauthenticated",
      {
        headers: {
          "x-access-token": req.headers["x-access-token"],
        },
      }
    );
    if (response.data.success) {
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "unauthorized",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "unauthorized",
    });
  }
});

app.use(
  "/bookingservice",
  createProxyMiddleware({
    target: "http://localhost:3002/",
    changeOrigin: true,
  })
);

app.get("/home", (req, res) => {
  return res.json({
    message: "Hello World",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
