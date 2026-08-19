// ======================================================
// 1. ELEMEN HTML
// ======================================================

const dataAsetBody =
    document.getElementById('dataAsetBody');

const searchDataAset =
    document.getElementById('searchDataAset');

const filterDataKecamatan =
    document.getElementById('filterDataKecamatan');

const filterDataDesa =
    document.getElementById('filterDataDesa');

const filterDataPenggunaan =
    document.getElementById('filterDataPenggunaan');

const filterDataStatus =
    document.getElementById('filterDataStatus');

const resetDataFilter =
    document.getElementById('resetDataFilter');


// ======================================================
// 2. DATA ASLI
// ======================================================

let dataAsetAsli = [];


// ======================================================
// 3. ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '-';
    }

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}


// ======================================================
// 4. FORMAT LUAS
// Tetap seperti versi sebelumnya
// ======================================================

function formatLuas(value) {

    const angka =
        parseFloat(value);

    if (isNaN(angka)) {
        return '-';
    }

    return angka.toLocaleString(
        'id-ID',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


// ======================================================
// 5. NORMALISASI
// ======================================================

function normalisasiNilai(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return '';
    }

    return String(value).trim();
}


function normalisasiPencarian(value) {

    return normalisasiNilai(value)
        .toLowerCase();
}


// ======================================================
// 6. AMBIL NILAI UNIK
// ======================================================

function ambilNilaiUnik(
    features,
    field
) {

    const values =
        features
            .map(
                feature =>
                    normalisasiNilai(
                        feature.properties[field]
                    )
            )
            .filter(
                value =>
                    value !== ''
            );

    return [...new Set(values)]
        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    'id',
                    {
                        sensitivity: 'base'
                    }
                )
        );
}


// ======================================================
// 7. ISI DROPDOWN
// ======================================================

function isiDropdown(
    selectElement,
    daftarNilai,
    teksDefault,
    nilaiTerpilih
) {

    if (!selectElement) {
        return;
    }

    selectElement.innerHTML = '';


    const defaultOption =
        document.createElement(
            'option'
        );

    defaultOption.value = '';

    defaultOption.textContent =
        teksDefault;

    selectElement.appendChild(
        defaultOption
    );


    daftarNilai.forEach(
        nilai => {

            const option =
                document.createElement(
                    'option'
                );

            option.value = nilai;

            option.textContent = nilai;

            selectElement.appendChild(
                option
            );
        }
    );


    if (
        nilaiTerpilih &&
        daftarNilai.includes(
            nilaiTerpilih
        )
    ) {

        selectElement.value =
            nilaiTerpilih;

    } else {

        selectElement.value = '';
    }
}


// ======================================================
// 8. DAPATKAN PILIHAN FILTER
// ======================================================

function dapatkanPilihanFilter() {

    return {

        kecamatan:
            filterDataKecamatan
                ? filterDataKecamatan.value
                : '',

        desa:
            filterDataDesa
                ? filterDataDesa.value
                : '',

        penggunaan:
            filterDataPenggunaan
                ? filterDataPenggunaan.value
                : '',

        status:
            filterDataStatus
                ? filterDataStatus.value
                : ''
    };
}


// ======================================================
// 9. CEK FEATURE TERHADAP FILTER
// ======================================================

function cocokDenganPilihan(
    feature,
    pilihan,
    abaikanField = null
) {

    const p =
        feature.properties || {};


    const daftarField = [
        'kecamatan',
        'desa',
        'penggunaan',
        'status'
    ];


    return daftarField.every(
        field => {

            if (
                field === abaikanField
            ) {
                return true;
            }


            const nilaiPilihan =
                pilihan[field] || '';


            if (
                nilaiPilihan === ''
            ) {
                return true;
            }


            return (
                normalisasiNilai(
                    p[field]
                )
                ===
                nilaiPilihan
            );
        }
    );
}


// ======================================================
// 10. UPDATE FILTER DINAMIS
// Kecamatan <-> Desa <-> Penggunaan <-> Status
// ======================================================

