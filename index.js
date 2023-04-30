const bcrypt = require('bcrypt');
const sqlite = require('sqlite3');
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
}

const testChain = new BlockChain();

testChain.addBlock("testdjslfjaskdfj;")
testChain.addBlock("343291840;")

fs.writeFile("block.json", JSON.stringify(testChain), 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
})