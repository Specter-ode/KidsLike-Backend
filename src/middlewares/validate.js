export default (schema, reqPart = "body") => {
  return (req, res, next) => {
    const validationResult = schema.validate(req[reqPart]);
    if (validationResult.error) {
      return res.status(400).json({ message: validationResult.error.message });
    }
    next();
  };
};
