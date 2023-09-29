import 'dotenv/config'  // needed to save secret key or anything we wish to keep away from here for level 2 to be completed
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import ejs from "ejs";
// import encrypt from "mongoose-encryption"; needed for lvl 2 encryption
//import md5 from 'md5';   //needed for lvl3 encryption you could use bycrpt in levl3 too
// import bcrypt from "bcrypt"; //needed for level 4
import session from 'express-session'; //needed for level 5
import passport from 'passport';//needed for level 5
import passportLocalMongoose from 'passport-local-mongoose';//needed for level 5

//APP consts
const app = express();
const port = process.env.PORT;
// const saltRounds = 10;
// console.log(port);process.env.PORT is to refer to the .env file

// Middleware
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

//this is lvl 5 security using cookies
//import for cookies useage levl5 security to be placed below other app.use
//and above the mongoose.connect to db
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false, //changed to false by lecturer;it was true by default
    // cookie: { secure: true }
}))
//always write this below the app.use(session) as seen above all this is lvl5
app.use(passport.initialize()); //read more on passport documentation to understand
app.use(passport.session());



//connecting to the server
mongoose.connect(process.env.DB, {useNewUrlParser: true});

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
    // googleId: String, //when using lvl 6 so it gets the user id saved on 
    //our db when we get the info from google.
    //so next time, we dont have to worry about duplicate data in db. 
    //google controls the pw and other data. all we have is the data we get from 
    //google and we don't have to border about pw leak. however we can save other data
})

//passportLocalMongoose is set below the schema to be used on
userSchema.plugin(passportLocalMongoose);
secretSchema.plugin(passportLocalMongoose);

//encrypting the password for level 2 auth this should be right before the model
//encryptedFields is used to sepcify the fields(1 or more fields using,) 
//you want to encrypt
//without the encryptedFields{secret: secret} you encrypt all fields within 
//d schema
//Nb: the secret key has been moved to the env file for protection leaving 
//it here is same has having a level 1 auth but saving in .env is completing lvl 2
//check .env for secrets
// this secrets is rqd for our secret to be encrypted. 
//but it needs to be moved to env files

//pw lvls 1= we set the pw to be required from client side
//pw lvl2 = we have a secret file for our key using .env file using mongoose-encryption
//pw lvl3= we use hashing for our encryption so no secret key is rqd anymore, 
//here we using md5, there are other hash functions that can be used other than md5
//e.g bycrypt. 
//md5 hashes combinations can be pulled at 20b combinations per seconds 
//bcrypt is slower and can be pulled by computers at 17k combinations per second 
//lvl 4=  salting + (hashing(hash function used is bcrypt)(pw))= hashed reslts
//salting can be done in rounds more than one round so as to reduce the chances of 
//hackers getting clients passwords.
// each clients salts are saved in the db alongside with the hased reslts of the pw

//how to make the pw get encrypted with the secret key in .env file --lvl2- complete
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:['Password']});
// lvl2 removed cz we now want to use lvl3 

// how to use lvl3:     //md5(req.body.password)we need to get md5 wrapped up 
//in lvl 1 method to get to use lvl3 pw method. 

//how to use lvl 4 
        // how use salt and hash together lvl 4
        //const hash = await bcrypt.hash(passWord, saltRounds) 
        // Store hash in your password DB.
//Then you pass in the hash into the db when saving the user in the db as below:
//level 4 usuage as in below
//const newUser = new User({email:userName,Password: hash}).save()
// how to compare password saved as hash(salt+hash) lvl4 in the db
//const result = await bcrypt.compare(passWord, findUser.Password)
// result == true

