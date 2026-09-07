import './load-env.mjs';
import { randomUUID } from 'node:crypto';
import { stat } from 'node:fs/promises';
import { and, eq, sql } from 'drizzle-orm';
import { createNodeDb } from '../db/node';
import { appSettings, auditLogs, organizations, uploads } from '../db/schema';
import { contentEntrySchema } from '../lib/validation/travel-content';

const examples = {
  banner: [
    ['DEMO — Perjalanan ibadah dimulai di sini', 'Kenali pilihan paket, lihat jadwal, dan konsultasikan rencana perjalanan bersama tim travel. Konten contoh untuk peninjauan desain.', '/images/makkah.jpg', '/umroh'],
    ['DEMO — Siapkan perjalanan dengan tenang', 'Informasi perjalanan dalam satu tempat. Jadwal, fasilitas, dan harga mengikuti paket yang dipilih. Bukan penawaran keberangkatan nyata.', '/images/makkah-city.png', '/kontak'],
  ],
  article: [
    ['DEMO — Menyiapkan daftar kebutuhan perjalanan', 'Artikel contoh untuk meninjau tampilan website.\n\nMulailah dengan daftar sederhana: dokumen, pakaian, perlengkapan pribadi, dan nomor kontak tim pendamping. Pisahkan barang yang diperlukan selama penerbangan dari barang di koper.\n\nMintalah daftar persiapan terbaru dari travel sesuai paket Anda. Ketentuan bagasi dan dokumen dapat berbeda untuk setiap perjalanan.', '/images/makkah-city.png', ''],
    ['DEMO — Membaca informasi paket dengan teliti', 'Artikel contoh, bukan rekomendasi paket tertentu.\n\nPeriksa tanggal berangkat dan pulang, durasi perjalanan, hotel, maskapai, serta rincian biaya yang termasuk dan tidak termasuk. Catat pertanyaan sebelum berkonsultasi.\n\nPastikan informasi akhir dikonfirmasi oleh petugas travel sebelum membayar.', '/images/makkah.jpg', ''],
  ],
  gallery: [
    ['DEMO — Suasana Masjidil Haram', 'Foto ilustrasi tampilan galeri, bukan dokumentasi keberangkatan jamaah Hammad Tour.', '/images/makkah.jpg', ''],
    ['DEMO — Pemandangan Kota Makkah', 'Foto ilustrasi untuk meninjau susunan galeri. Ganti dengan dokumentasi travel yang sudah mendapat izin publikasi.', '/images/makkah-city.png', ''],
  ],
  testimonial: [
    ['DEMO — Contoh tampilan video perjalanan', 'Video referensi publik milik Tazkia Tours & Travel, bukan testimoni jamaah Hammad Tour. Tautan ini hanya untuk mengecek pemutar video; ganti dengan video travel sendiri sebelum digunakan untuk promosi.', '/images/makkah.jpg', ''],
  ],
  faq: [
    ['DEMO — Bagaimana memilih paket?', 'Buka daftar paket, lalu hubungi tim travel untuk membahas jadwal, fasilitas, dan kebutuhan Anda. Ini jawaban contoh yang dapat diubah melalui CMS.', '', ''],
    ['DEMO — Apakah jadwal pasti tersedia?', 'Ketersediaan perlu dikonfirmasi kepada tim travel. Jadwal pada website mengikuti data paket dan keberangkatan yang diterbitkan.', '', ''],
    ['DEMO — Bagaimana mencatat pembayaran?', 'Petugas mencatat pembayaran yang sudah diterima ke tagihan jamaah. Bukti dan rincian pembayaran perlu diperiksa bersama petugas. Ini penjelasan contoh.', '', ''],
  ],
} as const;

const { db, pool } = createNodeDb();
try {
  const [org] = await db.select().from(organizations).where(and(eq(organizations.slug,'hammad-tour'),eq(organizations.status,'ACTIVE')));
  if(!org)throw new Error('Demo organization not found');
  const assets = await Promise.all(['/images/makkah.jpg','/images/makkah-city.png'].map(async url=>({url,size:(await stat(`public${url}`)).size})));
  await db.transaction(async tx=>{
    for(const asset of assets) await tx.insert(uploads).values({organizationId:org.id,ownerId:org.ownerId,kind:'cms_image',provider:'local',filename:asset.url.split('/').at(-1)!,originalName:asset.url.split('/').at(-1)!,mime:asset.url.endsWith('.png')?'image/png':'image/jpeg',size:asset.size,path:`cms-demo/${org.id}${asset.url}`,publicUrl:asset.url,metadata:{bundledDemo:true}}).onConflictDoNothing();
    for(const [kind,rows] of Object.entries(examples)) {
      const key=`travel.${org.id}.content.${kind}`;
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${key}))`);
      const [current]=await tx.select().from(appSettings).where(eq(appSettings.key,key));
      const entries=current?JSON.parse(current.value).map((entry:unknown)=>contentEntrySchema.parse(entry)):[];
      let added=0;
      for(const [index,[title,body,image,link]] of rows.entries()) {
        if(entries.some((entry:{title:string})=>entry.title===title))continue;
        entries.push(contentEntrySchema.parse({id:randomUUID(),title,body,image,link,published:true,sortOrder:100+index,videoUrl:kind==='testimonial'?'https://www.youtube.com/shorts/k3guLOcJuJY':''}));
        added++;
      }
      if(added)await tx.insert(appSettings).values({key,value:JSON.stringify(entries),label:kind,updatedById:org.ownerId}).onConflictDoUpdate({target:appSettings.key,set:{value:JSON.stringify(entries),updatedAt:new Date(),updatedById:org.ownerId}});
      console.log(`${kind}: ${added} demo entries added`);
    }
    await tx.insert(auditLogs).values({actorId:org.ownerId,action:'cms.demo.seed',resource:'cms',message:'Requested demonstration content added without replacing existing entries',metadata:{organizationId:org.id}});
  });
} finally { await pool.end(); }
