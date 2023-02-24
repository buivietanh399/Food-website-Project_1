module.exports.requireAuth = async (req, res, next, checkAdmin = true) => {
  let bIsValid = false;

  if (req.isAuthenticated() === true) {
    if (!checkAdmin) {
      bIsValid = true;
    }
    else {
      const docUser = await UserModel.findOne(
        {
          id: req.session.passport.user
        }
      ).lean();

      if (docUser && docUser.roles) {
        let bIsAdmin = false;
        let bIsStocker = false;
        let bIsCustomer = false;

        for (const x of docUser.roles) {
          if (bIsAdmin === true) {
            break;
          }
          else {
            bIsValid = true;

            switch (x) {
              case UserRole.admin:
                bIsAdmin = true;
                break;
              case UserRole.stocker:
                bIsStocker = true;
                break;
              case UserRole.customer:
                bIsCustomer=true;
                break;
            }
          }
        }
        
        if (bIsValid === true) {
          if (bIsAdmin === true) {
            bIsStocker = false;
            bIsCustomer=false;
          }

          if (bIsStocker === true && req.baseUrl.toLowerCase().startsWith('/admin/user') === true) {
            bIsValid = false;
          }
          if (bIsCustomer === true && req.baseUrl.toLowerCase().startsWith('/') === true) {
            bIsValid = false;
          }
        }
      }
    }
  }
  
  if (bIsValid === true) {
    next();
  }
  else {
    return res.redirect(`/dang-nhap.html?returnUrl=${encodeURI(req.originalUrl)}`);
  }
};