// levl 5 is use of coookies and session cookies id. this is achieved via passport.
//does automated level 4 security when installed properly
//packages like passport,passport-local,passport-local-mongoose,express-session
//are installed and needed.look out for the typo errors to avoid debug.
//first step to use levl 5; import all except passport-local
//second use code as below where necessary
    ////this is lvl 5 security using cookies
    //import for cookies useage levl5 security to be placed below other app.use
    //and above the mongoose.connect to db
    // app.use(session({
    //     secret: process.env.SECRET,
    //     resave: false,
    //     saveUninitialized: false, //changed to false by lecturer;it was true by default
    //     // cookie: { secure: true }
    // }))
    // //always write this below the app.use(session) as seen above all this is lvl5
    // app.use(passport.initialize()); //read more on passport documentation to understand
    // app.use(passport.session());
//third use code as below where necessary
    // //passportLocalMongoose is set below the schema to be used on
    // userSchema.plugin(passportLocalMongoose);
    // secretSchema.plugin(passportLocalMongoose);
//forth use code as below where necessary
    // //levl 5 security is very important for the cookies to created 
    // //and interpreted when session is resumed
    // //This is set below the Model to be used on;
    // //usually is used for user login models cz 
    // //is basically to identify users and maintain security
    // // CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
    // passport.use(User.createStrategy());
    // passport.serializeUser(User.serializeUser());
    // passport.deserializeUser(User.deserializeUser());
    //or use this method to serialize and deserialize users 
    // // this method is better if you are using 3rd authentication
    // passport.serializeUser(function(User, cb) {
    //     process.nextTick(function() {
    //     cb(null, { id: User.id, username: User.email });
    //     });
    // });
    
    // passport.deserializeUser(function(User, cb) {
    //     process.nextTick(function() {
    //     return cb(null, User);
    //     });
    // });
//fifth use code as below where necessary inside registration route
    // //How to use passport for registration and user authentication
    // User.register({username: userName}, passWord, function(err, user) {
    //     if (err) { 
    //         console.log("error while register");
    //         res.redirect("/register");
    //     }else{ 
    //         passport.authenticate("local")(req,res, function(){
    //             res.redirect("/secrets");
    //         });
    //     }
    // });
//sixth use code as below where necessary whenever you want to authenticate users before
//using a page
        // if(req.isAuthenticated()){
        //     res.render("secrets");
        // }else{
        //     res.redirect("/login");
        // }
//7th having users to login req.login() is a function that helps look through the db
//then authenticate the users
        // const user = new User({
        //     username: userName, 
        //     password: passWord
        // })
        // req.login(user, function(err) {
        //     if (err) { 
        //         console.log(err); 
        //     }else{ 
        //             res.redirect("/secrets");
        //     }      
        //   });
//8th to have a user logout and end cookie session req.logout()
//automatically calls that function within passport
        // req.logout(function(err) {
        //     if (err) { 
        //         console.log(err); 
        //     }else{ 
        //         res.redirect("/");
        //     }      
        //   });

//level 6 authentication using OAUTH (OPEN STANDARD FOR TOKEN BASED AUTHORIZATION)
//make sure to follow documentation if using other 3rd party
//we use passport for google oauth  passport-google-oauth2.0
//step 1 set up app on 3rd party (google); so it would understand 
//when you make a get req
//challenge --couldnt complete a profile setup on google for authentication
    //for user profile
// step 1 import GoogleStrategy as describe in documentation
    // import GoogleStrategy from 'passport-google-oauth20';
//step 2 place this code in the necessary section right before 
//defining get routes, post, axios and const
        // passport.use(new GoogleStrategy({
        //     clientID: GOOGLE_CLIENT_ID,
        //     clientSecret: GOOGLE_CLIENT_SECRET,
        //     callbackURL: "http://www.example.com/auth/google/callback"
        //     //a deprecation might need and extra line of code for 
        //     //userprofile: "find this on stackoverflow"
        //   },
        //   function(accessToken, refreshToken, profile, cb) {
                            //console.log(profile)
        //     User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //       return cb(err, user);
        //     });
        //   }
        // ));
