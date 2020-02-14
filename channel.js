
const createChannel = (orbitdb, channelDatabase) => async (req, res) => {
    const { name, id } = req.body;
    await channelDatabase.load();
    if (!name || !id)
        return res.status(400).json('Channel name or creator id not provided')
    const data = channelDatabase.query(doc => doc.name == name)
    if (data.length)
        return res.status(400).json('Channel already exists!')
    const options = {
        accessController: {
            type: 'orbitdb', //OrbitDBAcGETcessController
            write: [id]
        }
    }
    var token
    // require('crypto').randomBytes(48, function (err, buffer) {
    //     token = buffer.toString('hex');
    // });
    const db = await orbitdb.docs(name, options);
    channelDatabase.put({ _id: name, address: db.id })
        .then(_ => res.json('Channel successfully created'))
        .catch(err => res.status(400).json('Error'))

}

const getChannel= (channelDatabase) => async (req,res)=>{
    const {channelName}=req.params;
    await channelDatabase.load()
    const data = channelDatabase.query(doc => doc._id == channelName)
    // console.log(data)
    if (!data.length)
        return res.status(400).json('Channel does not exist!')
    return res.json({address:data[0].address})
}

module.exports=({createChannel,getChannel})