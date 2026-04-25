/**
 * Middleware factory that checks the request body contains all required fields.
 * Pass an array of field names; the middleware blocks the request with a 400
 * if any are missing before the route handler runs.
 */
export default function requireBody(fields) {
  return (req, res, next) => {
    // WHY (Code Style): Use res.json() instead of res.send() so all error
    // responses across the app share the same { error: "..." } JSON shape.
    // Consistent response formats make the API easier to work with on the frontend.
    if (!req.body)
      return res.status(400).json({ error: "Request body is required." });

    const missing = fields.filter((field) => !(field in req.body));
    if (missing.length > 0)
      return res
        .status(400)
        .json({ error: `Missing fields: ${missing.join(", ")}` });

    next();
  };
}
