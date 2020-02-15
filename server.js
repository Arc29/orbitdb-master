const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
const channel=require('./channel')
const user=require('./user')
/*
  This is the master node that creates the initial database. It is configured to
  use the Circuit Relay feature to help nodes communicate with one another.
*/

"use strict";

// CUSTOMIZE THESE VARIABLES
const CHANNEL_DB = "CHANNELS";
const USER_DB = "USERS";

const IPFS = require("ipfs");
const OrbitDB = require("orbit-db");
let orbitdb, channelDatabase, userDatabase
console.log("Starting...");
const getDatabase = async () => {
  const ipfs = new IPFS({
    repo: "./orbitdb/examples/ipfs",
    config: {
        "Addresses": {
          "Swarm": [
            "/ip4/127.0.0.1/tcp/4001",
            "/ip6/::/tcp/4001",
            "/ip4/127.0.0.1/tcp/4002/ws"
          ],
          "API": "/ip4/127.0.0.1/tcp/5001",
          "Gateway": "/ip4/127.0.0.1/tcp/8080"
        }
      },    
    start: true,
    EXPERIMENTAL: {
      pubsub: true
    },
    relay: {
      enabled: true, // enable circuit relay dialer and listener
      hop: {
        enabled: true // enable circuit relay HOP (make this node a relay)
      }
    }
  });


  await ipfs.ready;
  try {
    orbitdb = await OrbitDB.createInstance(ipfs, {
      directory: "./orbitdb/data/test0"
    });
    console.log(orbitdb.identity.id)
    const options = {
      accessController: {
        type: 'orbitdb', //OrbitDBAccessController
        write: [orbitdb.identity.id]
      }
    }

    channelDatabase = await orbitdb.docs(CHANNEL_DB, options);
    userDatabase = await orbitdb.keyvalue(USER_DB, {
      accessController: {
        type: 'orbitdb', //OrbitDBAccessController
        write: [orbitdb.identity.id]
      }
    })
    await channelDatabase.load();
    await userDatabase.load();
    // console.log(db,db1)
    // channelDatabase = db;
    // userDatabase=db1
  } catch (e) {
    console.error(e);
    process.exit(1);
    
  }
  
}


getDatabase().then(data=>{

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post('/channel/create',channel.createChannel(orbitdb,channelDatabase))
app.post('/channel/subscribe/:name',channel.subscribeChannel(orbitdb,channelDatabase))
app.get('/channel/all',channel.getAllChannels(channelDatabase))
app.get('/channel/:channelName',channel.getChannel(channelDatabase))

// app.post('/channel/:id/chat',channel.chat(orbitdb))
app.post('/users/add',user.add(userDatabase))
app.get('/users/:ethAddress',user.getName(userDatabase))

app.listen(3000,console.log('watching on port 3000'))
})