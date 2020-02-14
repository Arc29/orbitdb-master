const Web3=require('web3')
const add=(userDatabase)=>async (req,res)=>{
    const {name,email,uid,phoneNo,ethAddress} = req.body;
    await userDatabase.load();
    if(!name||!email||!uid||!phoneNo||!ethAddress)
    return res.status(400).json('All details should be provided')
    // try {
    //     const address = require('web3').default.utils.toChecksumAddress(ethAddress)
    //   } catch(e) { 
    //     return res.status(400).json('Address is invalid')
    //   }
    
    if(!Web3.utils.isAddress(ethAddress))
    return res.status(400).json('Address is invalid')
    const data=userDatabase.get(ethAddress)
    if(data)
   
    return res.status(400).json('User is already added!')
    const hash=await userDatabase.put(ethAddress,{name,email,uid,phoneNo});
    return res.json('User successfully added: '+hash)
}

const getName=(userDatabase)=>async (req,res)=>{
    const {ethAddress}=req.params;
    userDatabase.load();
    // try {
    //     const address = require('web3').default.utils.toChecksumAddress(ethAddress)
    //   } catch(e) { 
    //     return res.status(400).json('Address is invalid')
    //   }
    if(!Web3.utils.isAddress(ethAddress))
    return res.status(400).json('Address is invalid')
    // console.log(ethAddress)
    const data=userDatabase.get(ethAddress)
    if(!data)
    return res.status(400).json('User not authorized!')
    return res.json({name:data.name});

}

module.exports=({add,getName})