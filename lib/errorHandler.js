module.exports = function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({
      "error": err.name + ": " + err.message
    });
  } else {
    res.status(500).send({
      "error": err.name + ": " + err.message
    });
  }
}
