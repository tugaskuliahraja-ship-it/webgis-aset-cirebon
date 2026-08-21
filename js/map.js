// ======================================================
// 1. MEMBUAT PETA
// ======================================================

const map = L.map('map', {
    center: [-6.75, 108.55],
    zoom: 11
});


// ======================================================
// 2. CEK APAKAH DATANG DARI HALAMAN DATA ASET
// ======================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const adaAsetDariURL =
    urlParams.has('aset');


// ======================================================
// 3. BASEMAP
// ======================================================

// OpenStreetMap
const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 19,
        attribution:
            '&copy; OpenStreetMap contributors'
    }
);


// Carto Light
const cartoLight = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
        maxZoom: 20,
        attribution:
            '&copy; OpenStreetMap contributors &copy; CARTO'
    }
);


// Esri World Imagery
const esriSatellite = L.tileLayer(
    'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        maxZoom: 19,

        attribution:
            'Tiles &copy; Esri'
    }
);


// Basemap default
esriSatellite.addTo(map);


// ======================================================
// 4. LAYER CONTROL
// ======================================================

const baseMaps = {

    "Esri World Imagery":
        esriSatellite,

    "Carto Light":
        cartoLight,

    "OpenStreetMap":
        osm
};


const layerControl =
    L.control.layers(
        baseMaps,
        {},
        {
            position: 'topright',
            collapsed: true
        }
    ).addTo(map);


// ======================================================
// 5. FUNGSI FETCH GEOJSON
// ======================================================

async function ambilGeoJSON(url) {

    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            `Gagal mengambil ${url} - HTTP ${response.status}`
        );
    }


    return await response.json();
}


// ======================================================
// 6. BATAS KABUPATEN
// ======================================================

let batasKabupaten = null;


ambilGeoJSON(
    'data/Batas Kabupaten Cirebon.geojson'
)
    .then(data => {

        batasKabupaten =
            L.geoJSON(
                data,
                {
                    style: {

                        color:
                            '#000000',

                        weight:
                            2.5,

                        opacity:
                            1,

                        fillOpacity:
                            0,

                        dashArray:
                            '12, 4, 2, 3, 2, 4'
                    }
                }
            ).addTo(map);


        layerControl.addOverlay(
            batasKabupaten,
            'Batas Kabupaten'
        );


        // Jangan zoom kabupaten jika
        // datang dari tombol Lihat
        if (!adaAsetDariURL) {

            const bounds =
                batasKabupaten.getBounds();


            if (bounds.isValid()) {

                map.fitBounds(
                    bounds
                );
            }
        }

    })

    .catch(error => {

        console.error(
            'Gagal memuat batas kabupaten:',
            error
        );

    });


// ======================================================
// 7. BATAS KECAMATAN
// ======================================================

let batasKecamatan = null;


ambilGeoJSON(
    'data/Batas Kecamatan Cirebon.geojson'
)
    .then(data => {

        batasKecamatan =
            L.geoJSON(
                data,
                {
                    style: {

                        color:
                            '#000000',

                        weight:
                            1.2,

                        opacity:
                            0.8,

                        fillOpacity:
                            0,

                        dashArray:
                            '10, 4, 2, 3, 2, 3, 2, 4'
                    }
                }
            ).addTo(map);


        layerControl.addOverlay(
            batasKecamatan,
            'Batas Kecamatan'
        );

    })

    .catch(error => {

        console.error(
            'Gagal memuat batas kecamatan:',
            error
        );

    });


// ======================================================
// 8. BATAS DESA
// Default tidak langsung ditampilkan
// ======================================================

let batasDesa = null;


ambilGeoJSON(
    'data/Batas Desa Cirebon.geojson'
)
    .then(data => {

        batasDesa =
            L.geoJSON(
                data,
                {
                    style: {

                        color:
                            '#555555',

                        weight:
                            0.6,

                        opacity:
                            0.65,

                        fillOpacity:
                            0,

                        dashArray:
                            '4, 4'
                    }
                }
            );


        layerControl.addOverlay(
            batasDesa,
            'Batas Desa'
        );

    })

    .catch(error => {

        console.error(
            'Gagal memuat batas desa:',
            error
        );

    });


// ======================================================
// 9. VARIABEL DATA ASET
// ======================================================

let asetPemda = null;

let dataAsetAsli = null;


// ======================================================
// 10. ELEMEN HTML
// ======================================================

const filterKecamatan =
    document.getElementById(
        'filterKecamatan'
    );

const filterDesa =
    document.getElementById(
        'filterDesa'
    );

const filterPenggunaan =
    document.getElementById(
        'filterPenggunaan'
    );


// FILTER STATUS BARU
const filterStatus =
    document.getElementById(
        'filterStatus'
    );


const resetFilter =
    document.getElementById(
        'resetFilter'
    );

const searchAset =
    document.getElementById(
        'searchAset'
    );

const btnSearchAset =
    document.getElementById(
        'btnSearchAset'
    );

const hasilPencarian =
    document.getElementById(
        'hasilPencarian'
    );

const jumlahAset =
    document.getElementById(
        'jumlahAset'
    );

const totalLuas =
    document.getElementById(
        'totalLuas'
    );
