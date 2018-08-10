const alfy = require("alfy");
const Database = require("better-sqlite3");
const alfredNotifier = require("alfred-notifier");

alfredNotifier();

// Get ref to user input
const { input } = alfy;

const cached = alfy.cache.get(input);
// // alfy.log(`cached: ${cached}`);

if (cached && cached.length) {
  return alfy.output(cached);
}

// Get path to database

const homeDir = require("os").homedir();
const PATH_TO_DB = `${homeDir}/Library/Group Containers/group.com.apple.notes/NoteStore.sqlite`;

// Open notes database
let db = new Database(PATH_TO_DB);

// SQL Queries
const GET_UUID = "SELECT z_uuid FROM z_metadata";
const GET_ROW = `SELECT ztitle1,zfolder,zsnippet,zmodificationdate1,z_pk FROM ziccloudsyncingobject WHERE ztitle1 IS NOT NULL AND zmarkedfordeletion IS NOT 1 AND ztitle1 LIKE "%${input}%"`;

// Get uuid string required in full id
const [{ Z_UUID: uuid }] = db.prepare(GET_UUID).all();
const allRows = db.prepare(GET_ROW).all();

// Format via Alfred supported properties

const makeAlfyOutput = arr => {
  if (arr && arr.length) {
    return arr.map(itemObj => {
      const { ZTITLE1: title, Z_PK: uid } = itemObj;

      return {
        title,
        uid,
        arg: `x-coredata://${uuid}/ICNote/p${uid}`,
        icon: {
          path: "./note.png"
        }
      };
    });
  }

  return [];
};

const alfyOutput = makeAlfyOutput(allRows);

alfy.cache.set(input, alfyOutput, { maxAge: 3600000 });
alfy.output(alfyOutput);

db.close();
