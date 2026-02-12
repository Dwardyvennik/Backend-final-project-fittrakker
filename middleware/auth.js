function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized access" });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    const currentRole = req.session?.role;
    if (!currentRole || !roles.includes(currentRole)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}

module.exports = {
  isAuthenticated,
  authorizeRoles
};