const toggleFilterPanel =
    document.getElementById(
        'toggleFilterPanel'
    );

const filterPanel =
    document.querySelector(
        '.filter-panel'
    );


// ======================================================
// 11. STYLE ASET
// ======================================================

function getAsetStyle(feature) {

    const penggunaan =
        feature.properties.penggunaan;


    const warnaPenggunaan = {

        "Jalan":
            "#D32F2F",

        "Saluran":
            "#29B6F6",

        "RTH":
            "#2E7D32",

        "Taman":
            "#66BB6A",

        "Jalur Hijau":
            "#8BC34A",

        "Fasilitas Kesehatan":
            "#EC407A",

        "Fasilitas Sosial":
            "#8E44AD",

        "Fasilitas Umum":
            "#F57C00",

        "Pendidikan":
            "#FBC02D",

        "Sarana Olahraga":
            "#00A896",

        "Sarana Peribadatan":
            "#3949AB",

        "Baperkam":
            "#795548",

        "Pos":
            "#EF6C00",

        "Gerbang":
            "#607D8B",

        "Pompa":
            "#00838F",

        "TPS":
            "#616161",

        "TPU":
            "#5D4037",

        "Brandgang":
            "#AD1457",

        "STK":
            "#FF8A65"
    };


    const warna =
        warnaPenggunaan[penggunaan] ||
        '#9E9E9E';


    return {

        color:
            warna,

        weight:
            0.5,

        opacity:
            1,

        fillColor:
            warna,

        fillOpacity:
            0.85
    };
}


// ======================================================
// 12. ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return '-';
    }


    return String(value)

        .replaceAll(
            '&',
            '&amp;'
        )

        .replaceAll(
            '<',
            '&lt;'
        )

        .replaceAll(
            '>',
            '&gt;'
        )

        .replaceAll(
            '"',
            '&quot;'
        )

        .replaceAll(
            "'",
            '&#039;'
        );
}


// ======================================================
// 13. PARSER LUAS
// ======================================================

function parseLuas(value) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {

        return 0;
    }


    if (
        typeof value === 'number'
    ) {

        return value;
    }


    let text =
        String(value).trim();


    if (text === '') {

        return 0;
    }


    if (
        text.includes('.') &&
        text.includes(',')
    ) {

        text =
            text
                .replaceAll(
                    '.',
                    ''
                )
                .replace(
                    ',',
                    '.'
                );

    } else if (
        text.includes(',') &&
        !text.includes('.')
    ) {

        text =
            text.replace(
                ',',
                '.'
            );
    }


    const hasil =
        parseFloat(text);


    return isNaN(hasil)
        ? 0
        : hasil;
}


// ======================================================
// 14. INTERAKSI ASET
// ======================================================

function pasangInteraksiAset(
    feature,
    layer
) {

    const p =
        feature.properties || {};


    // ==================================================
    // POPUP
    // ==================================================

    const popupContent = `

        <div class="popup-aset">

            <div class="popup-header">

                <div class="popup-title">
                    Informasi Aset
                </div>

                <div class="popup-subtitle">
                    ${escapeHTML(
                        p.penggunaan
                    )}
                </div>

            </div>


            <div class="popup-body">


                <div class="popup-row">

                    <div class="popup-label">
                        Kode Barang
                    </div>

                    <div class="popup-value">
                        ${escapeHTML(
                            p.id_barang
                        )}
                    </div>

                </div>


                <div class="popup-row">

                    <div class="popup-label">
                        Penggunaan
                    </div>

                    <div class="popup-value">
                        ${escapeHTML(
                            p.penggunaan
                        )}
                    </div>

                </div>


                <div class="popup-row">

                    <div class="popup-label">
                        NUB
                    </div>

                    <div class="popup-value">
                        ${escapeHTML(
                            p.nub
                        )}
                    </div>

                </div>


                <div class="popup-row">

                    <div class="popup-label">
                        Luas
                    </div>

                    <div class="popup-value">
                        ${escapeHTML(
                            p.luas_m2
                        )} m²
                    </div>

                </div>


                <div class="popup-row">

                    <div class="popup-label">
                        Kecamatan
                    </div>

                    <div class="popup-value">
                        ${escapeHTML(
                            p.kecamatan
                        )}
                    </div>

                </div>


                <div class="popup-row">

                    <div class="popup-label">
                        Desa
                    </div>

                    <div class="popup-value">
                        ${escapeHTML(
                            p.desa
                        )}
                    </div>

                </div>


                <div class="popup-row">

                    <div class="popup-label">
                        Status
                    </div>

                    <div class="popup-value">

                        <span class="status-badge">

                            ${escapeHTML(
                                p.status
                            )}

                        </span>

                    </div>

                </div>


                <div class="popup-row">

                    <div class="popup-label">
                        Keterangan
                    </div>

                    <div class="popup-value">

                        ${escapeHTML(
                            p.keterangan
                        )}

                    </div>

                </div>


            </div>

        </div>
    `;


    layer.bindPopup(
        popupContent,
        {
            minWidth:
                275,

            maxWidth:
                275,

            className:
                'popup-aset-wrapper',

            autoPan:
                true,

            autoPanPadding:
                [40, 40]
        }
    );


    // ==================================================
    // TOOLTIP
    // ==================================================

    const tooltipContent = `

        <div class="tooltip-aset">

            <div class="tooltip-title">

                ${escapeHTML(
                    p.penggunaan ||
                    'Aset Pemda'
                )}

            </div>

            <div class="tooltip-keterangan">

                ${escapeHTML(
                    p.keterangan ||
                    'Tidak ada keterangan'
                )}

            </div>

        </div>
    `;


    layer.bindTooltip(
        tooltipContent,
        {
            sticky:
                true,

            direction:
                'top',

            offset:
                [0, -10],

            opacity:
                1,

            interactive:
                false,

            className:
                'tooltip-aset-wrapper'
        }
    );


    // ==================================================
    // HOVER MASUK
    // ==================================================

    layer.on(
    'mouseover',
    function(e) {

        // Saat ukur jarak aktif,
        // interaksi aset dimatikan
        if (modeUkurJarak) {

            layer.closeTooltip();

            return;
        }


        if (!layer.isPopupOpen()) {

            layer.openTooltip();
        }


        e.target.setStyle({
            weight: 2,
            color: '#FFFFFF',
            fillOpacity: 1
        });


        e.target.bringToFront();
    }
);

    // ==================================================
    // HOVER KELUAR
    // ==================================================

    layer.on(
    'mouseout',
    function(e) {

        layer.closeTooltip();


        if (asetPemda) {

            asetPemda.resetStyle(
                e.target
            );
        }


        if (modeUkurJarak) {

            return;
        }
    }
);


    layer.on(
    'click',
    function() {

        layer.closeTooltip();


        // Saat mode ukur aktif,
        // jangan biarkan popup aset tampil
        if (modeUkurJarak) {

            layer.closePopup();

            return;
        }
    }
);


    layer.on(
        'popupopen',
        function() {

            layer.closeTooltip();
        }
    );
}


