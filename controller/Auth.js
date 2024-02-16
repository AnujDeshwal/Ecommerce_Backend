const { User } = require("../model/User")
const crypto  = require('crypto');
const SECRET_KEY='SECRET_KEY';
const jwt = require('jsonwebtoken');
const { sanitizeUser } = require("../services/common");
// Create User means sign up so it would in authentication section 
exports.createUser= async(req,res)=>{
    //this req.body will get from the frontend ,basically whatever product we would have to sell they all will be added by the admin by frontend so that whole data would come from the frontend and we be parsed by the middleware express.json() because data would be in the form of json 
    // const user = new User(req.body)
    try{
        // want to know about this salt go to index file then go to crypto part 
        const salt = crypto.randomBytes(16);
        crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256',async function(err, hashedPassword) {
            // basically abover we were taking the user from the req.body and were saving it in the database but right now we are saving the hashedPassword now real password using crypto library , here we are using spread operator in which we are changing from real password to hashedPassword and we are saving salt as well because it will help use to verify the password during login 
            // basically when we doing login then only that passport js is working and after getting verified through the strategy then only it is creating req.user where we have user in the session ,now it means while signup session would not be created because vo login ke wakt banta hai sirf then int the passport js documentation they have mentioned if you want to make a sessino manually and put the user info in it so you can use req.login function where first arguement would be info to put inside of session and second is just callback function , we did this because we want that after signup also a session should be created 
            const user = new User({...req.body,password:hashedPassword,salt});
            const doc = await user.save()
            // this req.login also calls serializer and adds to session 
            req.login(sanitizeUser(doc),(err)=>{
                if(err){
                    res.status(400).json(err);
                }
                else{
                    const token=jwt.sign(sanitizeUser(doc), SECRET_KEY);
                    res.status(201).json(token)
                }
            })
            // Product.save is different from insert because if you will provide id to it so it will behave as update but if no id so it will work as normal insertion 
            res.status(201).json(sanitizeUser(doc))
        });
    }catch(err){
        console.log(error)
        res.status(400).json(err)
    }
}
exports.loginUser = async(req,res)=>{
    res.json(req.user)
}
exports.checkUser = async(req,res)=>{
    res.json(req.user)
}