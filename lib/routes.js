const firebase=require('firebase');
const credentials=require('./credentials');
firebase.initializeApp(credentials.firebaseconfig);
const auth=firebase.auth();
const db=firebase.database();

auth.onAuthStateChanged((user)=>{
    if(user)
        console.log(`${user}`);
    else
        console.log('Not logged in')

})

errorFlash= (req,res,next)=>{
    req.checkBody('username','Username is required').notEmpty();
    req.checkBody('mail','E-mail is required').notEmpty();
    req.checkBody('pass','Password is required').notEmpty();
    req.checkBody('cpass','Password mismatch').equals(req.body.pass);

    res.locals.errors=req.validationErrors();
    next();
}


module.exports=(app)=>{
    app.get('/',(req,res)=>{
        if(res.statusCode===303)
            return res.render('home',{title:"PicShare | Homepage",msg:'User created successfully. Log in'});

        res.render('home',{title:"PicShare | Homepage"})
    });

    app.get('/signup',(req,res)=>{
        res.render('signup',{title:"PicShare | Signup"})
    })

    app.post('/signup',errorFlash,(req,res)=>{
        if (res.locals.errors){
            res.render('signup',{title:"PicShare | Signup"})
        }
        else
        {
            auth.createUserWithEmailAndPassword(req.body.mail,req.body.pass).then(()=>{
                auth.signOut()
                res.redirect(303,'/');
            }).catch((err)=>{
                console.log(err.name);
            });
        }

    });
}