// ======================================================
// 15. NORMALISASI NILAI
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

    return normalisasiNilai(
        value
    ).toLowerCase();
}


// ======================================================
// 16. AMBIL NILAI UNIK
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
                        feature
                            .properties[field]
                    )
            )

            .filter(
                value =>
                    value !== ''
            );


    return [
        ...new Set(values)
    ]

        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    'id',
                    {
                        sensitivity:
                            'base'
                    }
                )
        );
}


// ======================================================
// 17. ISI DROPDOWN
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


    selectElement.innerHTML =
        '';


    const defaultOption =
        document.createElement(
            'option'
        );


    defaultOption.value =
        '';

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


            option.value =
                nilai;

            option.textContent =
                nilai;


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

        selectElement.value =
            '';
    }
}


// ======================================================
// 18. CEK FEATURE DENGAN PILIHAN FILTER
// ======================================================

function cocokDenganPilihan(
    feature,
    pilihan,
    abaikanField = null
) {

    const p =
        feature.properties || {};


    const fields = [
        'kecamatan',
        'desa',
        'penggunaan',
        'status'
    ];


    return fields.every(
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
// 19. DAPATKAN PILIHAN FILTER SEKARANG
// ======================================================

function dapatkanPilihanFilter() {

    return {

        kecamatan:
            filterKecamatan
                ? filterKecamatan.value
                : '',

        desa:
            filterDesa
                ? filterDesa.value
                : '',

        penggunaan:
            filterPenggunaan
                ? filterPenggunaan.value
                : '',

        status:
            filterStatus
                ? filterStatus.value
                : ''
    };
}


// ======================================================
// 20. FEATURE SESUAI SEMUA FILTER
// ======================================================

function dapatkanFeatureTerfilter() {

    if (!dataAsetAsli) {

        return [];
    }


    const pilihan =
        dapatkanPilihanFilter();


    return dataAsetAsli.features.filter(
        feature =>
            cocokDenganPilihan(
                feature,
                pilihan
            )
    );
}


// ======================================================
// 21. UPDATE FILTER DINAMIS
// Kecamatan <-> Desa <-> Penggunaan <-> Status
// ======================================================

function updatePilihanFilter() {

    if (
        !dataAsetAsli ||
        !filterKecamatan ||
        !filterDesa ||
        !filterPenggunaan ||
        !filterStatus
    ) {

        return;
    }


    // Diulang agar keempat dropdown
    // selalu sinkron
    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const pilihan =
            dapatkanPilihanFilter();


        // ==================================================
        // KECAMATAN
        // ==================================================

        const dataKecamatan =
            dataAsetAsli.features.filter(
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

            filterKecamatan.value =
                '';
        }


        // ==================================================
        // DESA
        // ==================================================

        const pilihanSetelahKecamatan =
            dapatkanPilihanFilter();


        const dataDesa =
            dataAsetAsli.features.filter(
                feature =>
                    cocokDenganPilihan(
                        feature,
                        pilihanSetelahKecamatan,
                        'desa'
                    )
            );


        const daftarDesa =
            ambilNilaiUnik(
                dataDesa,
                'desa'
            );


        if (
            pilihanSetelahKecamatan.desa !== '' &&
            !daftarDesa.includes(
                pilihanSetelahKecamatan.desa
            )
        ) {

            filterDesa.value =
                '';
        }


        // ==================================================
        // PENGGUNAAN
        // ==================================================

        const pilihanSetelahDesa =
            dapatkanPilihanFilter();


        const dataPenggunaan =
            dataAsetAsli.features.filter(
                feature =>
                    cocokDenganPilihan(
                        feature,
                        pilihanSetelahDesa,
                        'penggunaan'
                    )
            );


        const daftarPenggunaan =
            ambilNilaiUnik(
                dataPenggunaan,
                'penggunaan'
            );


        if (
            pilihanSetelahDesa.penggunaan !== '' &&
            !daftarPenggunaan.includes(
                pilihanSetelahDesa.penggunaan
            )
        ) {

            filterPenggunaan.value =
                '';
        }


        // ==================================================
        // STATUS
        // ==================================================

        const pilihanSetelahPenggunaan =
            dapatkanPilihanFilter();


        const dataStatus =
            dataAsetAsli.features.filter(
                feature =>
                    cocokDenganPilihan(
                        feature,
                        pilihanSetelahPenggunaan,
                        'status'
                    )
            );


        const daftarStatus =
            ambilNilaiUnik(
                dataStatus,
                'status'
            );


        if (
            pilihanSetelahPenggunaan.status !== '' &&
            !daftarStatus.includes(
                pilihanSetelahPenggunaan.status
            )
        ) {

            filterStatus.value =
                '';
        }


        // ==================================================
        // ISI ULANG SEMUA DROPDOWN
        // ==================================================

        const pilihanFinal =
            dapatkanPilihanFilter();


        isiDropdown(
            filterKecamatan,
            daftarKecamatan,
            'Semua Kecamatan',
            pilihanFinal.kecamatan
        );


        isiDropdown(
            filterDesa,
            daftarDesa,
            'Semua Desa',
            pilihanFinal.desa
        );


        isiDropdown(
            filterPenggunaan,
            daftarPenggunaan,
            'Semua Penggunaan',
            pilihanFinal.penggunaan
        );


        isiDropdown(
            filterStatus,
            daftarStatus,
            'Semua Status',
            pilihanFinal.status
        );
    }
}


// ======================================================
// 22. UPDATE STATISTIK
// ======================================================

function updateStatistik(features) {

    if (
        !jumlahAset ||
        !totalLuas
    ) {

        return;
    }


    const jumlah =
        features.length;


    const total =
        features.reduce(
            (sum, feature) => {

                return (
                    sum +
                    parseLuas(
                        feature
                            .properties
                            .luas_m2
                    )
                );

            },
            0
        );


    jumlahAset.textContent =
        jumlah.toLocaleString(
            'id-ID'
        );


    totalLuas.textContent =
        total.toLocaleString(
            'id-ID',
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        ) + ' m²';
}


// ======================================================
// 23. TAMPILKAN FEATURE KE PETA
// ======================================================

function tampilkanFeature(
    features,
    opsi = {}
) {

    if (!asetPemda) {

        return;
    }


    asetPemda.clearLayers();


    asetPemda.addData({

        type:
            'FeatureCollection',

        features:
            features
    });


    updateStatistik(
        features
    );


    if (
        opsi.zoom &&
        features.length > 0
    ) {

        const bounds =
            asetPemda.getBounds();


        if (
            bounds.isValid()
        ) {

            map.fitBounds(
                bounds,
                {
                    padding:
                        [40, 40],

                    maxZoom:
                        opsi.maxZoom ||
                        17
                }
            );
        }
    }
}


// ======================================================
// 24. TERAPKAN FILTER
// ======================================================

function terapkanFilter(
    zoom = true
) {

    const hasil =
        dapatkanFeatureTerfilter();


    const pilihan =
        dapatkanPilihanFilter();


    const adaFilter =
        Object.values(
            pilihan
        )
        .some(
            value =>
                value !== ''
        );


    tampilkanFeature(
        hasil,
        {
            zoom:
                zoom &&
                adaFilter,

            maxZoom:
                17
        }
    );
}


// ======================================================
// 25. EVENT FILTER
// ======================================================

function filterBerubah() {

    updatePilihanFilter();


    terapkanFilter(
        true
    );


    if (
        searchAset &&
        searchAset.value
            .trim() !== ''
    ) {

        tampilkanHasilPencarian();
    }
}


if (filterKecamatan) {

    filterKecamatan.addEventListener(
        'change',
        filterBerubah
    );
}


if (filterDesa) {

    filterDesa.addEventListener(
        'change',
        filterBerubah
    );
}


if (filterPenggunaan) {

    filterPenggunaan.addEventListener(
        'change',
        filterBerubah
    );
}


// STATUS BARU
if (filterStatus) {

    filterStatus.addEventListener(
        'change',
        filterBerubah
    );
}


// ======================================================
// 26. RESET FILTER
// ======================================================

if (resetFilter) {

    resetFilter.addEventListener(
        'click',
        function() {


            if (filterKecamatan) {

                filterKecamatan.value =
                    '';
            }


            if (filterDesa) {

                filterDesa.value =
                    '';
            }


            if (filterPenggunaan) {

                filterPenggunaan.value =
                    '';
            }


            if (filterStatus) {

                filterStatus.value =
                    '';
            }


            if (searchAset) {

                searchAset.value =
                    '';
            }


            if (hasilPencarian) {

                hasilPencarian.innerHTML =
                    '';

                hasilPencarian.style.display =
                    'none';
            }


            // Hapus ?aset= dari URL
            window.history.replaceState(
                {},
                '',
                'peta.html'
            );


            updatePilihanFilter();


            terapkanFilter(
                false
            );


            if (
                batasKabupaten &&
                batasKabupaten
                    .getBounds()
                    .isValid()
            ) {

                map.fitBounds(
                    batasKabupaten
                        .getBounds()
                );
            }

        }
    );
}


// ======================================================
// 27. PENCARIAN SESUAI FILTER AKTIF
// ======================================================

function dapatkanHasilPencarian(
    keyword
) {

    const kata =
        normalisasiPencarian(
            keyword
        );


    if (
        kata === ''
    ) {

        return [];
    }


    const dataTerfilter =
        dapatkanFeatureTerfilter();


    return dataTerfilter.filter(
        feature => {

            const p =
                feature.properties || {};


            const teksGabungan = [

                p.id_barang,

                p.nub,

                p.penggunaan,

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
                kata
            );
        }
    );
}


// ======================================================
// 28. TAMPILKAN HASIL PENCARIAN
// ======================================================

function tampilkanHasilPencarian() {

    if (
        !searchAset ||
        !hasilPencarian
    ) {

        return;
    }


    const keyword =
        searchAset.value.trim();


    if (
        keyword === ''
    ) {

        hasilPencarian.innerHTML =
            '';

        hasilPencarian.style.display =
            'none';


        terapkanFilter(
            false
        );


        return;
    }


    const hasil =
        dapatkanHasilPencarian(
            keyword
        );


    hasilPencarian.innerHTML =
        '';

    hasilPencarian.style.display =
        'block';


    if (
        hasil.length === 0
    ) {

        hasilPencarian.innerHTML = `

            <div class="hasil-kosong">

                Aset tidak ditemukan

            </div>
        `;

        return;
    }


    const hasilTerbatas =
        hasil.slice(
            0,
            50
        );


    hasilTerbatas.forEach(
        feature => {

            const p =
                feature.properties || {};


            const item =
                document.createElement(
                    'div'
                );


            item.className =
                'hasil-item';


            item.innerHTML = `

                <div class="hasil-penggunaan">

                    ${escapeHTML(
                        p.penggunaan ||
                        'Aset Pemda'
                    )}

                </div>


                <div class="hasil-lokasi">

                    ${escapeHTML(
                        p.desa
                    )},

                    ${escapeHTML(
                        p.kecamatan
                    )}

                </div>


                <div class="hasil-kode">

                    Status:
                    ${escapeHTML(
                        p.status
                    )}

                    &nbsp; | &nbsp;

                    NUB:
                    ${escapeHTML(
                        p.nub
                    )}

                </div>
            `;


            item.addEventListener(
                'click',
                function() {

                    pilihHasilPencarian(
                        feature
                    );
                }
            );


            hasilPencarian.appendChild(
                item
            );
        }
    );


    if (
        hasil.length > 50
    ) {

        const info =
            document.createElement(
                'div'
            );


        info.className =
            'hasil-kosong';


        info.textContent =
            `Menampilkan 50 dari ${hasil.length} hasil`;


        hasilPencarian.appendChild(
            info
        );
    }
}


// ======================================================
// 29. PILIH HASIL PENCARIAN
// ======================================================

function pilihHasilPencarian(
    feature
) {

    tampilkanFeature(
        [feature],
        {
            zoom:
                true,

            maxZoom:
                19
        }
    );


    if (hasilPencarian) {

        hasilPencarian.style.display =
            'none';
    }


    let layerTerpilih =
        null;


    asetPemda.eachLayer(
        function(layer) {

            layerTerpilih =
                layer;
        }
    );


    if (layerTerpilih) {

        setTimeout(
            function() {

                layerTerpilih
                    .openPopup();

            },
            300
        );
    }
}


// ======================================================
// 30. EVENT PENCARIAN
// ======================================================

if (btnSearchAset) {

    btnSearchAset.addEventListener(
        'click',
        tampilkanHasilPencarian
    );
}


if (searchAset) {

    searchAset.addEventListener(
        'input',
        function() {

            const keyword =
                searchAset.value
                    .trim();


            if (
                keyword === ''
            ) {

                if (
                    hasilPencarian
                ) {

                    hasilPencarian
                        .innerHTML =
                        '';

                    hasilPencarian
                        .style
                        .display =
                        'none';
                }


                terapkanFilter(
                    false
                );

            } else {

                tampilkanHasilPencarian();
            }
        }
    );


    searchAset.addEventListener(
        'keydown',
        function(event) {

            if (
                event.key !==
                'Enter'
            ) {

                return;
            }


            const hasil =
                dapatkanHasilPencarian(
                    searchAset.value
                );


            if (
                hasil.length === 1
            ) {

                pilihHasilPencarian(
                    hasil[0]
                );

            } else {

                tampilkanHasilPencarian();
            }
        }
    );
}


// ======================================================
// 31. BACA FEATURE DARI URL
// ======================================================

function ambilFeatureDariURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const asetParam =
        params.get(
            'aset'
        );


    if (!asetParam) {

        return null;
    }


    try {

        return JSON.parse(
            asetParam
        );

    } catch (
        errorPertama
    ) {


        try {

            return JSON.parse(
                decodeURIComponent(
                    asetParam
                )
            );

        } catch (
            errorKedua
        ) {

            console.error(
                'Parameter aset tidak dapat dibaca:',
                errorKedua
            );


            return null;
        }
    }
}


