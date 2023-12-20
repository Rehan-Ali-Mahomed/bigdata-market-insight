import MONGODB from 'mongodb';

let CLIENT = null, DB = null;

async function start() {
  
  // verify configuration
  let tmp = verifyConfig();
  if (!tmp.result) {
    console.error(tmp);
    process.exit(75);
  }
  
  // try connect
  let connected = await connect(tmp);
  if (!connected.result) {
    console.error(connected);
    process.exit(75);
  }
  
}

function verifyConfig() {
  let cred = process.env.DB_USERNAME + ":" + process.env.DB_PASSWORD + "@";
  
  // verify host
  if (process.env.DB_HOST === "") {
    return ({result: false, info: "DB Host is empty"});
  } else if (process.env.DB_USERNAME === "" || process.env.DB_PASSWORD === "") {
    console.log("Empty DB Credential, connecting without login");
    cred = "";
  }
  
  return ({
    result: true,
    url: `mongodb://${cred}${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    safeUrl: `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    host: process.env.DB_HOST, port:process.env.DB_PORT
  });
}

async function connect(config) {
  // create client
  console.log("Connecting to DB:", config.safeUrl);
  CLIENT = new MONGODB.MongoClient(config.url, {});
  
  try {
    // connect
    await CLIENT.connect();
    // assign db
    DB = CLIENT.db(process.env.DB_NAME);
    
    console.log("Connected to DB");
    return({result: true, info:"Connected to DB"});
  } catch (err) {
    return ({result:false, info:"Error connecting to DB, see error", error:err});
  }
}

/* FIND */

async function findAll(coll) {
  try {
    const collection = DB.collection(coll);
    const data = await collection.find({}).toArray();
    return ({result:true, data: data});
  } catch (e) {
  }
}


/* INSERT */

async function insertMultiple(coll, data) {
  try {
    const collection = DB.collection(coll);

    const result = await collection.insertMany(data);

    return ({result: true, count: result.insertedCount, info: "Data inserted"});
  } catch (e) {
    return ({result: false, info: "Error pushing to db", error: e});
  }
}

async function drop(coll) {
  try {
    const collection = DB.collection(coll);

    await collection.drop();

    return ({result:true, info:"Collection drop, its empty now !"});
  } catch (e) {
    return ({result:false, info:"Error dropping collection", error:e});
  }
}

export default {
  
  db: DB,
  client: CLIENT,
  
  coll: {
    data: "data"
  },
  
  start: start,
  
  drop: drop,
  findAll: findAll,
  insertMultiple: insertMultiple
  
}