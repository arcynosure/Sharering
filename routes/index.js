var express = require('express');
var router = express.Router();
const BnbApiClient = require('@binance-chain/javascript-sdk');
const WAValidator = require('wallet-address-validator');


/* GET home page. */
router.get('/step1', function(req, res) {
  if(validateBNBAddress(req.body.bnbaddress)){
    if(validateETHAddress(req.body.ethaddress)){
      if(validateAmount(req.body.amount)){

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
  res.render('step1');
});

function validateBNBAddress(address) {
  const addressValid = BnbApiClient.crypto.checkAddress(address);
  return addressValid
}

function validateETHAddress(valid) {
  const valid = WAValidator.validate(address, 'ETH');
  return valid
}

function validateAmount(amount) {
  if (typeof amount != "number") {
    return amount
  }
}

module.exports = router;
