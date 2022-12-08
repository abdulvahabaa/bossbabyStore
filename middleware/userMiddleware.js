const verifyUser = (req, res, next) => {
  if (req.session.Userloggedin === true) {
    return res.redirect("/");
  }
  next();
};

const notVerifyUser = (req, res, next) => {
  if (req.session.Userloggedin === false) {
    return res.redirect("/login");
  }
  next();
};




module.exports={
  verifyUser,
  notVerifyUser,
  
}