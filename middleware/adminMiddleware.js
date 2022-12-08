const verifyAdmin = (req, res, next) => {
  if (req.session.Adminloggedin === true) {
    return res.redirect("/admin");
  }
  next();
};

const notVerifyAdmin = (req, res, next) => {
  if (req.session.Adminloggedin === false) {
    return res.redirect("/admin/login");
  }
  next();
};


module.exports = {
  
  notVerifyAdmin,
  verifyAdmin
  
}