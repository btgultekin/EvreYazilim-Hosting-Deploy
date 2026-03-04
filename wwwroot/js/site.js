(() => {
    const form = document.getElementById("callbackRequestForm");
    if (!form) {
        return;
    }

    const phoneInput = document.getElementById("callbackPhone");

    const applyPhoneMask = (value) => {
        const digits = value.replace(/\D/g, "");
        const local = digits.startsWith("90") ? digits.slice(2) : digits;
        const trimmed = local.slice(0, 10);

        if (!trimmed) {
            return "+90 ";
        }

        let output = "+90 ";
        if (trimmed.length <= 3) {
            return `${output}(${trimmed}`;
        }

        output += `(${trimmed.slice(0, 3)})`;

        if (trimmed.length <= 6) {
            return `${output} ${trimmed.slice(3)}`;
        }

        output += ` ${trimmed.slice(3, 6)}`;

        if (trimmed.length <= 8) {
            return `${output} ${trimmed.slice(6)}`;
        }

        output += ` ${trimmed.slice(6, 8)}`;
        return `${output} ${trimmed.slice(8, 10)}`;
    };

    if (phoneInput) {
        phoneInput.value = "+90 ";
        phoneInput.addEventListener("focus", () => {
            if (!phoneInput.value.trim()) {
                phoneInput.value = "+90 ";
            }
        });

        phoneInput.addEventListener("input", () => {
            phoneInput.value = applyPhoneMask(phoneInput.value);
        });
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const token = form.querySelector('input[name="__RequestVerificationToken"]')?.value;
        const rawPhone = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";

        if (rawPhone.length < 12) {
            await Swal.fire({
                icon: "warning",
                title: "Telefon numarasi eksik",
                text: "Lutfen telefon numarasini +90 formatinda tam olarak giriniz."
            });
            return;
        }

        try {
            const response = await fetch("/callback/submit", {
                method: "POST",
                body: formData,
                headers: token ? { "RequestVerificationToken": token } : {}
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                await Swal.fire({
                    icon: "error",
                    title: "Islem basarisiz",
                    text: result.message || "Talep gonderilirken bir hata olustu."
                });
                return;
            }

            form.reset();
            if (phoneInput) {
                phoneInput.value = "+90 ";
            }
            const modalEl = document.getElementById("callbackModal");
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }

            await Swal.fire({
                icon: "success",
                title: "Harika!",
                text: "Ekibimiz size en kisa surede donecek.",
                confirmButtonText: "Tamam"
            });
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "Baglanti hatasi",
                text: "Lutfen tekrar deneyin."
            });
            console.error(error);
        }
    });
})();
