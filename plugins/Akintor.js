import fetch from 'node-fetch';
import translate from '@vitalets/google-translate-api';

const handler = async (m, { conn, usedPrefix, command, text }) => {
  if (m.isGroup) return;
  const aki = global.db.data.users[m.sender].akinator;
  if (text == 'end') {
    if (!aki.sesi) return m.reply("لم تقم ببدء لعبة أكيناتور بعد.");
    aki.sesi = false;
    aki.soal = null;
    m.reply("تم إنهاء لعبة أكيناتور بنجاح.");
  } else {
    if (aki.sesi) return conn.reply(m.chat, "انتظر حتى يتم الرد على السؤال الحالي.", aki.soal);
    try {
      const res = await fetch(`https://api.lolhuman.xyz/api/akinator/start?apikey=${lolkeysapi}`);
      const anu = await res.json();
      if (anu.status !== 200) throw "حدثت مشكلة أثناء بدء اللعبة.";
      const { server, frontaddr, session, signature, question, progression, step } = anu.result;
      aki.sesi = true;
      aki.server = server;
      aki.frontaddr = frontaddr;
      aki.session = session;
      aki.signature = signature;
      aki.question = question;
      aki.progression = progression;
      aki.step = step;
      const resultes2 = await translate(question, { to: 'ar', autoCorrect: false });
      let txt = `*أهلاً بك في لعبة أكيناتور @${m.sender.split('@')[0]}*\n\n`;
      txt += `*${resultes2.text}*\n\n`;
      txt += "اختر إحدى الخيارات التالية:\n";
      txt += "1. نعم\n";
      txt += "2. لا\n";
      txt += "3. لست متأكداً\n";
      txt += `لإنهاء اللعبة، أرسل: *${usedPrefix + command} end*`;
      const soal = await conn.sendMessage(m.chat, { text: txt, mentions: [m.sender] }, { quoted: m });
      aki.soal = soal;
    } catch {
      m.reply("حدثت مشكلة أثناء تنفيذ الأمر. الرجاء المحاولة مرة أخرى لاحقاً.");
    }
  }
};

handler.tags = ['game'];
handler.command = /^(المارد)$/i;
export default handler;
