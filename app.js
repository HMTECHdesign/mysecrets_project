import 'dotenv/config'  // needed to save secrets for level 2 to be completed
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import ejs from "ejs";
import encrypt from "mongoose-encryption";

mongoose.connect('mongodb+srv://hamzy:mailme@cluster0.xm7no60.mongodb.net/SecretDb', 
{useNewUrlParser: true});

//APP consts
const app = express();
const port = process.env.PORT;
// console.log(port);process.env.PORT is to refer to the .env file

// Middleware
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// schemas 
const secretSchema= new mongoose.Schema({ 
    Secrets: String,
    dislikes: Number, 
    likes: Number,
    Comments: String,
})

const userSchema= new mongoose.Schema({ 
    email: {type: String},
    Password: {type: String},
})

//encrypting the password for level 2 auth this should be right before the model
//encryptedFields is used to sepcify the fields(1 or more fields using ,) 
//you want to encrypt
//without the encryptedFields{secret: secret} you encrypt all fields within 
//d schema
//Nb: the secret key has been moved to the env file for protection leaving 
//it here is same has having a level 1 auth but saving in .env is completing lvl 2
//check .env for secrets
// this secrets is rqd for our secret to be encrypted. 
//but it needs to be moved to env files

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:['Password']});

//and Models
const Secret = mongoose.model("Secret", secretSchema);
const User = mongoose.model("User", userSchema);


//Define Const 

//define routes and axios request if needed
//get routes
app.get("/", (req, res)=>{
    res.render("home");
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.get("/register", (req, res)=>{
    res.render("register");
});

app.get("/secrets", (req, res)=>{
    res.render("secrets");
});
//post routes
app.post("/login", async(req, res)=>{
    const userName = req.body.username;
    const passWord = req.body.password;
    const findUser =await User.findOne({email: userName});
    // res.send(findUser.email);
    // console.log
    if (findUser){
        if (findUser.Password === passWord){
         res.render("secrets");
        // res.send(findUser.email);
        }else{
            res.render("login");
        }     
    }else{
        res.render("register");
    }
});
app.post("/register", async(req, res)=>{
    const userName = req.body.username;
    const passWord = req.body.password
    const findUser = await User.findOne({email: userName});
    console.log(findUser);  
    if (findUser){
        res.redirect("/login");
        // res.send("you exist")
    } else if(!findUser){
            // res.send("you do not exist")}
        const newUser = new User({
            email:    userName,
            Password: passWord,
        }).save() // important to use .save() for encryption plugins to work
        
        const seePosts = await User.insertMany(newUser);
        console.log(seePosts);
        if (seePosts){
            res.redirect ("/secrets")
            // res.send("you're NOt welcome")
        }else{
            res.status(404)
        }
    }
    
});

//put routes //work on
app.put("/new", (req, res)=>{
    res.render("secrets");
});


//listen routes
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});