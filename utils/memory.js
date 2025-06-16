// utils/memory.js
const fs = require("fs");
const path = "./memory.json";
// Mood harian berdasarkan waktu
function getDailyMood() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  const moodMap = {
    0: "nostalgic", // Minggu
    1: hour < 12 ? "sleepy" : "serious", // Senin
    2: "chill", // Selasa
    3: "thoughtful", // Rabu
    4: "curious", // Kamis
    5: hour > 18 ? "hype" : "motivated", // Jumat
    6: "lazy", // Sabtu
  };

  return moodMap[day] || "normal";
}

// Emote triggers
function getEmoteReactions(content) {
  const triggers = [
    { keyword: "ruby imut", emoji: "💕" },
    { keyword: "idol", emoji: "🎤" },
    { keyword: "terima kasih", emoji: "😊" },
    { keyword: "kawaii", emoji: "🌸" }
  ];
  return triggers.filter(t => content.toLowerCase().includes(t.keyword)).map(t => t.emoji);
}

// Random mood messages
function getRandomIdleMoodMessage() {
  const messages = [
    "Ehhh... lagi gak ada yang nyapa ya? Ruby jadi sepi... 😔",
    "Hari ini langitnya biru banget~ kayak perasaan Ruby waktu naik panggung~ 💙",
    "Ruby barusan mimpi Ai-mama... jadi semangat banget hari ini! ✨",
    "Ayo siapa yang mau ngobrol sama Ruby~ Ruby lagi gabut nih! 🥺"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}


module.exports = {
  getDailyMood,
  getEmoteReactions,
  getRandomIdleMoodMessage,
};