function updatePilihanFilter() {

    if (
        dataAsetAsli.length === 0
    ) {
        return;
    }


    for (
        let i = 0;
        i < 4;
        i++
    ) {


        // ----------------------------------------------
        // KECAMATAN
        // ----------------------------------------------

        let pilihan =
            dapatkanPilihanFilter();


        const dataKecamatan =
            dataAsetAsli.filter(
                feature =>
                    cocokDenganPilihan(
                        feature,
                        pilihan,
                        'kecamatan'
                    )
            );


        const daftarKecamatan =
            ambilNilaiUnik(
                dataKecamatan,
                'kecamatan'
            );


        if (
            pilihan.kecamatan !== '' &&
            !daftarKecamatan.includes(
                pilihan.kecamatan
            )
        ) {

            filterDataKecamatan.value = '';
        }


        // ----------------------------------------------
        // DESA
        // ----------------------------------------------

        pilihan =
            dapatkanPilihanFilter();


        const dataDesa =
            dataAsetAsli.filter(
                feature =>
                    cocokDenganPilihan(
                        feature,
                        pilihan,
                        'desa'
                    )
            );


        const daftarDesa =
            ambilNilaiUnik(
                dataDesa,
                'desa'
            );


        if (
            pilihan.desa !== '' &&
            !daftarDesa.includes(
                pilihan.desa
            )
        ) {

            filterDataDesa.value = '';
        }


        // ----------------------------------------------
        // PENGGUNAAN
        // ----------------------------------------------

        pilihan =
            dapatkanPilihanFilter();


        const dataPenggunaan =
            dataAsetAsli.filter(
                feature =>
                    cocokDenganPilihan(
                        feature,
                        pilihan,
                        'penggunaan'
                    )
            );


        const daftarPenggunaan =
            ambilNilaiUnik(
                dataPenggunaan,
                'penggunaan'
            );


        if (
            pilihan.penggunaan !== '' &&
            !daftarPenggunaan.includes(
                pilihan.penggunaan
            )
        ) {

            filterDataPenggunaan.value = '';
        }


        // ----------------------------------------------
        // STATUS
        // ----------------------------------------------

        pilihan =
            dapatkanPilihanFilter();


        const dataStatus =
            dataAsetAsli.filter(
                feature =>
                    cocokDenganPilihan(
                        feature,
                        pilihan,
                        'status'
                    )
            );


        const daftarStatus =
            ambilNilaiUnik(
                dataStatus,
                'status'
            );


        if (
            pilihan.status !== '' &&
            !daftarStatus.includes(
                pilihan.status
            )
        ) {

            filterDataStatus.value = '';
        }


        // ----------------------------------------------
        // ISI ULANG DROPDOWN
        // ----------------------------------------------

        const pilihanFinal =
            dapatkanPilihanFilter();


        isiDropdown(
            filterDataKecamatan,
            daftarKecamatan,
            'Semua Kecamatan',
            pilihanFinal.kecamatan
        );


        isiDropdown(
            filterDataDesa,
            daftarDesa,
            'Semua Desa',
            pilihanFinal.desa
        );


        isiDropdown(
            filterDataPenggunaan,
            daftarPenggunaan,
            'Semua Penggunaan',
            pilihanFinal.penggunaan
        );


        isiDropdown(
            filterDataStatus,
            daftarStatus,
            'Semua Status',
            pilihanFinal.status
        );
    }
}


// ======================================================
// 11. DAPATKAN DATA SESUAI FILTER + SEARCH
// ======================================================

function dapatkanDataTerfilter() {

    const pilihan =
        dapatkanPilihanFilter();


    const keyword =
        normalisasiPencarian(
            searchDataAset.value
        );


    return dataAsetAsli.filter(
        feature => {


            const cocokFilter =
                cocokDenganPilihan(
                    feature,
                    pilihan
                );


            if (!cocokFilter) {

                return false;
            }


            if (
                keyword === ''
            ) {

                return true;
            }


            const p =
                feature.properties || {};


            const teksGabungan = [

                p.id_barang,

                p.penggunaan,

                p.nub,

                p.kecamatan,

                p.desa,

                p.status,

                p.keterangan

            ]
            .map(
                normalisasiPencarian
            )
            .join(' ');


            return teksGabungan.includes(
                keyword
            );
        }
    );
}


