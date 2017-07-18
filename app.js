let express=require('express');
let app = express();
let exphbs=require('express-handlebars');
let hbs= exphbs.create({extname:'hbs',defaultLayout:'main'});
let routes= require('./lib/routes');

app.engine('hbs',hbs.engine);
app.set('view engine','hbs');
app.use(express.static(__dirname+'/public'));
app.set('port',process.env.PORT||8080);

routes(app);

app.listen(app.get('port'),()=>{
    console.log(`App in ${app.get('env')} on http://localhost:${app.get('port')}. Press Ctrl-C to terminate.`)
});