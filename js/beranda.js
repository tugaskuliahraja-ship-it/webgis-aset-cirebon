// ======================================================
// DASHBOARD BERANDA
// ======================================================

fetch('data/Aset Pemda Cirebon.geojson')

    .then(response => {

        if (!response.ok) {

            throw new Error(
                'Gagal memuat data aset'
            );

        }

        return response.json();

    })

    .then(data => {

        const features =
            data.features || [];


        // ==================================================
        // TOTAL ASET
        // ==================================================

        const totalAset =
            features.length;


        // ==================================================
        // TOTAL LUAS
        // ==================================================

        const totalLuas =
            features.reduce(
                (total, feature) => {

                    const luas =
                        parseFloat(
                            feature.properties.luas_m2
                        );

                    if (isNaN(luas)) {
                        return total;
                    }

                    return total + luas;

                },
                0
            );


        // ==================================================
        // JUMLAH KECAMATAN
        // ==================================================

        const kecamatan =
            new Set(
                features
                    .map(
                        feature =>
                            feature.properties.kecamatan
                    )
                    .filter(
                        value =>
                            value !== null &&
                            value !== undefined &&
                            String(value).trim() !== ''
                    )
            );


        // ==================================================
        // JUMLAH DESA
        // ==================================================

        const desa =
            new Set(
                features
                    .map(
                        feature =>
                            feature.properties.desa
                    )
                    .filter(
                        value =>
                            value !== null &&
                            value !== undefined &&
                            String(value).trim() !== ''
                    )
            );
        
        // ==================================================
// DISTRIBUSI PENGGUNAAN
// ==================================================

const distribusiPenggunaan = {};

features.forEach(feature => {

    const penggunaan =
        feature.properties.penggunaan;

    const kategori =
        penggunaan &&
        String(penggunaan).trim() !== ''
            ? String(penggunaan).trim()
            : 'Tidak Diketahui';

    if (!distribusiPenggunaan[kategori]) {
        distribusiPenggunaan[kategori] = 0;
    }

    distribusiPenggunaan[kategori]++;
});


        // ==================================================
        // TAMPILKAN KE BERANDA
        // ==================================================

        document.getElementById(
            'dashboardTotalAset'
        ).textContent =
            totalAset.toLocaleString(
                'id-ID'
            );


        document.getElementById(
            'dashboardTotalLuas'
        ).textContent =
            totalLuas.toLocaleString(
                'id-ID',
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


        document.getElementById(
            'dashboardKecamatan'
        ).textContent =
            kecamatan.size;


        document.getElementById(
            'dashboardDesa'
        ).textContent =
            desa.size;
// ==================================================
// TAMPILKAN DISTRIBUSI PENGGUNAAN
// ==================================================

const distribusiContainer =
    document.getElementById(
        'distribusiPenggunaan'
    );

const daftarDistribusi =
    Object.entries(
        distribusiPenggunaan
    )
    .sort(
        (a, b) =>
            b[1] - a[1]
    );

distribusiContainer.innerHTML = '';

daftarDistribusi.forEach(
    ([kategori, jumlah]) => {

        const item =
            document.createElement(
                'div'
            );

        item.className =
            'distribusi-item';

        item.innerHTML = `
            <div class="distribusi-nama">
                ${kategori}
            </div>

            <div class="distribusi-jumlah">
                ${jumlah.toLocaleString('id-ID')}
            </div>
        `;

        distribusiContainer.appendChild(
            item
        );
    }
);

    })

    .catch(error => {

        console.error(
            'Dashboard gagal dimuat:',
            error
        );

    });