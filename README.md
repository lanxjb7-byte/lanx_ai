# LanxX Looksmax Chat AI

## Isi project
- `index.html`: intro animasi LanxX, navbar CHAT/LOGIN, Google login Firebase, chatbot.
- `api/chat.js`: backend Vercel yang menghubungkan chat ke OpenRouter.
- `package.json`, `vercel.json`.

## 1. Firebase Google Login
1. Buka https://console.firebase.google.com/ dan buat project.
2. Tambahkan Web App (ikon `</>`), salin Firebase config.
3. Di Authentication → Sign-in method, aktifkan **Google**.
4. Di Authentication → Settings → Authorized domains, tambahkan domain Vercel kamu.
5. Buka `index.html`, cari `const firebaseConfig` lalu ganti nilai `GANTI_...` dengan config Web App Firebase.
   Contoh format (gunakan nilai project milikmu, jangan contoh palsu):
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "project-id.firebaseapp.com",
     projectId: "project-id",
     appId: "1:...:web:..."
   };
   ```
   Firebase Web API key memang digunakan pada frontend; atur Authorized domains dengan benar. Backend juga memverifikasi Firebase ID token menggunakan Firebase Admin SDK. Service account private key hanya boleh disimpan sebagai environment variable Vercel, jangan pernah ditaruh di frontend atau GitHub.

## 2. OpenRouter backend
Di Vercel → Project → Settings → Environment Variables, tambahkan:
- `OPENROUTER_API_KEY` = API key rahasia OpenRouter.
- `OPENROUTER_MODEL` = `meta-llama/llama-3.3-70b-instruct:free` (opsional; ganti dengan model `:free` yang tersedia di akun OpenRouter).
- `SITE_URL` = URL website Vercel (opsional).
- `FIREBASE_SERVICE_ACCOUNT_JSON` = isi JSON service account Firebase Admin SDK (rahasia). Buat di Firebase Console → Project settings → Service accounts → Generate new private key. Simpan seluruh JSON sebagai satu nilai environment variable Vercel. Jangan commit file JSON ke GitHub.

Jangan memasukkan `OPENROUTER_API_KEY` ke HTML atau GitHub. Setelah menambah env vars, lakukan Redeploy.

## 3. Deploy
1. Upload isi folder ini ke repository GitHub.
2. Import repository ke https://vercel.com/.
3. Deploy sebagai project Vercel.
4. Pastikan domain Vercel ditambahkan di Firebase Authorized domains.
5. Buka website lewat HTTPS. Login Google diperlukan sebelum mengirim chat.

## Catatan
- Model gratis OpenRouter dapat berubah, terkena rate limit, atau sementara tidak tersedia.
- Tambahkan rate limiting di backend sebelum membagikan website secara publik agar API tidak disalahgunakan.
- Sistem prompt membatasi saran pada grooming/perawatan diri sehat. Bot tidak memberi skor daya tarik atau panduan mengubah struktur tulang/wajah.
