// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
const dbUrl=process.env.DBURL;
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const url= require('url');
const shortid=require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$&');
const validUrl=require('valid-url');

app.use(bodyParser.urlencoded({extended:true}))


// create a Schema

const ulrSchema=mongoose.Schema({
  originUrl:{type:String},
  hash:{type:String,unique:true}
})
const schema=mongoose.model('url',ulrSchema)
// connect to database Mlb
mongoose.connect(dbUrl,(err,res)=>{
if(err){
 console.log(err)
}
  console.log('db conndected')

})

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

//http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
  
});

// get short url param and redirect

app.get('/:url',(req,res)=>{
  
  // connect to db and get collection
  mongoose.connect(dbUrl,(err,db)=>{
    if(err){
    console.log(err)
    }
    let collection=db.collection('urls')
    let urlParam=req.params.url;
    collection.findOne({'hash': urlParam},'originUrl hash',(err,result)=>{
    // if the hash doesn't exit in db
    if(err){
    console.log('the has doesnt exist')
    }

    // if the param match from db

    if(!result){
    res.end(`<h1>Result Not Found!</h1><br><p> Please try with an other Shorturl --></p>`)
    }else{
    res.redirect(result.originUrl)
    }

    })

  })
 


})

// get url params using route

app.route('/new/:url(*)').get((req,res,next)=>{
   let paramUrl=req.params.url;
  
  // if valid url
  if(validUrl.isUri(paramUrl)){
    
    // generate id
    let id=shortid.generate(); 
    
    // save to db
    saveToDB(paramUrl,id)
    var fullUrl = req.protocol + '://' + req.get('host') ;
    // send response
    res.send({
    'url':paramUrl,
    'Shorturl':`${fullUrl}/${id}`
  })}
  // if is invalid url
  else{
    res.send({
   'url':'invalid url'
  })
    
    }
  
  
})


// save to db function

const saveToDB=(param,hash)=>{
   const dataurl={
   originUrl:param,
    hash:hash
  }
 
let data=new schema(dataurl);
 
  
  data.save()
  .then(doc=>{
   console.log('data inserted succefully')
  }).catch(err=>{
   console.log(err)
    
  })

}



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
