var express = require('express');
var router = express.Router();
const BnbApiClient = require('@binance-chain/javascript-sdk');
const WAValidator = require('wallet-address-validator');
const ShareRing = require('../models/model');
const Web3 = require('web3');
var {Parser} = require('json2csv');

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://mainnet.infura.io'
  )
)


/* GET home page. */
router.post('/step1', function(req, res) {
  let body = Object.keys(req.query).length === 0 ? req.body : req.query;
  const bnb = body.bnbaddress;
  const eth = body.ethaddress;
  if(validateBNBAddress(body.bnbaddress)){
    if(validateETHAddress(body.ethaddress)){
      if(validateAmount(body.amount)){
        let sharering = new ShareRing({
          bnbAddress:bnb.toLowerCase(),
          ethAddress:eth.toLowerCase(),
          amount:parseFloat(body.amount)
        });
        sharering.save(function(err,data){
          if(err){
            console.log(err);
            return res.send({
              status:false,
              message:'Error saving data'
            });
          }
          else{
            return res.send({
              status:true,
              message:'Data saved'
            });
          }
         
        })
      }
      else{
        return res.send({
          status:false,
          message:'Invalid amount'
        })
      }

    }
    else{
      return res.send({
        status:false,
        message:'Invalid Eth Address'
      })
    }
  }
  else{
    return res.send({
      status:false,
      message:'Invalid bnb address'
    })
  }
});

router.get('/viewdata',(req,res)=>{
  ShareRing.find(function(err,data){
    if(err) console.log(err);
    return res.send({
      status:true,
      data:data
    });
  })
});



router.post('/step2', async(req,res) => {
  let body = Object.keys(req.query).length === 0 ? req.body : req.query;
  
  try{
  const status = await web3.eth.getTransaction(body.txhash);
  console.log(status);
  // console.log(`0x${status.input.substr(34,40)}`+'   '+parseInt(`0x${status.input.substr(74,64)}`)/100);
  const inputAddress = `0x${status.input.substr(34,40)}`;
  const checkAddress = '0x24baAB8dbDDc534657f2f118f31c251714872021';
  if(inputAddress.toUpperCase()==checkAddress.toUpperCase())
  {
  console.log('in');
  ShareRing.findOne({ethAddress:status.from.toLowerCase(),amount:parseInt(`0x${status.input.substr(74,64)}`)/100},function(err,data){

    if(err){
      return res.send({
        status:false,
        message:'Error in fetching data based on transaction hash'
      })
    }
    if(data==null){
      return res.send({
        status:false,
        message:'Error in fetching data based on transaction hash'
      })
    }
    console.log(data);
    ShareRing.updateOne({_id:data._id},{state:'success',updateTime:Date.now()},function(err,data){
      if(err) console.log(err);
      console.log(data);
      if (data){
        return res.send({
          status:true,
          message:'success'
        })
      }
    })
  
  
  });
}

  else{
    return res.send({
      status:false,
      message:'error'
    })
  }
}
catch(err){
  if(err.message==='Node error: {"code":-32602,"message":"invalid argument 0: hex string has length 22, want 64 for common.Hash"}'){
    return res.send({
      status:false,
      message:'Invalid transaction hash'
    })
  }
  return res.send({
    status:false,
    message:'Invalid transaction hash'
  })

  }

 
});


router.get('/export',function(req,res){
  ShareRing.find({state:'success'},function(err,data){
    if(err) console.log(err);
    if(data.length==0){
      res.send({
        status:false,
        message:'No completed transaction to export'
      })
    }
    else{
    let fields = ['bnbAddress','ethAddress','amount'];
    let fieldNames=['bnbAddress','ethAddress','amounts'];
    const json2csv = new Parser({ fields: fields, fieldNames: fieldNames });
    const csv = json2csv.parse(data);
    res.attachment('filename.csv');
    res.status(200).send(csv);
    }
  })
})


function validateBNBAddress(address) {
  const addressValid = BnbApiClient.crypto.checkAddress(address);
  return addressValid
}

function validateETHAddress(valid) {
  const validaddress = WAValidator.validate(valid, 'ETH');
  return validaddress
}

function validateAmount(amount) {
  if (typeof amount != "number") {
    return amount
  }
}



module.exports = router;
