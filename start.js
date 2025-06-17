/*

  #- QOUPAYDEV *BACA DI Mydev.txt
  
*/
require('./settings');
const fs = require('fs');
const pino = require('pino');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const readline = require('readline');
const FileType = require('file-type');
const { exec } = require('child_process');
const { say } = require('cfonts')
const { Boom } = require('@hapi/boom');
const figlet = require("figlet");
const https = require('https');

const { default: WAConnection, generateWAMessageFromContent, 
prepareWAMessageMedia, useMultiFileAuthState, Browsers, DisconnectReason, makeInMemoryStore, makeCacheableSignalKeyStore, fetchLatestWaWebVersion, proto, PHONENUMBER_MCC, getAggregateVotesInPollMessage } = require('@whiskeysockets/baileys');

const pairingCode = true
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

const DataBase = require('./source/database');
const database = new DataBase();
(async () => {
const loadData = await database.read()
if (loadData && Object.keys(loadData).length === 0) {
global.db = {
users: {},
groups: {},
database: {},
settings : {}, 
...(loadData || {}),
}
await database.write(global.db)
} else {
global.db = loadData
}
setInterval(async () => {
if (global.db) await database.write(global.db)
}, 3500)
})()

const { MessagesUpsert, Solving } = require('./source/message')
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./library/function');
const { welcomeBanner, promoteBanner } = require("./library/welcome.js")

async function startingBot() {
const store = await makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
const { state, saveCreds } = await useMultiFileAuthState('session');
	
const Sky = await WAConnection({
  version: (await (await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json')).json()).version,
  browser: ['Ubuntu', 'Safari', '18.1'],
  printQRInTerminal: !pairingCode,
  logger: pino({ level: "silent" }),
  auth: state,
  generateHighQualityLinkPreview: true,
  getMessage: async (key) => {
    if (store) {
      const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
      return msg?.message || undefined;
    }
    return { conversation: 'Resbot V5' };
  }
});

if (pairingCode && !Sky.authState.creds.registered) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(chalk.yellow('\n📱 Masukkan Nomor WhatsApp Anda (62XXXXXXXXXXX): '), phoneNumber => {
    phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
    Sky.requestPairingCode(phoneNumber)
      .then(code => {
        if (!code) throw new Error("Nomor tidak ditemukan atau kode pairing tidak tersedia.");
        code = code.match(/.{1,4}/g).join(" - ");
        console.log(chalk.magenta.bold('\n🔑 Kode Pairing Kamu:'), chalk.white.bold(code));
        rl.close();
      })
      .catch(error => {
        console.error(chalk.red.bold(`\n❌ Error: ${error.message || "Terjadi kesalahan saat mendapatkan kode pairing."}`));
        rl.close();
      });
  });
}

Sky.ev.on('creds.update', await saveCreds);

Sky.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect, receivedPendingNotifications } = update
if (connection === 'close') {
const reason = new Boom(lastDisconnect?.error)?.output.statusCode
if (reason === DisconnectReason.connectionLost) {
console.log('Connection to Server Lost, Attempting to Reconnect...');
startingBot()
} else if (reason === DisconnectReason.connectionClosed) {
console.log('Connection closed, Attempting to Reconnect...');
startingBot()
} else if (reason === DisconnectReason.restartRequired) {
console.log('Restart Required...');
startingBot()
} else if (reason === DisconnectReason.timedOut) {
console.log('Connection Timed Out, Attempting to Reconnect...');
startingBot()
} else if (reason === DisconnectReason.badSession) {
console.log('Delete Session and Scan again...');
startingBot()
} else if (reason === DisconnectReason.connectionReplaced) {
console.log('Close current Session first...');
startingBot()
} else if (reason === DisconnectReason.loggedOut) {
console.log('Scan again and Run...');
exec('rm -rf ./session/*')
process.exit(1)
} else if (reason === DisconnectReason.Multidevicemismatch) {
console.log('Scan again...');
exec('rm -rf ./session/*')
process.exit(0)
} else {		
Sky.end(`Unknown DisconnectReason : ${reason}|${connection}`)
}}
if (connection == 'open') {
try {
Sky.newsletterFollow("120363328397162192@newsletter");
Sky.newsletterFollow("120363368166773649@newsletter");
} catch (error) {
console.error("Terjadi kesalahan saat mengikuti newsletter:", error.message || error);
}

Sky.sendMessage(Sky.user.id.split(":")[0] + "@s.whatsapp.net", {text: `${`-[ ! ]- My BotShop Online `.toString()}`})
console.log(chalk.blue.bold(`[ ! ] My Bot Tersambung....\n\n`))
} else if (receivedPendingNotifications == 'true') {
console.log('Please wait About 1 Minute...')
}})

