import fetch from 'node-fetch';
import translate from '@vitalets/google-translate-api';
const handler = async (m, {conn, usedPrefix, command, text}) => {
  if (m.isGroup) return;
  const aki = global.db.data.users[m.sender].akinator;
  if (text == 'انهاء') {
    if (!aki.sesi) return m.reply('*[❗] لا يوجد جلسة نشطة لإنهاءها*');
    aki.sesi = false;
    aki.soal = null;
    m.reply('*[❗] تم إنهاء الجلسة بنجاح*');
  } else {
    if (aki.sesi) return conn.reply(m.chat, '*[❗] هناك جلسة نشطة حالياً، يرجى إنهائها قبل بدء جلسة جديدة*', aki.soal);
    try {
      const res = await fetch(`https://api.lolhuman.xyz/api/akinator/start?apikey=${lolkeysapi}`);
      const anu = await res.json();
      if (anu.status !== 200) throw '*[❗] حدث خطأ أثناء جلب البيانات*';
      const {server, frontaddr, session, signature, question, progression, step} = anu.result;
      aki.sesi = true;
      aki.server = server;
      aki.frontaddr = frontaddr;
      aki.session = session;
      aki.signature = signature;
      aki.question = question;
      aki.progression = progression;
      aki.step = step;
      const resultar = await translate(question, {to: 'ar', autoCorrect: false});
      let txt = `🎮 *الأكيناتور* 🎮\n\n*السائل: @${m.sender.split('@')[0]}*\n*السؤال: ${resultar.text}*\n\n`;
      txt += '*0 - نعم*\n';
      txt += '*1 - لا*\n';
      txt += '*2 - لا أعلم*\n';
      txt += '*3 - ربما نعم*\n';
      txt += '*4 - ربما لا*\n\n';
      txt += `*استخدم .انهاء لإنهاء اللعبة*`;
      const soal = await conn.sendMessage(m.chat, {text: txt, mentions: [m.sender]}, {quoted: m});
      aki.soal = soal;
    } catch {
      m.reply('*[❗] حدث خطأ أثناء تنفيذ الطلب*');
    }
  }
};
handler.menu = ['akinator'];
handler.tags = ['game'];
handler.command = /^(المارد)$/i;
export default handler;
