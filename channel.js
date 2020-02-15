
const createChannel = (orbitdb, channelDatabase) => async (req, res) => {
    const { name, hash } = req.body;
    await channelDatabase.load();
    if (!name  || !hash)
        return res.status(400).json('All values not provided')
    const data = channelDatabase.query(doc => doc._id == name)
    if (data.length)
        return res.status(400).json('Channel already exists!')
    const options = {
        accessController: {
            write:['*']
        }
    }
    
    const db = await orbitdb.eventlog(name, options);
    channelDatabase.put({ _id: name, address: db.id, passHash:hash })
        .then(_ => res.json('Channel successfully created'))
        .catch(err => res.status(400).json('Error'))

}

// const subscribeChannel = (orbitdb,channelDatabase) => async (req, res) => {
//     const { id } = req.body;
//     const { name } = req.params;
//     await channelDatabase.load();
//     if (!name || !id)
//         return res.status(400).json('Channel name or subscriber id not provided')
//     const data = channelDatabase.query(doc => doc._id == name)
//     if (!data.length)
//         return res.status(400).json('Channel does not exist!')
        
    
    
//     const db = await orbitdb.eventlog(data[0].address);
//     await db.load()
//     console.log(db.access)
//     await db.access.grant('write', id)
//     return res.json('User successfully subscribed')
    

// }

const getChannel= (channelDatabase) => async (req,res)=>{
    const {channelName}=req.params;
    await channelDatabase.load()
    const data = channelDatabase.query(doc => doc._id == channelName)
    // console.log(data)
    if (!data.length)
        return res.status(400).json('Channel does not exist!')
    return res.json({address:data[0].address,hash:data[0].passHash})
}

const getAllChannels= (channelDatabase) => async (req,res)=>{
    await channelDatabase.load()
    const data = channelDatabase.query(doc => doc._id)
    // console.log(data)
    
    return res.json({address:data})
}

module.exports=({createChannel,getChannel,getAllChannels})