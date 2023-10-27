// import 'dotenv/config';  
const express = require ("express");
const bodyParser = ("body-parser");
const mongoose = ("mongoose");
const ejs = ("ejs");
const session = ('express-session'); 
const passport = ( 'passport');
const passportLocalMongoose = ('passport-local-mongoose');
const GitHubStrategy = ('passport-github');
const findOrCreate = ("mongoose-findorcreate");

const app = express();
const port = process.env.PORT;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false, 
}))
app.use(passport.initialize()); 
app.use(passport.session());


mongoose.connect(process.env.DB, {useNewUrlParser: true,useUnifiedTopology: true});

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
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate); 

const Secret = mongoose.model("Secret", secretSchema);
const User = mongoose.model("User", userSchema);

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
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(err, User);
    });
  }
));
app.get("/", (req, res)=>{
    res.render("home");
});
app.get("/login", (req, res)=>{
    res.render("login");
});
app.get("/register", (req, res)=>{
    res.render("register");
});
app.get("/submit", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }
});
app.get("/logout", (req, res)=>{
    req.logout(function(err) {
        if (err) { 
            console.log(err); 
        }else{ 
            res.redirect("/");
        }      
      });
});
app.get("/secrets", async(req, res)=>{
    
    if(req.isAuthenticated()){
        var foundSecrets = await Secret.find({});
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
app.get('/auth/github',
  passport.authenticate('github')
);

app.get('/auth/github/secrets', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/secrets');
});


app.post("/login", 
passport.authenticate('local', { failureRedirect: '/register', failureMessage: true }),
function(req, res) {
  res.redirect('/secrets');
}
);


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

app.post("/submit", async(req, res)=>{
    const submittedSecret = req.body.secret;
    const secretuserName = new Secret({
        secrets: req.body.secret,
        username: req.body.secretuserName
    });    
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
    
});

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});