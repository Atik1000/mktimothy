📘 WASenderAPI Integration Guide

1. 🔐 Authentication
   All requests must include your session-specific API key:

pgsql

Authorization: Bearer YOUR_API_KEY
Content-Type: application/json 2. ✅ Send Messages: POST /api/send-message
Common field across all types:

to (string, required): recipient’s full number, e.g., "1234567890"

text (optional): caption or primary text

2.1 Text
json

{
"to": "1234567890",
"text": "Hello, world!"
}
2.2 Image
json

{
"to": "1234567890",
"text": "Check this out!",
"imageUrl": "https://example.com/image.jpg"
}
2.3 Video
json

{
"to": "1234567890",
"text": "Watch this!",
"videoUrl": "https://example.com/video.mp4"
}
2.4 Document
json

{
"to": "1234567890",
"text": "Please review",
"documentUrl": "https://example.com/file.pdf"
}
2.5 Audio (Voice)
json

{
"to": "1234567890",
"text": "Listen to this",
"audioUrl": "https://example.com/audio.mp3"
}
2.6 Sticker
json

{
"to": "1234567890",
"stickerUrl": "https://example.com/sticker.webp"
}
2.7 Contact Card
json

{
"to": "1234567890",
"contactName": "Jane Doe",
"contactPhone": "+19876543210"
}
2.8 Location
json

{
"to": "1234567890",
"latitude": 37.7749,
"longitude": -122.4194,
"name": "Office",
"address": "123 Market St, SF"
}
2.9 Quoted Message (Reply)
json

{
"to": "1234567890",
"text": "Got it.",
"quotedMsgId": "abc123msgid"
}
2.10 Poll (Beta)
json

{
"to": "1234567890",
"poll": {
"question": "Best color?",
"options": ["Red", "Green", "Blue"],
"multiSelect": false
}
}
Note: All message types are supported via the REST API 
developers.facebook.com
+5
wasenderapi.com
+5
packagist.org
+5
github.com
.

3. 🌐 Webhook Events
   3.1 messages.upsert
   Fires when any message arrives (text, media, audio, sticker, location, contact, quoted).

Payload highlights (generic):

json

{
"event": "messages.upsert",
"timestamp": 1651234567,
"data": {
"messages": [
{
"key": {
"id": "msg-id-123",
"fromMe": false,
"remoteJid": "1234567890"
},
"message": {
"conversation": "Hello!",
"imageMessage": {
"url": "https://.../pic.jpg",
"caption": "A pic"
},
"audioMessage": { "url": "https://.../voice.mp3" },
"stickerMessage": { "url": "https://.../sticker.webp" },
"locationMessage": {
"degreesLatitude": 37.7749,
"degreesLongitude": -122.4194,
"name": "Place",
"address": "123 St"
},
"contactMessage": {
"displayName": "John",
"vcard": "BEGIN:VCARD..."
},
"extendedTextMessage": {
"text": "Reply me",
"contextInfo": { "quotedMessageId": "msg-id-abc" }
}
}
}
]
}
}
3.2 messages.delete
Fires when a message is deleted. Useful for marking messages removed .

json

{
"event": "messages.delete",
"timestamp": 1651235600,
"data": {
"keys": [
{
"id": "msg-id-789",
"fromMe": false,
"remoteJid": "1234567890"
}
]
}
}
3.3 message.reaction
Fires when a reaction is added or removed.

json

{
"event": "message.reaction",
"timestamp": 1651236789,
"data": {
"key": {
"id": "msg-id-123",
"fromMe": false,
"remoteJid": "1234567890"
},
"reaction": "👍",
"sender": "+19876543210"
}
}
Tip: Cursor can parse all these events and guide you to handle them.

4. 💡 Node.js Example Code
   Send Audio:
   js

const payload = {
to: "1234567890",
text: "Here’s a voice note",
audioUrl: "https://example.com/voice.mp3"
};
await axios.post("https://api.wasenderapi.com/api/send-message", payload, {
headers: { Authorization: Bearer ${API_KEY} }
});
Webhook Handler (Express):
js

app.post("/webhook", (req, res) => {
const { event, data } = req.body;
if (event === "messages.upsert") {
data.messages.forEach(msg => {
if (msg.message.audioMessage) {
// process audio
}
});
}
if (event === "message.reaction") {
console.log("Reacted:", data.reaction, "on", data.key.id);
}
if (event === "messages.delete") {
console.log("Deleted:", data.keys.map(k => k.id));
}
res.sendStatus(200);
}); 5. 🗂️ File Structure
kotlin

/docs
└── API.md ← (this file)
