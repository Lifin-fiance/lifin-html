  const input = document.getElementById('uang-saku');
  const tombol = document.getElementById('alokasikan');
  const dropdown = document.getElementById('dropdown-kalku');
  const trigger = document.getElementById('dropdown-trigger');
  const jenjangText = document.getElementById('jenjang-text');
  const segitiga = trigger.querySelector('svg');

  // Mapping persentase berdasarkan jenjang
  const jenjangPersen = {
    SD:    { donasi: 10, tabungan: 30, jajan: 40 },
    SMP:   { donasi: 15, tabungan: 25, jajan: 40 },
    SMA:   { donasi: 5,  tabungan: 40, jajan: 35 },
    UMUM:  { donasi: 10, tabungan: 20, jajan: 50 },
  };

  let jenjangAktif = 'SD'; // default jenjang

  // Format otomatis saat mengetik
  input.addEventListener('input', function (e) {
    let angka = e.target.value.replace(/\D/g, '');
    if (angka === '') return e.target.value = '';
    let format = new Intl.NumberFormat('id-ID').format(angka);
    e.target.value = format;
  });

  // Klik trigger dropdown
  trigger.addEventListener('click', function(e) {
    dropdown.style.display = 'block';
    e.stopPropagation();
  });

  // Sembunyikan dropdown saat klik di luar
  document.addEventListener('mousedown', function(e) {
    if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  // Tangkap pesan dari iframe dropdown
  window.addEventListener('message', function(e) {
    if (e.data && e.data.jenjang && e.data.warna) {
      jenjangAktif = e.data.jenjang;
      jenjangText.textContent = e.data.jenjang;
      trigger.style.backgroundColor = e.data.warna;
      dropdown.style.display = 'none';
      // Pastikan segitiga tetap muncul di UMUM
      segitiga.style.display = 'inline-block';
    }
  });

  // Klik tombol ALOKASIKAN
  tombol.addEventListener('click', function () {
    let angka = input.value.replace(/\D/g, '');
    if (!angka) return;

    let total = parseInt(angka);
    let persen = jenjangPersen[jenjangAktif];

    let donasi = Math.floor(total * persen.donasi / 100);
    let tabungan = Math.floor(total * persen.tabungan / 100);
    let jajan = Math.floor(total * persen.jajan / 100);
    let darurat = total - donasi - tabungan - jajan;

    document.getElementById('nominal-donasi').textContent = formatRupiah(donasi);
    document.getElementById('nominal-tabungan').textContent = formatRupiah(tabungan);
    document.getElementById('nominal-jajan').textContent = formatRupiah(jajan);
    document.getElementById('nominal-darurat').textContent = formatRupiah(darurat);
  });

  function formatRupiah(angka) {
    return 'Rp' + angka.toLocaleString('id-ID');
  }

  // Allow click on whole yellow box, not just button
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      const btn = item.querySelector('button');
      if (btn) btn.click();
    });
  });

  function toggleFaqExpand(button) {
    const container = button.parentElement;
    const img = button.querySelector('img');
    const content = container.querySelector('.bg-white');
    const isOpen = container.style.height === '250px';

    // Reset semua
    document.querySelectorAll('#faq-container > .faq-item').forEach(div => {
      div.style.height = '94px';
      div.querySelector('img').style.transform = 'rotate(0deg)';
      const whiteBox = div.querySelector('.bg-white');
      whiteBox.style.opacity = 0;
      whiteBox.style.pointerEvents = "none";
    });

    // Expand item yang diklik
    if (!isOpen) {
      container.style.height = '250px';
      img.style.transform = 'rotate(180deg)';
      content.style.opacity = 1;
      content.style.pointerEvents = "auto";
    }
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  

  const messages = [
    "Halo teman-teman, namaku FINNY!<br>Salam Kenal yaa..",
    "Aku bakal nemenin kamu selama belajar keuangan di LIFIN.",
    "Kalau kamu bingung, butuh bantuan, atau cuma mau ngobrol...",
    "Bingung soal uang jajan, nabung, atau budgeting?<br>Tanya aku ya.",
    "Aku cuma bisa jawab soal finansial — soal cinta<br>atau matematika bukan urusanku ya!",
    "Klik aku di pojok kanan bawah kapan pun kamu butuh bantuan!"
  ];

  let currentMsg = 0;
  let currentChar = 0;
  let typing = false;
  const displayEl = document.getElementById("finny-text");
  const nextButton = document.getElementById("next-button");

  function typeText(text, doneCallback) {
    typing = true;
    currentChar = 0;
    displayEl.innerHTML = "";

    function type() {
      displayEl.innerHTML = text.slice(0, currentChar) + (currentChar % 2 === 0 ? "|" : "");
      if (currentChar < text.length) {
        currentChar++;
        setTimeout(type, 25);
      } else {
        displayEl.innerHTML = text;
        typing = false;
        if (doneCallback) doneCallback();
      }
    }
    type();
  }

  function showNextMessage() {
    if (typing) return;
    typeText(messages[currentMsg], () => {
      currentMsg = (currentMsg + 1) % messages.length;
    });
  }

  nextButton.addEventListener("click", showNextMessage);

  // Load first message
  showNextMessage();

