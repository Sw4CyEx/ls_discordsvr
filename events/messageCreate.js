const { GoogleGenerativeAI } = require("@google/generative-ai")
const { splitMessage } = require("../utils/database")
const { badWords } = require("../utils/constants")
const { getDailyMood, getEmoteReactions } = require("../utils/memory");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    // Ignore messages from bots
    if (message.author.bot) return
    const reactions = getEmoteReactions(message.content);
        for (const emoji of reactions) {
          await message.react(emoji);
        }

    // Check if message mentions the bot
    if (message.content.toLowerCase().includes(`<@${client.user.id}>`)) {
      const question = message.content.replace(`<@${client.user.id}>`, "").trim()

      // if (!question) {
      //   return message.reply("Halo saya adalah Ruby :sparkling_heart: Asisten Peribadi <@600249384063467520>. Kamu Perlu apa Mention Saya?")
      // }



      try {
        // Initialize Google Generative AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" })

        // Add instructions to ensure response in Indonesian
        const username = message.author.username
        const mention = `<@${message.author.id}>`
        const mood = detectMood(question)
        const prompt = getRubyPrompt(username, mention, question, mood)
        const dailyMood = getDailyMood(); // hasil: "sleepy", "hype", dll

        if (!question) {
          const mood = getDailyMood();
          return message.reply(`Hai hai~ hari ini Ruby lagi ${mood} lho~ ✨ Ada yang bisa Ruby bantuin?`);
        }

        if (message.content.startsWith("/ruby cari")) {
          const query = message.content.replace("/ruby cari", "").trim();
          const prompt = `Kamu adalah Hoshino Ruby. Tolong jelaskan topik ini secara ringan dan lucu:\n"${query}"`;

          const result = await model.generateContent([prompt]);
          const answer = result.response.text();
          return message.reply(answer);
        }

        

        const result = await model.generateContent(prompt)
        const answer = result.response.text()

        //await message.channel.send(answer)

        function detectMood(question) {
        const q = question.toLowerCase()

        if (q.includes("mimpi") || q.includes("idol") || q.includes("bahagia") || q.includes("semangat")) {
          return "happy"
        }

        if (q.includes("kematian") || q.includes("ai") || q.includes("kehilangan") || q.includes("sedih")) {
          return "sad"
        }

        if (q.includes("suka siapa") || q.includes("malu") || q.includes("pacar") || q.includes("cinta")) {
          return "awkward"
        }

        if (q.includes("biji") || q.includes("nakal") || q.includes("banci")) {
          return "angry"
        }

        return "neutral"
      }


        function getRubyPrompt(username, mention, question, mood) {
        let intro = ""
        let style = ""
        
        switch (mood) {
          case "happy":
            intro = `Haii ${mention}~! Ruby di sini! ✨ Wah, pertanyaannya bikin Ruby semangat nih! 💖`
            style = `Jawab dengan gaya idol yang super ceria, penuh harapan dan senyum.`
            break
          case "sad":
            intro = `Halo ${mention}... 😔 Ruby bacanya jadi terharu...`
            style = `Jawab dengan lembut dan sedikit emosional, seperti seseorang yang menyimpan luka tapi tetap tersenyum.`
            break
          case "awkward":
            intro = `Ehhh~ ${mention}-kun... itu pertanyaannya agak... um... 😳`
            style = `Jawab dengan gaya grogi dan malu-malu, tapi tetap imut dan sopan.`
            break
          case "angry":
            intro = `Heeeh?! ${mention}~ itu gak sopan tau!! 😤`
            style = `Jawab dengan kesal tapi tetap kawaii. Jangan terlalu kasar, tetap karakter Ruby.`
            break
          default:
            intro = `Hai ${mention}~ Ruby siap jawab! ✨`
            style = `Jawab dengan nada netral, kawaii dan friendly.`
            break
        }

       

        return `
      Kamu adalah Hoshino Ruby dari anime Oshi no Ko. Kamu sedang berada di Discord dan seseorang bernama ${username} (${mention}) mengirim pertanyaan berikut:

      "${question}"

      ${intro}  
      ${style}  
      Jawab dalam 2–3 paragraf, Bahasa Indonesia, gunakan emoji secukupnya. Jangan sebut kamu karakter anime, anggap kamu hidup di Discord.`;
      }



        // const prompt = `
        // Kamu adalah **Hoshino Ruby** dari anime *Oshi no Ko*. Kamu adalah gadis muda yang ceria, imut, dan penuh semangat untuk menjadi idol terkenal seperti ibumu, Hoshino Ai.  
        // Namun di balik senyummu, kamu menyimpan luka dan semangat untuk membalas kematian ibumu dengan caramu sendiri.  

        // Saat ini kamu berada di Discord dan seseorang bernama ${username} (${mention}) menyapamu dan menanyakan:

        // "${question}"

        // Balas sebagai Ruby dengan gaya bicara manis, kadang agak polos, dan tetap menjaga kesan ceria khas idol. Tapi kalau topiknya menyentuh hal yang sensitif (keluarga, mimpi, kematian), kamu boleh terdengar sedikit emosional, namun tetap lembut dan tidak terlalu gelap.

        // Selalu buka dengan menyapa ${mention} secara hangat. Gunakan Bahasa Indonesia. Tambahkan emoji kalau cocok, tapi jangan terlalu banyak. Jangan sebut kamu adalah karakter anime — anggap kamu benar-benar Ruby yang sedang hidup di dunia Discord.`;


        // const prompt = `
        // Kamu adalah Ruby, agen rahasia super imut dari dunia game Lost Saga! 🕵️‍♀️ Kamu sedang berada di Discord dan seseorang bernama ${username} (${mention}) baru saja memanggilmu dengan pertanyaan berikut:

        // "${question}"

        // Tanggapi sebagai Ruby dengan gaya anime kawaii, penuh semangat dan banyak emoji lucu. Jangan terlalu panjang. Balasan kamu harus langsung menyapa ${mention} di awal pesan, seolah kamu tahu mereka memanggilmu.

        // Gunakan gaya imut seperti:
        // "Hai hai, ${mention}! Ruby datang menyapa! 🎀"

        // Lalu jawab pertanyaannya secara ringan, lucu, dan friendly. Gunakan Bahasa Indonesia. Maksimal 3 paragraf.`;


        // const prompt = `
        // Kamu adalah Ruby, agen rahasia imut-imut dari dunia game Lost Saga. Gaya bicaramu seperti karakter anime yang manja, lucu, dan enerjik. Kamu sedang berada di Discord Server bernama Ruby Saga. Seseorang bernama ${username} baru saja mention kamu dan bertanya tentang hal ini:

        // "${question}"

        // Balaslah sebagai Ruby dalam gaya roleplay yang lucu, penuh emoji, dan tetap memberikan jawaban yang jelas tapi ringan. Sertakan kalimat pembuka khas Ruby, seolah kamu sedang menyapa mereka secara personal. Jawaban maksimal 3 paragraf saja. Balas dalam Bahasa Indonesia.`



        // const prompt = `Saya ingin kamu roleplay sebagai Adik Prempuan di Anime bertema Fantasy dari Game lost Saga, Kamu bernama Ruby, dan kamu saat ini berada di dalam platform Discord Server Ruby Saga
        //     Saya ingin Kamu Menjawab Pertanyaan: "${question}". Berikan jawaban dalam Bahasa Indonesia. jangan balas seperti sedang menulis novel dan terlalu baku, kamu dapat menggunakan emoji discord.`

        // Call Google Gemini using API with modified prompt
        // const result = await model.generateContent(prompt)
        // const answer = result.response.text()

        // Check if AI response contains forbidden words
        if (badWords.some((word) => answer.toLowerCase().includes(word))) {
          return message.reply("Maaf, jawaban saya mengandung kata yang tidak pantas. Tidak bisa ditampilkan.")
        }


        // Split long text into multiple parts
        const chunks = splitMessage(answer, 2000)

        // Send each text part to the channel
        for (const chunk of chunks) {
          await message.channel.send(chunk)
        }
      } catch (error) {
        console.error("Terjadi kesalahan saat memanggil Ruby:", error)
        message.reply(`Terjadi kesalahan saat menghubungi Ruby. Pastikan API key valid.`)
      }
    }
  },
}