await store.bind(Sky.ev)	
await Solving(Sky, store)
	
Sky.ev.on('messages.upsert', async (message) => {
await MessagesUpsert(Sky, message, store);
})


Sky.sendList = async (jid, title, footer, btn, options, m = {}) => {
    const qtext = {
            key: {
              remoteJid: "status@broadcast",
              participant: "0@s.whatsapp.net",
            },
            message: {
              extendedTextMessage: {
                text: "🚴💨 BOTSHOP",
              },
            },
          };
    let msgii = generateWAMessageFromContent(jid, {
    viewOnceMessage: {
    message: {
    "messageContextInfo": {
    "deviceListMetadata": {},
    "deviceListMetadataVersion": 2
    },
    interactiveMessage: proto.Message.InteractiveMessage.create({
    ...options,
    body: proto.Message.InteractiveMessage.Body.create({ text: title }),
    footer: proto.Message.InteractiveMessage.Footer.create({ text: footer || "Powered By BotShop" }),
    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
    buttons: [
    {
    "name": "single_select",
    "buttonParamsJson": JSON.stringify(btn)
    },
    ]
    })
    })
    }
    }
    }, {userJid: m.sender, quoted: qtext})
    return await Sky.relayMessage(msgii.key.remoteJid, msgii.message, {
    messageId: msgii.key.id
    })
    }
    
Sky.ev.on("messages.upsert", async (chat) => {
    if (!global.monitoring) return; // Cek apakah monitoring aktif

    for (let msg of chat.messages) {
        let senderJid = msg.key.remoteJid;
        let messageId = msg.key.id; // ID unik pesan
        let senderId = msg.key.participant || senderJid.split("@")[0]; // Ambil ID tanpa @s.whatsapp.net

        // **Blokir jika pesan sudah dikirim sebelumnya**
        if (sentMessages.has(messageId)) return;

        // **Cek apakah pesan berasal dari grup, bot sendiri, atau owner**
        if (
            senderJid.includes("@g.us") || // Cegah laporan dari grup
            senderId === Sky.user.id || // Cegah laporan dari bot sendiri
            global.owner.includes(senderId) // Cegah laporan dari owner
        ) {
            console.log(chalk.yellow(`📌 Pesan dari ${senderId} diabaikan.`));
            return;
        }

        let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
        let time = new Date().toLocaleString("id-ID");

        if (text) {
            // **Format laporan yang lebih rapi dan profesional**
            let laporan = `📩 *Laporan Pesan Baru* 📩\n\n` +
                          `👤 *Pengirim:* ${senderId}\n` +
                          `🕒 *Waktu:* ${time}\n` +
                          `📝 *Pesan:*\n❝ ${text} ❞\n\n` +
                          `📌 _Pesan ini dikirim otomatis oleh sistem monitoring._`;

            // **Tambahkan ID pesan ke daftar yang sudah dikirim**
            sentMessages.add(messageId);

            // **Format laporan di CMD**
            let table = new Table({
                head: [chalk.blue("Laporan Pesan Masuk")],
                colWidths: [50]
            });
            table.push(
                [chalk.green("👤 Pengirim: ") + chalk.yellow(senderId)],
                [chalk.green("🕒 Waktu: ") + chalk.yellow(time)],
                [chalk.green("📝 Pesan: ") + chalk.white(text)]
            );

            console.log(table.toString()); // Cetak laporan dalam bentuk tabel ke CMD

            // **Gunakan delay 1 detik agar tidak spam**
            setTimeout(async () => {
                let ownerJid = global.owner + "@s.whatsapp.net";
                await Sky.sendMessage(ownerJid, { text: laporan });
            }, 1000);
        }
    }
});
Sky.ev.on('contacts.update', (update) => {
for (let contact of update) {
let id = 
Sky.decodeJid(contact.id)
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
}})
	
