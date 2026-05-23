export const campaigns = [
  {
    id: 1,
    nama: "Beasiswa Anak Bangsa",
    target_dana: 6000000,
    dana_terkumpul: 4200000,
    persentase: 70,
    status: "Sedang berjalan",
    deskripsi: "Program beasiswa komprehensif untuk anak-anak berprestasi dari keluarga kurang mampu di seluruh pelosok Indonesia agar dapat melanjutkan pendidikan ke jenjang yang lebih tinggi.",
    image: "https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/982eebe7ac08e251b886d2e2ed5e0efc.jpg"
  },
  {
    id: 2,
    nama: "Perpustakaan Digital Nusantara",
    target_dana: 7000000,
    dana_terkumpul: 7000000,
    persentase: 100,
    status: "Selesai",
    deskripsi: "Penyediaan akses ribuan buku digital dan perangkat tablet untuk sekolah-sekolah di daerah 3T (Tertinggal, Terdepan, dan Terluar) guna meningkatkan literasi siswa.",
    image: "https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/f468f58ff82fcd92e9c11e6e8ff1053c.jpg"
  },
  {
    id: 3,
    nama: "Sekolah Harapan Desa",
    target_dana: 8000000,
    dana_terkumpul: 5500000,
    persentase: 68,
    status: "Sedang berjalan",
    deskripsi: "Renovasi bangunan sekolah dasar yang rusak parah di pedesaan, termasuk perbaikan atap, penyediaan meja kursi baru, dan fasilitas sanitasi yang layak.",
    image: "https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/ea68924d1d5db0a25321d050d79218fd.jpg"
  },
  {
    id: 4,
    nama: "Program Literasi Anak",
    target_dana: 9000000,
    dana_terkumpul: 3800000,
    persentase: 42,
    status: "Sedang berjalan",
    deskripsi: "Pelatihan membaca dan menulis intensif untuk anak-anak usia dini di kawasan padat penduduk perkotaan, dilengkapi dengan pendampingan psikologis.",
    image: "https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/0c91b258a240ad84c048928d7ed14597.jpg"
  },
  {
    id: 5,
    nama: "Laboratorium Sains Terpadu",
    target_dana: 10000000,
    dana_terkumpul: 6200000,
    persentase: 62,
    status: "Sedang berjalan",
    deskripsi: "Pengadaan alat peraga sains, mikroskop, dan bahan praktikum kimia dasar untuk mendukung pembelajaran STEM di Madrasah Tsanawiyah.",
    image: "https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/bf2db025888f8d1b234ea692ea7644a8.jpg"
  },
  {
    id: 6,
    nama: "Pusat Belajar Komunitas",
    target_dana: 8500000,
    dana_terkumpul: 2100000,
    persentase: 25,
    status: "Sedang berjalan",
    deskripsi: "Pembangunan ruang belajar serbaguna yang dilengkapi dengan koneksi internet gratis untuk memfasilitasi pembelajaran jarak jauh bagi anak-anak pemulung.",
    image: "https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/1fa8463806b10c17020a9ac440da3846.jpg"
  }
];

export const getCampaignById = (id) => {
  return campaigns.find(campaign => campaign.id === parseInt(id));
};

export const getRelatedCampaigns = (currentId, limit = 2) => {
  return campaigns.filter(campaign => campaign.id !== parseInt(currentId)).slice(0, limit);
};