// ======================================================
// 12. TAMPILKAN DATA KE TABEL
// ======================================================

function tampilkanDataAset(features) {

    if (!dataAsetBody) {
        return;
    }


    dataAsetBody.innerHTML = '';


    if (
        features.length === 0
    ) {

        dataAsetBody.innerHTML = `
            <tr>

                <td
                    colspan="9"
                    class="data-kosong"
                >
                    Data aset tidak ditemukan.
                </td>

            </tr>
        `;

        return;
    }


    features.forEach(
        (feature, index) => {

            const p =
                feature.properties || {};


            const row =
                document.createElement(
                    'tr'
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHTML(
                        p.id_barang
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        p.penggunaan
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        p.nub
                    )}
                </td>

                <td>
                    ${formatLuas(
                        p.luas_m2
                    )} m²
                </td>

                <td>
                    ${escapeHTML(
                        p.kecamatan
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        p.desa
                    )}
                </td>

                <td>

                    <span class="table-status">

                        ${escapeHTML(
                            p.status
                        )}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-lihat-peta"
                        type="button"
                    >
                        Lihat
                    </button>

                </td>

            `;


            dataAsetBody.appendChild(
                row
            );


            // ------------------------------------------
            // TOMBOL LIHAT DI PETA
            // ------------------------------------------

            const tombolLihat =
                row.querySelector(
                    '.btn-lihat-peta'
                );


            tombolLihat.addEventListener(
                'click',
                function() {

                    const featureString =
                        encodeURIComponent(
                            JSON.stringify(
                                feature
                            )
                        );


                    window.location.href =
                        `peta.html?aset=${featureString}`;
                }
            );
        }
    );
}


// ======================================================
// 13. UPDATE TABEL
// ======================================================

function updateTabel() {

    const hasil =
        dapatkanDataTerfilter();


    tampilkanDataAset(
        hasil
    );
}


// ======================================================
// 14. EVENT FILTER
// ======================================================

function filterBerubah() {

    updatePilihanFilter();

    updateTabel();
}


if (filterDataKecamatan) {

    filterDataKecamatan
        .addEventListener(
            'change',
            filterBerubah
        );
}


if (filterDataDesa) {

    filterDataDesa
        .addEventListener(
            'change',
            filterBerubah
        );
}


if (filterDataPenggunaan) {

    filterDataPenggunaan
        .addEventListener(
            'change',
            filterBerubah
        );
}


// STATUS BARU
if (filterDataStatus) {

    filterDataStatus
        .addEventListener(
            'change',
            filterBerubah
        );
}


// ======================================================
// 15. EVENT SEARCH
// ======================================================

if (searchDataAset) {

    searchDataAset.addEventListener(
        'input',
        function() {

            updateTabel();

        }
    );
}


// ======================================================
// 16. RESET FILTER
// ======================================================

if (resetDataFilter) {

    resetDataFilter.addEventListener(
        'click',
        function() {


            filterDataKecamatan.value = '';

            filterDataDesa.value = '';

            filterDataPenggunaan.value = '';

            filterDataStatus.value = '';

            searchDataAset.value = '';


            updatePilihanFilter();

            updateTabel();

        }
    );
}


// ======================================================
// 17. LOAD GEOJSON
// ======================================================

fetch(
    'data/Aset Pemda Cirebon.geojson'
)

    .then(response => {

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        return response.json();
    })

    .then(data => {


        dataAsetAsli =
            data.features || [];


        updatePilihanFilter();


        tampilkanDataAset(
            dataAsetAsli
        );

    })

    .catch(error => {


        console.error(
            'Gagal memuat data aset:',
            error
        );


        if (dataAsetBody) {

            dataAsetBody.innerHTML = `
                <tr>

                    <td
                        colspan="9"
                        class="data-kosong"
                    >
                        Gagal memuat data aset.
                    </td>

                </tr>
            `;
        }

    });