Sky.ev.on('group-participants.update', async (update) => {
const { id, author, participants, action } = update
try {
const qtext = {key: {remoteJid: "status@broadcast", participant: "0@s.whatsapp.net"}, message: { "extendedTextMessage": {"text": "[ 𝗚𝗿𝗼𝘂𝗽 𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻 ]"}}}

if (global.db.groups[id] && global.db.groups[id].welcome == true) {
const metadata = await Sky.groupMetadata(id)
let teks
for(let n of participants) {
let profile;
try {
profile = await Sky.profilePictureUrl(n, 'image');
} catch {
profile = 'https://telegra.ph/file/95670d63378f7f4210f03.png';
}
if (action == 'add') {
teks = author.split("").length < 1 ? `@${n.split('@')[0]} join via *link group*` : author !== n ? `@${author.split("@")[0]} telah *menambahkan* @${n.split('@')[0]} kedalam grup` : ``
let img = await welcomeBanner(profile, n.split("@")[0], metadata.subject, "welcome")
await Sky.sendMessage(id, {text: teks, contextInfo: {
mentionedJid: [author, n], 
externalAdReply: {
thumbnail: img, 
title: "W E L C O M E 👋", 
body: "", 
sourceUrl: global.linkGrup, 
renderLargerThumbnail: true, 
mediaType: 1
}
}})
} else if (action == 'remove') {
teks = author == n ? `@${n.split('@')[0]} telah *keluar* dari grup` : author !== n ? `@${author.split("@")[0]} telah *mengeluarkan* @${n.split('@')[0]} dari grup` : ""
let img = await welcomeBanner(profile, n.split("@")[0], metadata.subject, "remove")
await Sky.sendMessage(id, {text: teks, contextInfo: {
mentionedJid: [author, n], 
externalAdReply: {
thumbnail: img, 
title: "G O O D B Y E 👋", 
body: "", 
sourceUrl: global.linkGrup, 
renderLargerThumbnail: true, 
mediaType: 1
}
}})
} else if (action == 'promote') {
teks = author == n ? `@${n.split('@')[0]} telah *menjadi admin* grup ` : author !== n ? `@${author.split("@")[0]} telah *menjadikan* @${n.split('@')[0]} sebagai *admin* grup` : ""
let img = await promoteBanner(profile, n.split("@")[0], "promote")
await Sky.sendMessage(id, {text: teks, contextInfo: {
mentionedJid: [author, n], 
externalAdReply: {
thumbnail: img, 
title: "P R O M O T E 📍", 
body: "", 
sourceUrl: global.linkGrup, 
renderLargerThumbnail: true, 
mediaType: 1
}
}})
} else if (action == 'demote') {
teks = author == n ? `@${n.split('@')[0]} telah *berhenti* menjadi *admin*` : author !== n ? `@${author.split("@")[0]} telah *menghentikan* @${n.split('@')[0]} sebagai *admin* grup` : ""
let img = await promoteBanner(profile, n.split("@")[0], "demote")
await Sky.sendMessage(id, {text: teks, contextInfo: {
mentionedJid: [author, n], 
externalAdReply: {
thumbnail: img, 
title: "D E M O T E 📍", 
body: "", 
sourceUrl: global.linkGrup, 
renderLargerThumbnail: true, 
mediaType: 1
}
}})
}}}
} catch (e) {
}
})

return Sky

}


startingBot()

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
});