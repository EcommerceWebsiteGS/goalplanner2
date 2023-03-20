const express = require('express')
const app = express()

const bodyParser = require("body-parser")
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const nodemailer = require('nodemailer');

const secretKey = 'gauravsourav';
let TOKEN;

const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended:true }));
app.use(methodOverride("_method"));

app.use(express.json());
app.use(cookieParser());

//let loggedin = false;

//db connection
mongoose.connect("mongodb+srv://root:root@cluster0.jypbz.mongodb.net/goal_tracker")
.then(() => console.log('Db connected'))
.catch((err) => console.log(err));

//User info table
var userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    otp:String
})

const User = mongoose.model("User",userSchema);
// ################################
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
  });
  
  // create a model for the contact form data
  const Contact = mongoose.model('Contact', contactSchema);
//Goal info table
var goalSchema = new mongoose.Schema({
    goal:String,
    start_date:String,
    end_date:String,
    desc: String,
    user_id: String
})
const Goal = mongoose.model("Goal",goalSchema);

// ################################
const PORT = 3008 || process.env.PORT

function formatDate(date) {
    date = new Date(date);
    const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
    const month = `${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`;
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

function randomNumberGeneratorForOtp()
{
    const min = 100000; 
    const max = 999999; 
    let randomNum = Math.floor(Math.random() * (max - min + 1)) + min; 
    return randomNum;
}

// async function expire_otp_after_10min(id)
// {
//     let searched_user = await User.findById(id);
//     console.log('in expire_otp_after_10min');
//     console.log(id);
//     console.log(searched_user);
//     searched_user.otp = "";

//     await User.findByIdAndUpdate(id, searched_user);
// }

/////////////////////////////////
// Email Notification
//Etheral
async function sendVerificationEmail1(user_email) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    //let testAccount = await nodemailer.createTestAccount();
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'sydnee.ebert@ethereal.email', // generated ethereal user
        pass: 'wH6QaN7auQ9auFC2DC', // generated ethereal password
      },
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: 'sydnee.ebert@ethereal.email', // sender address
      to: user_email, // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
  
  //main().catch(console.error);
/////
function textSentToUserOnRegister()
{
    const text = "Welcome " +user_name + " to Goal Planner!!! \n \
    Goal Planner is a web-based application that helps you set and achieve your personal and professional goals. Our platform provides you with the tools and resources you need to stay organized, track your progress, and stay motivated as you work towards your goals. \
    Our mission is to help individuals reach their full potential by providing a simple and effective way to set and achieve their goals. Whether you're looking to improve your health and fitness, advance your career, or pursue a personal passion, Goal Planner can help you get there."

    return text;
}

function sendVerificationEmail(user_email, text, subject)
{
    console.log('in sendVerificationEmail func')
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'goalplannergs@gmail.com',
        pass: 'jhvnvbnqiutbzuoz'
    }
});

let message = {
    from: 'goalplannergs@gmail.com',
    to: user_email,
    subject: subject,
    text: text
};

transporter.sendMail(message, function(error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});

}


///////////////////////////////

//Middleware func
//check if user is logged in
// async function isAuthenticated(id)
// {
//     const user = await User.findById(id);
//     return user.logStatus
// }
async function retrieveGoalsById(id)
{
    let goals = await Goal.find({user_id:id})
    return goals;
}
function verifyJwtToken(req,res,next)
{
    const token = req.cookies.token;
    //decode token and retrieve user_id
    
    console.log('token:middleware:',token)
    if(typeof token !== 'undefined')
    {

        jwt.verify(token, secretKey, (err, authData)=>{
            if(err)
            {
                console.log('Not authorized');
                res.redirect('/login');
            }
            else{
                //req.token = logic
                console.log('authData: ',authData.searched_user._id)
                if(req.params.id === authData.searched_user._id)
                {
                    next();
                }
                else{
                    // req.newUserId = authData.searched_user._id
                    // console.log('#id1:', req.newUserId);
                    // next();
                    res.redirect('/login');
                }
                
            }
        })
        
    }
    else{
        console.log('token expired/invalid');
        res.redirect('/login');
    }
}
//password hash and unhash func
//hash password

