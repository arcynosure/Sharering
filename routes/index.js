var express = require('express');
var router = express.Router();
const BnbApiClient = require('@binance-chain/javascript-sdk');
const WAValidator = require('wallet-address-validator');
const ShareRing = require('../models/model');
const axios = require('axios');
const Web3 = require('web3');

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://mainnet.infura.io'
  )
)


/* GET home page. */
router.get('/step1', function(req, res) {
  if(validateBNBAddress(req.body.bnbaddress)){
    if(validateETHAddress(req.body.ethaddress)){
      if(validateAmount(req.body.amount)){
        let sharering = new ShareRing({
          bnbAddress:req.body.bnbaddress,
          ethAddress:req.body.ethaddress,
          amount:parseInt(req.body.amount)
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




router.get('/step2', async(req,res) => {
  const status = await web3.eth.getTransaction(req.body.txhash)
  console.log(status);
  // console.log(`0x${status.input.substr(34,40)}`+'   '+parseInt(`0x${status.input.substr(74,64)}`)/100);

  if(`0x${status.input.substr(34,40)}`=='0xe79eef9b9388a4ff70ed7ec5bccd5b928ebb8bd1')
  {
    console.log('in');
  ShareRing.findOne({ethAddress:status.from.toLowerCase(),amount:parseInt(`0x${status.input.substr(74,64)}`)/100},function(err,data){

    if(err) console.log(err);
    console.log(data);
    ShareRing.updateOne({_id:data._id},{state:'success'},function(err,data){
      if(err) console.log(err);
      console.log(data);
      if (data.nModified == '1'){
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
});







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
