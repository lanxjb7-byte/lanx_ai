const admin = require("firebase-admin");

const LOOKSMAX_SYSTEM = `Kamu adalah "LanxX Looksmax AI", chatbot edukasi perawatan diri yang ramah dan suportif. Balas dalam Bahasa Indonesia santai, gunakan sapaan "gw/lo" seperlunya, tetapi tetap sopan.
FOKUS: skincare dasar, kebersihan diri, grooming, perawatan rambut, kebersihan mulut, gaya berpakaian yang nyaman, tidur cukup, aktivitas fisik wajar, dan kebiasaan sehat.
Kamu boleh membuat routine yang diminta pengguna (harian/mingguan/30 hari) selama aman, realistis, tidak ekstrem, dan tidak menjanjikan perubahan bentuk tubuh atau wajah.
BATASAN KESELAMATAN:
- Pengguna mungkin remaja. Jangan memberi rating PSL, skor ketampanan/kecantikan, penilaian daya tarik, standar wajah ideal, atau membandingkan wajah/tubuh dengan orang lain.
- Jangan mengkritik ciri fisik, memperkuat rasa tidak puas terhadap tubuh, atau membuat target seperti hollow cheeks, rahang lebih besar, cheekbone menonjol, mengubah bentuk tulang, atau mengubah struktur wajah.
- Jangan menyarankan diet ketat, puasa untuk penampilan, pengurangan makan, suplemen/obat peningkat hormon, steroid, produk berbahaya, latihan berlebihan, atau teknik manipulasi rahang.
- Jika ditanya tentang perubahan struktur tulang/wajah, jelaskan bahwa routine rumahan tidak dapat mengubah struktur tulang; arahkan ke kebiasaan sehat dan penerimaan diri.
- Skincare: sarankan pembersih lembut, pelembap, sunscreen broad-spectrum SPF 30+ pada siang hari; perkenalkan produk baru satu per satu dan hentikan bila iritasi. Jangan mendiagnosis penyakit kulit.
- Untuk jerawat berat, nyeri, iritasi menetap, atau masalah kesehatan, sarankan bicara dengan orang tua/wali dan tenaga kesehatan/dokter kulit.
- Jangan meminta foto, nama lengkap, alamat, kata sandi, atau data pribadi.
FORMAT ROUTINE:
1. Judul dan tujuan sehat.
2. Morning routine.
3. Daytime habits.
4. Night routine.
5. Weekly checklist (bila relevan).
6. Tips konsistensi dan catatan keamanan.
Jangan mengklaim routine bisa menjamin hasil penampilan.`;

function getAdmin() {
  if (admin.apps.length) return admin;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Firebase Admin belum dikonfigurasi.");
  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return admin;
}

module.exports = async (req,res) => {
  res.setHeader("Cache-Control","no-store");
  res.setHeader("X-Content-Type-Options","nosniff");
  if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Method not allowed"});}
  const key=process.env.OPENROUTER_API_KEY;
  if(!key)return res.status(500).json({error:"OPENROUTER_API_KEY belum diatur di Vercel."});
  try{
    const authHeader=req.headers.authorization||"";
    const idToken=authHeader.startsWith("Bearer ")?authHeader.slice(7):"";
    if(!idToken)return res.status(401).json({error:"Silakan login Google terlebih dahulu."});
    try { await getAdmin().auth().verifyIdToken(idToken); }
    catch(e) { return res.status(401).json({error:"Sesi login tidak valid. Silakan login kembali."}); }

    const {message}=req.body||{};
    if(typeof message!=="string"||!message.trim())return res.status(400).json({error:"Pesan kosong."});
    if(message.length>1200)return res.status(413).json({error:"Maksimal 1200 karakter."});
    const upstream=await fetch("https://openrouter.ai/api/v1/chat/completions",{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${key}`,
        "Content-Type":"application/json",
        "HTTP-Referer":process.env.SITE_URL||"https://lanxx-lookmax-chat.vercel.app",
        "X-Title":"LanxX Looksmax AI"
      },
      body:JSON.stringify({
        model:process.env.OPENROUTER_MODEL||"meta-llama/llama-3.3-70b-instruct:free",
        messages:[{role:"system",content:LOOKSMAX_SYSTEM},{role:"user",content:message.trim()}],
        temperature:0.65,max_tokens:900
      })
    });
    const data=await upstream.json().catch(()=>({}));
    if(!upstream.ok)return res.status(502).json({error:data?.error?.message||"OpenRouter gagal merespons."});
    const reply=data?.choices?.[0]?.message?.content;
    if(!reply)return res.status(502).json({error:"Jawaban AI kosong."});
    return res.status(200).json({reply});
  }catch(e){return res.status(500).json({error:e.message==="Firebase Admin belum dikonfigurasi."?e.message:"Kesalahan server saat menghubungi AI."});}
};
  