// function hash_password(myPlaintextPassword)
// {
//     //let hashed_password = ''
//     let hashed_password = bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
//         // Store hash in your password DB.
//         console.log('in hash****************')
//        // hashed_password += hash;
//     });
//     return hashed_password;
// }

// //compare plain password with hashed password
// function compare_password(myPlaintextPassword, hash)
// {
//     let password_matched = false;
//     bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
//         password_matched = result;
//     });

//     return password_matched;
// }


app.get('/',(req,res)=>{
    res.render('home');
})

app.get('/reset', (req,res)=>{
    res.render('reset_password' ,{otp_form: false});
})

app.post('/reset/:email', async (req,res)=>{
    //check email in db
    const email = (req.params.email == 'undefined')? req.body.email : req.params.email;
    const checked_user = await User.findOne({email: email})


    if(checked_user)
    {
        // email is correct, send otp to email
        let otp = randomNumberGeneratorForOtp().toString();
        let subject = "Otp verification";
        let text = "Your Otp: " + otp;
        sendVerificationEmail(email, text, subject);
        const id = checked_user._id;
    
        checked_user.otp = otp;
    
        await User.findByIdAndUpdate(id, checked_user);
        
        setTimeout(async function expire_otp_after_10min()
        {
            let searched_user = await User.findById(id);
            console.log('in expire_otp_after_10min');
            console.log(id);
            console.log(searched_user);
            searched_user.otp = null;
        
            await User.findByIdAndUpdate(id, searched_user);
        }, 600000);
        res.render('reset_password', {otp_form: true, user: checked_user})

    }
    else{
        console.log('This email is not registered with us!');
        res.redirect('/signUp');
    }
})

app.post('/otp_verification/:email',async  (req,res)=>{
    const email = req.params.email;
    let searched_user = await User.find({email: email})
    console.log(searched_user[0]);
    const id = searched_user[0]._id;
    let otp = req.body.otp;
    console.log(searched_user[0].otp, otp);

    if(searched_user[0].otp === otp)
    {
        //otp is correct
        // render reset password form page
        res.render("reset_form", {user_id: id});
    }
    else{
        console.log("Otp does not match");
        res.render("reset_password",{otp_form: true, user: searched_user[0]});
    }

    
})

app.post('/reset_password/:id', async (req,res)=>{
    let password = req.body.pass1;
    let id = req.params.id;
    let user = await User.findById(id);
    let hashed_password = bcrypt.hashSync(password, saltRounds);
    user.password = hashed_password;
    await User.findByIdAndUpdate(id, user);
    // send mail to user stating password reset
    let text = "Your password is succesfully reset\n Please login using new password";
    let subject = "Reset password Intimation";
    sendVerificationEmail(user.email, text, subject);
    res.redirect('/login');

})

app.get('/home/:id',verifyJwtToken,async (req,res)=>{
    //console.log('#id2:', req.para);
    const user = await User.findById(req.params.id);
        //res.send('Login Successful');
        //retrieve goal of logged in user
        let goals = await retrieveGoalsById(req.params.id);
        console.log('Printing goals of logged in user:')
        console.log(goals);
        res.render('goal_page', {id: req.params.id, goals: goals})
        
        console.log('Logged in user: ', user)

})

app.get('/login',(req,res)=>{
    res.render('login')
})
app.get('/about',(req,res)=>{
    res.render('about')
})
app.get('/contact',(req,res)=>{
    res.render('contact')
})
app.post('/contact', async (req, res) => {
    try {
      const { name, email, message } = req.body;
  
      // validate the input data
      if (!name || !email || !message) {
        throw new Error('All fields are required');
      }
  
      // create a new contact instance with the input data
      const contact = new Contact({ name, email, message });
  
      // save the contact to the database
      await contact.save();
  
      // redirect to a thank-you page
      res.redirect('/contact');
    } catch (error) {
      // return an error message to the user
      res.status(400).json({ error: error.message });
    }
  });

app.get('/logout/:id',async (req,res)=>{
    let user = await User.findById(req.params.id);
    //user.logStatus = false;
    //await User.findByIdAndUpdate(req.params.id, user);
    res.clearCookie("token");
    console.log('logged out user:', user);
    res.redirect('/');
})

