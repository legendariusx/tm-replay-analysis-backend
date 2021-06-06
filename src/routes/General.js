const statusRoute = (req, res, next) => {
    res.send({ status: "running", version: process.env.VERSION });
}

exports.statusRoute = statusRoute;