// ======================================================
// 32. BUKA ASET DARI HALAMAN DATA ASET
// ======================================================

function bukaAsetDariURL() {

    const feature =
        ambilFeatureDariURL();


    if (
        !feature ||
        !asetPemda
    ) {

        return;
    }


    asetPemda.clearLayers();


    asetPemda.addData({

        type:
            'FeatureCollection',

        features:
            [feature]
    });


    updateStatistik(
        [feature]
    );


    setTimeout(
        function() {


            map.invalidateSize(
                true
            );


            const bounds =
                asetPemda.getBounds();


            if (
                bounds.isValid()
            ) {

                map.fitBounds(
                    bounds,
                    {
                        paddingTopLeft:
                            [80, 80],

                        paddingBottomRight:
                            [80, 80],

                        maxZoom:
                            19,

                        animate:
                            true
                    }
                );
            }


            let layerTerpilih =
                null;


            asetPemda.eachLayer(
                function(layer) {

                    layerTerpilih =
                        layer;
                }
            );


            if (
                layerTerpilih
            ) {

                setTimeout(
                    function() {

                        layerTerpilih
                            .openPopup();

                    },
                    450
                );
            }

        },
        500
    );
}


// ======================================================
// 33. LOAD ASET PEMDA
// ======================================================

ambilGeoJSON(
    'data/Aset Pemda Cirebon.geojson'
)
    .then(data => {


        dataAsetAsli =
            data;


        asetPemda =
            L.geoJSON(
                data,
                {
                    style:
                        getAsetStyle,

                    onEachFeature:
                        pasangInteraksiAset
                }
            ).addTo(map);


        layerControl.addOverlay(
            asetPemda,
            'Aset Pemda'
        );


        // Isi Kecamatan, Desa,
        // Penggunaan, dan Status
        updatePilihanFilter();


        tampilkanFeature(
            data.features,
            {
                zoom:
                    false
            }
        );


        if (
            adaAsetDariURL
        ) {

            bukaAsetDariURL();
        }

    })

    .catch(error => {

        console.error(
            'Gagal memuat Aset Pemda:',
            error
        );

    });


