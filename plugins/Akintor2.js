import fetch from 'node-fetch';
import translate from '@vitalets/google-translate-api';
const teks = '*0 - نعم*\n*1 - لا*\n*2 - لا أعلم*\n*3 - ربما نعم*\n*4 - ربما لا*\n*5 - الرجوع إلى السؤال السابق*';
export async function before(m) {
  if (global.db.data.users[m.sender].banned) return;
  if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !m.text) return !0;
  const aki = global.db.data.users[m.sender].akinator;
  if (!aki.sesi || m.quoted.id != aki.soal.key.id) return;
  if (!somematch(['0', '1', '2', '3', '4', '5'], m.text)) return this.sendMessage(m.chat, {text: `*[❗] يرجى الرد بأرقام الخيارات 0، 1، 2، 3، 4، أو 5*\n\n${teks}`}, {quoted: aki.soal});
  const {server, frontaddr, session, signature, question, progression, step} = aki;
  if (step == '0' && m.text == '5') return m.reply('*[❗] لا يوجد تاريخ سابق للرجوع إليه*');
  let res; let anu; let soal;
  try {
    if (m.text == '5') res = await fetch(`https://api.lolhuman.xyz/api/akinator/back?apikey=${lolkeysapi}&server=${server}&session=${session}&signature=${signature}&step=${step}`);
    else res = await fetch(`https://api.lolhuman.xyz/api/akinator/answer?apikey=${lolkeysapi}&server=${server}&frontaddr=${frontaddr}&session=${session}&signature=${signature}&step=${step}&answer=${m.text}`);
    anu = await res.json();
    if (anu.status != '200') {
      aki.sesi = false;
      aki.soal = null;
      return m.reply('*[❗] حدث خطأ في استجابة الأكيناتور، يرجى المحاولة مرة أخرى*');
    }
    anu = anu.result;
    if (anu.name) {
      const resultar = await translate(`${anu.description}`, {to: 'ar', autoCorrect: true});
      await this.sendMessage(m.chat, {image: {url: anu.image}, caption: `🎮 *الأكيناتور* 🎮\n\n*الشخصية التي تفكر فيها هي ${anu.name}*\n_${resultar.text}_`, mentions: [m.sender]}, {quoted: m});
      aki.sesi = false;
      aki.soal = null;
    } else {
      const resultes = await translate(`${anu.question}`, {to: 'ar', autoCorrect: true});
      soal = await this.sendMessage(m.chat, {text: `🎮 *الأكيناتور* 🎮\n*التقدم: ${anu.progression.toFixed(2)} %*\n\n*السؤال: ${resultes.text}*\n\n${teks}`, mentions: [m.sender]}, {quoted: m});
      aki.soal = soal;
      aki.step = anu.step;
      aki.progression = anu.progression;
    }
  } catch (e) {
    aki.sesi = false;
    aki.soal = null;
    m.reply('*[❗] حدث خطأ، يرجى المحاولة مرة أخرى*');
  }
  return !0;
}
function somematch(data, id) {
  const res = data.find((el) => el === id);
  return res ? true : false;
}
