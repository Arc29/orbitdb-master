/*
  This is the master node that creates the initial database. It is configured to
  use the Circuit Relay feature to help nodes communicate with one another.
*/

"use strict";

// CUSTOMIZE THESE VARIABLES
const DB_NAME = "example878";

const IPFS = require("ipfs");
const OrbitDB = require("orbit-db");

console.log("Starting...");

const ipfs = new IPFS({
  repo: "./orbitdb/examples/ipfs",
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

ipfs.on("error", err => console.error(err));

ipfs.on("replicated", () => {
  console.log(`replication event fired`);
});

ipfs.on("ready", async () => {
  // await ipfs.swarm.connect("/dns4/nyc-2.bootstrap.l/ibp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64")
  let db;
  
  try {
    const orbitdb = await OrbitDB.createInstance(ipfs, {
      directory: "./orbitdb/examples/eventlog"
    });

    const options = {
      // Setup write access
      accessController: {
        type: 'orbitdb', //OrbitDBAccessController
        write: [orbitdb.identity.publicKey]
      }
    }

    db = await orbitdb.eventlog(DB_NAME, options);
    await db.load();
   
    console.log(`db id: ${db.id}`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  
});