app.post('/login',async (req,res)=>{
    //res.send('login page')
    //check if user exist in db
    const {email, password} = req.body;
    let searched_user = await User.findOne({email}).exec();
    if(searched_user)
    {
        //check for password
        //if(searched_user.password == password)

        //if(compare_password(password, searched_user.password))
        if(bcrypt.compareSync(password, searched_user.password))
        {
            //password matched
            console.log('pass: ',searched_user);
            const id = searched_user._id;
            await User.findByIdAndUpdate(id, searched_user)
            //loggedin = true;
            

            //Generate jwt token
            jwt.sign({searched_user}, secretKey, {expiresIn: '1000s'}, (err, token)=>{
                console.log('#token: '+token);
                //TOKEN = token;
               // res.json({ token });
                res.cookie('token', token, { expires: new Date(Date.now() + 86400000), httpOnly: true, secure: true });
                res.redirect('/home/'+searched_user._id);
            })

            

        }
        else{
            console.log('password invalid');
            res.redirect('/login');
        }
    }
    else{
        console.log("Email doesn't exist");
        res.redirect('/login');
    }

})

app.get('/signUp',(req,res)=>{
    res.render('signup')
})

app.post('/signUp',async (req,res)=>{
    //res.send('signUp page')
    //save user data to db
    const myPlaintextPassword = req.body.password

    let hashed_password = bcrypt.hashSync(myPlaintextPassword, saltRounds);
    let user = {
        name: req.body.name,
        email:req.body.email,
        password: hashed_password,
    }
    const email = req.body.email;
    console.log(user);
    console.log('email: ', user.email);
    const searched_user = await User.findOne({email}).exec();
    console.log('searched_user: ',searched_user)
    if(searched_user)
    {
        console.log('user already exist')
        res.redirect('/login')
    }
    else{
        let subject = 'Succesfully SignedUp in GoalPlanner';
        let text = "Welcome " +req.body.name + " to Goal Planner!!! \n \
        Goal Planner is a web-based application that helps you set and achieve your personal and professional goals. Our platform provides you with the tools and resources you need to stay organized, track your progress, and stay motivated as you work towards your goals. \
        Our mission is to help individuals reach their full potential by providing a simple and effective way to set and achieve their goals. Whether you're looking to improve your health and fitness, advance your career, or pursue a personal passion, Goal Planner can help you get there."
        sendVerificationEmail(email, text, subject);
    await User.create(user);
    res.redirect('/login')
    }

    

})

//Goals route:
app.post('/goals/:id',verifyJwtToken, async(req,res)=>{
    
    console.log('goal in post:')
    console.log(typeof req.params.id)
    console.log(req.body)

        console.log('+token: ',TOKEN);
        let newGoal = {
            goal:req.body.goal,
            start_date: formatDate(req.body.start_date),
            end_date:formatDate(req.body.end_date),
            desc: req.body.desc,
            user_id:req.params.id
        }
        await Goal.create(newGoal);
    res.redirect('/home/'+ req.params.id)
})

app.get('/goals/:id/:goal_id/edit',verifyJwtToken, async (req,res)=>{
        let goal = await Goal.findById(req.params.goal_id);
        res.render('edit_goal',{goal:goal});

})

app.put('/goals/:id/:goal_id/edit',verifyJwtToken, async (req,res)=>{
        let originalGoal = await Goal.findById(req.params.goal_id);
        let passedGoal = req.body.goal
        for(let key in passedGoal)
        {
            if(passedGoal[key] === '')
            {
                passedGoal[key] = originalGoal[key];
            }
        }
        // let updatedGoal = {
        //     ...originalGoal,
        //     passedGoal
        // }
        await Goal.findByIdAndUpdate(req.params.goal_id, passedGoal);
        res.redirect('/home/'+req.params.id);
})

app.delete('/goals/:id/:goal_id/',verifyJwtToken, async (req,res)=>{
        await Goal.findByIdAndDelete(req.params.goal_id);
        res.redirect('/home/'+req.params.id);
})

app.listen(PORT, ()=>{
    console.log('server is running at port: ', PORT);
})