// ======================================================
// 34. LEGENDA
// ======================================================

const legend =
    L.control({
        position:
            'bottomright'
    });


legend.onAdd =
    function() {


        const div =
            L.DomUtil.create(
                'div',
                'legend-aset'
            );


        const kategori = [

            [
                "Jalan",
                "#D32F2F"
            ],

            [
                "Saluran",
                "#29B6F6"
            ],

            [
                "RTH",
                "#2E7D32"
            ],

            [
                "Taman",
                "#66BB6A"
            ],

            [
                "Jalur Hijau",
                "#8BC34A"
            ],

            [
                "Fasilitas Kesehatan",
                "#EC407A"
            ],

            [
                "Fasilitas Sosial",
                "#8E44AD"
            ],

            [
                "Fasilitas Umum",
                "#F57C00"
            ],

            [
                "Pendidikan",
                "#FBC02D"
            ],

            [
                "Sarana Olahraga",
                "#00A896"
            ],

            [
                "Sarana Peribadatan",
                "#3949AB"
            ],

            [
                "Baperkam",
                "#795548"
            ],

            [
                "Pos",
                "#EF6C00"
            ],

            [
                "Gerbang",
                "#607D8B"
            ],

            [
                "Pompa",
                "#00838F"
            ],

            [
                "TPS",
                "#616161"
            ],

            [
                "TPU",
                "#5D4037"
            ],

            [
                "Brandgang",
                "#AD1457"
            ],

            [
                "STK",
                "#FF8A65"
            ]
        ];


        div.innerHTML = `

            <div class="legend-title">

                Legenda Aset

            </div>
        `;


        kategori.forEach(
            item => {

                div.innerHTML += `

                    <div class="legend-item">

                        <span
                            class="legend-color"
                            style="background:${item[1]}"
                        ></span>

                        <span>
                            ${item[0]}
                        </span>

                    </div>
                `;
            }
        );


        return div;
    };


