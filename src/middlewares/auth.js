const jwt = require("jsonwebtoken");

exports.authenticated = (req, res, next) => {
  let header, token;

  if (
    !(header = req.header("Authorization")) ||
    !(token = header.replace("Bearer ", ""))
  ) {
    return res.status(400).send({
      status: "ERROR",
      message: "Authentication failed",
    });
  }

  try {
    const secretKey = "thisissecretkey";

    const verified = jwt.verify(token, secretKey);

    req.userId = verified;
    next();
  } catch (error) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Token",
    });
  }
};