// step 3 place this code in the routes section
        //this code is important cz its the get req from our own 
        //login page or registration page the anchor tag or href tag links to this
        // here we use passport to make a request tog google to ask for a user profile
        // app.get('/auth/google',
        //   passport.authenticate('google', { scope: ['profile'] });
        //);

        // this is important cz we have set a route on google the 3rd party to send
        //the info we have request too this route.../auth/google/callback
        //therefore we use passport to receive that info and have ot registed in our db
        //automatically.
        // app.get('/auth/google/callback', 
        //   passport.authenticate('google', { failureRedirect: '/login' }),
        //   function(req, res) {
        //     // Successful authentication, redirect home.
        //     res.redirect('/secrets');
        // });



//and Models
const Secret = mongoose.model("Secret", secretSchema);
const User = mongoose.model("User", userSchema);

//levl 5 security is very important for the cookies to created 
//and interpreted when session is resumed
//This is set below the Model to be used on;
//usually is used for user login models cz 
//is basically to identify users and maintain security
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
// passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
//or use this method to serialize and deserialize users 
// this method is better if you are using 3rd authentication
passport.serializeUser(function(User, cb) {
    process.nextTick(function() {
      cb(null, { id: User.id, username: User.email });
    });
  });
  
  passport.deserializeUser(function(User, cb) {
    process.nextTick(function() {
      return cb(null, User);
    });
  });

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
    //how to use level5 to authenticate a user before using a anypage 
    //granting page priviledges to only authenticated users
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout", (req, res)=>{
    // how to logout in level 5 and to end cookies sessions
    req.logout(function(err) {
        if (err) { 
            console.log(err); 
        }else{ 
            res.redirect("/");
        }      
      });
});

app.get("/submit", (req, res)=>{
    res.render("submit");
});

;//post routes
app.post("/login", async(req, res)=>{
    const userName = req.body.username;
    const passWord = req.body.password; 
    //creating a const user to use the req.login() for level 5
    const user = new User({
        username: userName, 
        password: passWord
    })
    // const findUser =await User.findOne({email: userName});
    // // res.send(findUser.email);
    // // console.log
    // if (findUser){
    //     // how to compare password saved as hash(salt+hash) lvl4 in the db
    //     // const result = await bcrypt.compare(passWord, findUser.Password)
    //         // result == true
    //     // if (findUser.Password === passWord){ this is rqd through levels 1,2,3
    //     // if (result===true){this is rqd through level 4
    //     if (findUser){ // temp
    //         res.render("secrets");
    //            // res.send(findUser.email);
    //     }else{
    //         res.render("login");
    //     }     
    // }else{
    //     res.render("register");
    // }
    //how to login on level 5 using passport
    req.login(user, function(err) {
        if (err) { 
            console.log(err); 
        }else{ 
                res.redirect("/secrets");
        }      
      });
});
app.post("/register", async(req, res)=>{
    const userName = req.body.username;
    const passWord = req.body.password;
    // const findUser = await User.findOne({email: userName});
    // console.log(findUser);  
    // if (findUser){
    //     res.redirect("/login");
    //     // res.send("you exist")
    // } else if(!findUser){
    //     // res.send("you do not exist")}
    //     // how use salt and hash together lvl 4
    //     // const hash = await bcrypt.hash(passWord, saltRounds)  for level 4
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //         email:    userName,
    //         // Password: hash, for level 4
    //         Password: passWord,
    //     }).save() // important to use .save() for encryption plugins OF LEVL2 to work
    //     const seePosts = await User.insertMany(newUser);
    //     console.log(seePosts);
    //     if (seePosts){
    //         res.render ("secrets");
    //         // res.send("you're NOt welcome")
    //     }else{
    //         res.status(404)
    //     }
    // }
    //How to use passport for registration and user authentication levl5
        User.register({username: userName}, passWord, function(err, user) {
        if (err) { 
            console.log("error while register");
            res.redirect("/register");
        }else{ 
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets");
            });
        }
    });
});

//save usersecrets in db // workon
app.post("/submit", (req, res)=>{
})

//put routes // if you need to update the whole data set i.e edit our secret
// app.put("/new", (req, res)=>{
//     res.render("secrets");
// });


//listen routes
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});