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
import GitHubStrategy from 'passport-github';//for lvl 6 oauth
import findOrCreate from "mongoose-findorcreate";//for lvl 6 oauth
//import to use findorCreate function of mongoose for level6



//APP consts
const app = express();
const port = process.env.PORT;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
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
    saveUninitialized: false, 
    // cookie: { secure: true }
}))
//always write this below the app.use(session) as seen above all this is lvl5
app.use(passport.initialize()); //read more on passport documentation to understand
app.use(passport.session());


//connecting to the server
mongoose.connect(process.env.DB, {useNewUrlParser: true,useUnifiedTopology: true});

// schemas 
const secretSchema= new mongoose.Schema({ 
    secrets: String,
    username: String
})

const userSchema= new mongoose.Schema({ 
    username: {type: String},
    Password: {type: String},
    githubId: {type: String},
    secrets: [],
    usernameSecrets:[],
    // googleId: String, //when using lvl 6 so it gets the user id saved on 
    //our db when we get the info from google.
    //so next time, we dont have to worry about duplicate data in db. 
    //google controls the pw and other data. all we have is the data we get from 
    //google and we don't have to border about pw leak. however we can save other data
})

//passportLocalMongoose is set below the schema to be used on
userSchema.plugin(passportLocalMongoose);
//plugin to use findorCreate function of mongoose for level6
userSchema.plugin(findOrCreate); 

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
    // User.register({username: req.body.username}, req.body.password, function(err, user) {
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
// app.post("/login", 
// passport.authenticate('local', { failureRedirect: '/register', failureMessage: true }),
// function(req, res) {
//   res.redirect('/secrets');
// }
// );
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
passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
      });
    });
  });
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/github/secrets"
},
function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(err, User);
    });
  }
));
//Define Const 

//define routes and axios request if needed
//get routes
//displays home page
app.get("/", (req, res)=>{
    res.render("home");
});
//displays login page
app.get("/login", (req, res)=>{
    res.render("login");
});
//displays register page
app.get("/register", (req, res)=>{
    res.render("register");
});
//displays submit page
app.get("/submit", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }
});
//logout functions works
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
//needs work to render to secrets ejs page
app.get("/secrets", async(req, res)=>{
    //how to use level5 to authenticate a user before using a anypage 
    //granting page priviledges to only authenticated users
    // if(req.isAuthenticated()){
    //     const response = await Secret.find({});
    //     // console.log(response);
    //     res.render("secrets", {secrets: response, defaultSecret:"Jack Bauer is my hero."});
    // }else{
    //     res.redirect("/login");
    // }
    if(req.isAuthenticated()){
        // console.log(req.user.id+"secrets");
        // const foundUsers = await User.find({"secrets": {$ne: null}})
        // const foundUsers = await User.find({}, {secrets: 1});
        // var foundUsers = await (await User.find({})).map(mySecrets);
        // function mySecrets(item){
        //     return item.secrets;
        // }
        var foundSecrets = await Secret.find({});
        // console.log(foundSecrets);
        // const nowhg = foundUsers.map(mySecrets);
        // res.json(foundUsers);
        if (foundSecrets) {
            res.render("secrets", 
                {displaysecrets: foundSecrets,
                defaultSecret:"Jack Bauer is my hero.", 
                defaultSecretUser:"Angela"});
        }
    }else if (!req.isAuthenticated()) {
        res.redirect("/login");
    }
});
//get req for oauth
app.get('/auth/github',
  passport.authenticate('github')
);

app.get('/auth/github/secrets', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
    // console.log("your are here")
});

;//post routes
//confirm if login function it needs work
// good technique using passport//done
app.post("/login", 
passport.authenticate('local', { failureRedirect: '/register', failureMessage: true }),
function(req, res) {
  res.redirect('/secrets');
}
);


//confirm if register function it needs work //good//done
app.post("/register", async(req, res)=>{
    User.register({username: req.body.username}, req.body.password, function(err, user) {
            if (err) { 
                console.log(err);
                res.redirect("/register");
            }else{ 
                passport.authenticate("local")(req,res, function(){
                    res.redirect("/secrets");
                });
            }
        });
});

//detect how to save usersecrets in db // workon //done
app.post("/submit", async(req, res)=>{
    // const newPost = req.body.secret;
    const submittedSecret = req.body.secret;
    const secretuserName = new Secret({
        secrets: req.body.secret,
        username: req.body.secretuserName
    });    
    //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
      // console.log(req.user.id);
    //   const foundUser =await User.updateOne({_id: req.user.id}, {$set:{secrets: submittedSecret}})
    // const foundUser = await User.insertMany({ secrets: submittedSecret});
    if (req.isAuthenticated()){
        await User.updateOne({_id: req.user.id}, 
            {$push: {secrets: submittedSecret, usernameSecrets: req.body.secretuserName}});
        const foundSecrets = await Secret.insertMany(secretuserName);
        if (foundSecrets){
            res.redirect("/secrets");
        }
    }else{
        res.redirect("/login");
    }
    // console.log (foundUser);
    //   res.redirect("/secrets");
        //   if (foundUser) {
        //     foundUser.secrets = submittedSecret;
        //     foundUser.save(function(){
        //       res.redirect("/secrets");
        //     });
        //   }
        
    // const newSecret = new Secret({
    //     Secrets: newPost,
    //     dislikes: req.body.dislikes, 
    //     likes: req.body.likes,
    //     Comments: req.body.Comments,
    // });
    // newSecret.save();
    // await Secret.insertMany(newSecret);
    // console.log(newSecret);
    // const foundUser = req.user;
    // console.log(foundUser)
    // if(foundUser){
    //     foundUser.secrets = newPost;
    //     await User.insertMany(foundUser);
    //     res.redirect("/secrets");
    // }
    // res.render("/secrets");
});

//put routes // if you need to update the whole data set i.e edit our secret
// app.put("/new", (req, res)=>{
//     res.render("secrets");
// });


//listen routes
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});