legend.addTo(
    map
);

// ======================================================
// 35. TOOL UKUR JARAK
// ======================================================

const btnUkurJarak =
    document.getElementById(
        'btnUkurJarak'
    );

const btnHapusJarak =
    document.getElementById(
        'btnHapusJarak'
    );


let modeUkurJarak =
    false;

let titikJarak =
    [];

let markerJarak =
    [];

let garisJarak =
    null;

let labelJarak =
    null;


// Garis sementara
let garisJarakSementara =
    null;


// Label sementara
let labelJarakSementara =
    null;


// ======================================================
// 36. FORMAT JARAK
// ======================================================

function formatJarak(
    jarakMeter
) {

    if (
        jarakMeter >= 1000
    ) {

        return (
            jarakMeter / 1000
        ).toLocaleString(
            'id-ID',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ) + ' km';
    }


    return (
        jarakMeter
    ).toLocaleString(
        'id-ID',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + ' m';
}


// ======================================================
// 37. MODE UKUR JARAK
// ======================================================

function setModeUkurJarak(
    aktif
) {

    modeUkurJarak =
        aktif;


    const mapContainer =
        map.getContainer();


    if (aktif) {

        btnUkurJarak
            .classList
            .add('active');


        btnUkurJarak.title =
            'Klik titik pertama';


        // Tambahkan mode ukur ke container peta
        mapContainer
            .classList
            .add('mode-ukur-aktif');


        mapContainer.style.cursor =
            'crosshair';


        // Tutup popup yang mungkin sedang terbuka
        map.closePopup();


        // Tutup semua tooltip aset
        if (asetPemda) {

            asetPemda.eachLayer(
                function(layer) {

                    layer.closeTooltip();

                }
            );
        }


    } else {

        btnUkurJarak
            .classList
            .remove('active');


        btnUkurJarak.title =
            'Ukur Jarak';


        mapContainer
            .classList
            .remove('mode-ukur-aktif');


        mapContainer.style.cursor =
            '';
    }
}


// ======================================================
// 38. HAPUS GARIS SEMENTARA
// ======================================================

function hapusJarakSementara() {

    if (
        garisJarakSementara &&
        map.hasLayer(
            garisJarakSementara
        )
    ) {

        map.removeLayer(
            garisJarakSementara
        );
    }


    garisJarakSementara =
        null;


    if (
        labelJarakSementara &&
        map.hasLayer(
            labelJarakSementara
        )
    ) {

        map.removeLayer(
            labelJarakSementara
        );
    }


    labelJarakSementara =
        null;
}


// ======================================================
// 39. HAPUS HASIL PENGUKURAN
// ======================================================

function hapusPengukuranJarak() {

    titikJarak =
        [];


    markerJarak.forEach(
        marker => {

            if (
                map.hasLayer(
                    marker
                )
            ) {

                map.removeLayer(
                    marker
                );
            }
        }
    );


    markerJarak =
        [];


    if (
        garisJarak &&
        map.hasLayer(
            garisJarak
        )
    ) {

        map.removeLayer(
            garisJarak
        );
    }


    garisJarak =
        null;


    if (
        labelJarak &&
        map.hasLayer(
            labelJarak
        )
    ) {

        map.removeLayer(
            labelJarak
        );
    }


    labelJarak =
        null;


    hapusJarakSementara();


    btnHapusJarak.style.display =
        'none';


    setModeUkurJarak(
        false
    );
}


// ======================================================
// 40. TOMBOL UKUR
// ======================================================

btnUkurJarak.addEventListener(
    'click',
    function() {

        if (
            modeUkurJarak
        ) {

            hapusJarakSementara();

            setModeUkurJarak(
                false
            );

            return;
        }


        hapusPengukuranJarak();


        setModeUkurJarak(
            true
        );
    }
);


// ======================================================
// 41. TOMBOL HAPUS
// ======================================================

btnHapusJarak.addEventListener(
    'click',
    function() {

        hapusPengukuranJarak();
    }
);


// ======================================================
// 42. GERAKAN MOUSE
// GARIS + JARAK SEMENTARA
// ======================================================

map.on(
    'mousemove',
    function(e) {


        if (
            !modeUkurJarak ||
            titikJarak.length !== 1
        ) {

            return;
        }


        const titikAwal =
            titikJarak[0];

        const titikCursor =
            e.latlng;


        // ----------------------------------------------
        // GARIS SEMENTARA
        // ----------------------------------------------

        if (
            !garisJarakSementara
        ) {

            garisJarakSementara =
                L.polyline(
                    [
                        titikAwal,
                        titikCursor
                    ],
                    {
                        color:
                            '#F4C430',

                        weight:
                            2,

                        opacity:
                            0.95,

                        dashArray:
                            '6, 6'
                    }
                ).addTo(map);

        } else {

            garisJarakSementara
                .setLatLngs(
                    [
                        titikAwal,
                        titikCursor
                    ]
                );
        }


        // ----------------------------------------------
        // HITUNG JARAK SEMENTARA
        // ----------------------------------------------

        const jarakSementara =
            titikAwal.distanceTo(
                titikCursor
            );


        const hasilSementara =
            formatJarak(
                jarakSementara
            );


        // ----------------------------------------------
        // LABEL SEMENTARA
        // ----------------------------------------------

        if (
            !labelJarakSementara
        ) {

            labelJarakSementara =
                L.tooltip(
                    {
                        permanent:
                            true,

                        direction:
                            'top',

                        offset:
                            [0, -8],

                        className:
                            'tooltip-jarak-sementara'
                    }
                )

                .setLatLng(
                    titikCursor
                )

                .setContent(
                    hasilSementara
                )

                .addTo(map);

        } else {

            labelJarakSementara
                .setLatLng(
                    titikCursor
                )

                .setContent(
                    hasilSementara
                );
        }

    }
);


// ======================================================
// 43. KLIK PETA
// ======================================================

map.on(
    'click',
    function(e) {


        if (
            !modeUkurJarak
        ) {

            return;
        }


        // ==================================================
        // TITIK PERTAMA
        // ==================================================

        if (
            titikJarak.length === 0
        ) {

            titikJarak.push(
                e.latlng
            );


            const markerPertama =
                L.circleMarker(
                    e.latlng,
                    {
                        radius:
                            5,

                        color:
                            '#FFFFFF',

                        weight:
                            2,

                        fillColor:
                            '#F4C430',

                        fillOpacity:
                            1
                    }
                ).addTo(map);


            markerJarak.push(
                markerPertama
            );


            btnUkurJarak.title =
                'Klik titik kedua';


            return;
        }


        // ==================================================
        // TITIK KEDUA
        // ==================================================

        if (
            titikJarak.length === 1
        ) {

            titikJarak.push(
                e.latlng
            );


            hapusJarakSementara();


            const markerKedua =
                L.circleMarker(
                    e.latlng,
                    {
                        radius:
                            5,

                        color:
                            '#FFFFFF',

                        weight:
                            2,

                        fillColor:
                            '#F4C430',

                        fillOpacity:
                            1
                    }
                ).addTo(map);


            markerJarak.push(
                markerKedua
            );


            // ----------------------------------------------
            // GARIS FINAL
            // ----------------------------------------------

            garisJarak =
                L.polyline(
                    titikJarak,
                    {
                        color:
                            '#F4C430',

                        weight:
                            3,

                        opacity:
                            1,

                        dashArray:
                            '8, 5'
                    }
                ).addTo(map);


            // ----------------------------------------------
            // HITUNG JARAK FINAL
            // ----------------------------------------------

            const jarakMeter =
                titikJarak[0]
                    .distanceTo(
                        titikJarak[1]
                    );


            const hasilJarak =
                formatJarak(
                    jarakMeter
                );


            // ----------------------------------------------
            // TITIK TENGAH
            // ----------------------------------------------

            const titikTengah =
                L.latLng(

                    (
                        titikJarak[0].lat +
                        titikJarak[1].lat
                    ) / 2,

                    (
                        titikJarak[0].lng +
                        titikJarak[1].lng
                    ) / 2
                );


            // ----------------------------------------------
            // LABEL FINAL
            // ----------------------------------------------

            labelJarak =
                L.tooltip(
                    {
                        permanent:
                            true,

                        direction:
                            'center',

                        className:
                            'tooltip-jarak'
                    }
                )

                .setLatLng(
                    titikTengah
                )

                .setContent(
                    `Jarak: ${hasilJarak}`
                )

                .addTo(map);


            btnHapusJarak.style.display =
                'inline-flex';


            setModeUkurJarak(
                false
            );
        }

    }
);

// ======================================================
// 44. ESC UNTUK MEMBATALKAN PENGUKURAN
// ======================================================

document.addEventListener(
    'keydown',
    function(event) {

        if (
            event.key !== 'Escape'
        ) {
            return;
        }


        if (
            !modeUkurJarak &&
            titikJarak.length === 0
        ) {
            return;
        }


        // Hapus garis dan label sementara
        hapusJarakSementara();


        // Hapus titik pertama jika sudah dibuat
        markerJarak.forEach(
            marker => {

                if (
                    map.hasLayer(
                        marker
                    )
                ) {

                    map.removeLayer(
                        marker
                    );
                }
            }
        );


        markerJarak =
            [];

        titikJarak =
            [];


        // Kembali ke mode normal
        setModeUkurJarak(
            false
        );


        btnHapusJarak.style.display =
            'none';
    }
);

// ======================================================
// TOGGLE FILTER PANEL
// ======================================================

if (
    toggleFilterPanel &&
    filterPanel
) {

    toggleFilterPanel.addEventListener(
        'click',
        function() {

            const sedangTersembunyi =
                filterPanel.classList.toggle(
                    'filter-hidden'
                );


            if (sedangTersembunyi) {

                toggleFilterPanel.textContent =
                    'Filter';

            } else {

                toggleFilterPanel.textContent =
                    'Tutup';
            }

        }
    );
}

if (
    filterPanel &&
    toggleFilterPanel
) {

    filterPanel.classList.add(
        'filter-hidden'
    );

    toggleFilterPanel.textContent =
        'Filter';
}

// ======================================================
// IZINKAN SCROLL DI LEGENDA PADA MOBILE
// ======================================================

const legendAset =
    document.querySelector(
        '.legend-aset'
    );

if (legendAset) {

    L.DomEvent.disableScrollPropagation(
        legendAset
    );

    L.DomEvent.disableClickPropagation(
        legendAset
    );

    legendAset.addEventListener(
        'touchmove',
        function(event) {
            event.stopPropagation();
        },
        {
            passive: true
        }
    );

}
