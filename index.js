const bcrypt = require('bcrypt');
const fs = require("fs");
const sqlite3 = require('sqlite3');

var db = new sqlite3.Database('blockchain.db');
db.run("CREATE TABLE if not exists notes(blockid integer, timestamp DATETIME, blockhash varchar(192), prevHash varchar(192), data text)");


class Block{

 
    constructor(blockid, prevHash, data, timestamp = Date.now(), blockhash = this.getHash()){
        this.blockid = blockid;
        this.timestamp = timestamp;
        this.blockhash = blockhash;
        this.prevHash = prevHash;
        this.data = data;
    }
    getHash(){
        return bcrypt.hashSync(String(JSON.stringify(this.data)) , 10) // this method will hash the data in the block using a salt of 10 and return that hash. We use the bcrypt library
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
        db.run('insert into notes(blockid, timestamp, blockhash, prevHash, data) values(?,?,?,?,?)', [blockid, block.timestamp, block.blockhash, previousHash, block.data]);

       
    }
    restoreBlock(blockid, timestamp, blockhash, prevHash, data){
        let block = new Block(blockid, prevHash, data, timestamp, blockhash)
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
    verifyIntegrity(){
        let tampered = false;
        this.chain.forEach(block => {
            bcrypt.compare(String(JSON.stringify(this.data)), block.blockhash, function(err, result) {
                if(!result){
                    tampered = true;
                }
            });
        });
        for(var i = 0; i < this.chain.length-1; i++){
           
                if(this.chain[i+1].prevHash != this.chain[i].blockhash){
                    tampered = true;
                }
            
        }
        return tampered;
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
app.set("views", "./views");

const https = require('https')
var http = require('http').Server(app);

const { response } = require('express');


const notes = new BlockChain();
db.all("SELECT * FROM notes", async (err, results) => {
    if(results){
        results.forEach(block => {
            notes.restoreBlock(block.blockid, block.timestamp, block.blockhash, block.prevHash, block.data);
           });
    }
  
});
function reset(){
    console.log("Resetting...")
    notes = new BlockChain();
db.all("SELECT * FROM notes", async (err, results) => {
    if(results){
        results.forEach(block => {
            notes.restoreBlock(block.blockid, block.timestamp, block.blockhash, block.prevHash, block.data);
           });
    }
  
});
}
app.use(express.static('views'))

app.set('view engine', 'ejs');

app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));




app.get('/', function (req, res) {
    const tampered = notes.verifyIntegrity();
    tampered ? reset() : console.log("Block chain has been validated!");
    console.log(notes);
res.render('index');
})

app.post('/newNote', function(req, res){
    notes.addBlock(req.body.note);
    res.send("Your hash: "+notes.getBlockHash(req.body.note))
    res.end();
})
app.post('/findNote', function(req, res){
    res.redirect("/viewnote?hash="+req.body.hash);
})
app.get('/viewnote', function(req, res){
    res.send(notes.getBlockData(req.query.hash));

})



app.listen(process.env.PORT || 3000, () => console.log('Server is live on port 3000!'))