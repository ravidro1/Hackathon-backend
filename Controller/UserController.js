const User = require("../Models/User");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.signup = async (req, res) => {
  const hashPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = new User({...req.body, password: hashPassword});
  newUser
    .save()
    .then((user) => {
      if (!user) {
        res.status(400).json({message: "User creation falild"});
      } else {
        res.status(200).json({message: "User created"});
      }
    })
    .catch((err) => {
      res.status(500).json({message: "Error", err: err});
    });
};

exports.login = (req, res) => {
  User.findOne({username: req.body.username})
    .then((user) => {
      if (!user) {
        res.status(400).json({message: "User not found"});
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((password) => {
            if (!password) {
              res.status(400).json({message: "Password incorrect"});
            } else {
              const token = jsonwebtoken.sign(
                {id: user._id},
                process.env.JWT_TOKEN
              );

              console.log({message: "User Login | Controller"});

              res.status(200).json({
                message: "Login",
                userID: user._id,
                token: token,
              });
            }
          })
          .catch((err) => {
            res.status(500).json({message: "Error", err: err});
          });
      }
    })
    .catch((err) => {
      res.status(500).json({message: "Error", err: err});
    });
};

exports.loginVerifyAndCheckIfUserAlreadyLogged = (req, res) => {
  User.findOne({_id: req.body.id})
    .then((user) => {
      if (!user) {
        res.status(400).json({message: "User Not Exist"});
      } else {
        const isLegalToken = jsonwebtoken.verify(
          req.body.token,
          process.env.JWT_TOKEN
        );
        if (isLegalToken) {
          res.status(200).json({
            message: "Token Legal",
            isLegalToken: true,
            isAlreadyLogged: user.loggedIn,
          });
        } else {
          res
            .status(400)
            .json({message: "Token Not Legal", isLegalToken: false});
        }
      }
    })
    .catch((err) => {
      res.status(500).json({message: "Error", err, isLegalToken: false});
    });
};

// exports.logout = (req, res) => {
//   User.findOneAndUpdate({_id: req.body.id}, {loggedIn: false})
//     .then((user) => {
//       if (!user) res.status(400).json({message: "User Not Found!!!"});
//       else {
//         // console.log(user);
//         res.status(200).json({message: "User Logout"});
//       }
//     })
//     .catch((err) => {
//       res.status(500).json({message: "Error", err});
//     });
// };
