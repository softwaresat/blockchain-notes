const bcrypt = require('bcrypt');
const fs = require("fs");
class Block{

    constructor(blockid, previousHash, data){
        this.blockid = blockid;
        this.timestamp = Date.now();
        this.blockhash = this.getHash();
        this.prevHash = previousHash;
        this.data = data;
    }
    getHash(){
        return bcrypt.hashSync(String(this.blockid + this.timestamp + this.blockhash + this.previousHash + JSON.stringify(this.data)) , 10) // this method will hash the data in the block using a salt of 10 and return that hash. We use the bcrypt library
    }

}

class BlockChain{
    constructor(){
        this.chain = [];
    }

    addBlock(data){
        let blockid = this.chain.length;
        let previousHash =  this.chain.length !== 0 ? this.chain[this.chain.length - 1].blockhash : '';
        let block = new Block(blockid, previousHash, data)
        this.chain.push(block); 
       
    }
    getBlockData(hash){
        for(var i = 0; i < this.chain.length; i++){
            if(this.chain[i].blockhash == hash){
                return this.chain[i].data;
            }
        }
    }
    getBlockHash(data){
        for(var i = 0; i < this.chain.length; i++){
            if(this.chain[i].data == data){
                return this.chain[i].blockhash;
            }
        }
    }
}




// fs.writeFile("block.json", JSON.stringify(testChain), 'utf8', function (err) {
//     if (err) {
//         console.log("An error occured while writing JSON Object to File.");
//         return console.log(err);
//     }
// })
const express = require('express')

const app = express()
const router = express.Router();
app.set("view engine", "ejs");
app.set("views", "./views");

const https = require('https')
var http = require('http').Server(app);

const { response } = require('express');


const notes = new BlockChain();


app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));





app.get('/', function (req, res) {
res.render('index');
})

app.post('/newNote', function(req, res){
    notes.addBlock(req.body.note);
    res.send("Share your note with this link: localhost:3000/viewnote?hash="+notes.getBlockHash(req.body.note))
    res.end();
})
app.post('/findNote', function(req, res){
    res.redirect("/viewnote?hash="+req.body.hash);
})
app.get('/viewnote', function(req, res){
    res.send(notes.getBlockData(req.query.hash));

})



app.listen(3000, () => console.log('Server is live on port 3000!'))