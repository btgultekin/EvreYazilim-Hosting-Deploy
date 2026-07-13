(() => {
    const form = document.getElementById("evrePosVersionForm");
    if (!form) {
        return;
    }

    const progressPanel = document.getElementById("evrePosUploadProgress");
    const progressBar = document.getElementById("evrePosUploadProgressBar");
    const progressLabel = document.getElementById("evrePosUploadProgressLabel");
    const progressPercent = document.getElementById("evrePosUploadProgressPercent");
    const submitButton = form.querySelector('button[type="submit"]');
    const successMessage = form.getAttribute("data-success-message")
        || "EvrePOS surumu basariyla kaydedildi.";
    const indexUrl = form.getAttribute("data-index-url") || "/Admin/EvrePosVersion";

    let uploading = false;

    const setProgress = (percent, label) => {
        const clamped = Math.max(0, Math.min(100, Math.round(percent)));
        if (progressBar) {
            progressBar.style.width = `${clamped}%`;
            progressBar.setAttribute("aria-valuenow", String(clamped));
            progressBar.classList.toggle("progress-bar-animated", clamped < 100 || label === "processing");
        }
        if (progressPercent) {
            progressPercent.textContent = `${clamped}%`;
        }
        if (progressLabel && label) {
            progressLabel.textContent = label === "processing"
                ? "Dosya alindi, surum kaydediliyor..."
                : label === "uploading"
                    ? "Dosya yukleniyor..."
                    : label;
        }
    };

    const showProgress = () => {
        if (progressPanel) {
            progressPanel.classList.remove("d-none");
        }
        setProgress(0, "uploading");
    };

    const hideProgress = () => {
        if (progressPanel) {
            progressPanel.classList.add("d-none");
        }
        setProgress(0, "uploading");
    };

    const setFormBusy = (busy) => {
        uploading = busy;
        form.querySelectorAll("input, textarea, button, select, a.btn").forEach((el) => {
            if (el.classList.contains("btn-light") && el.tagName === "A") {
                el.classList.toggle("disabled", busy);
                if (busy) {
                    el.setAttribute("aria-disabled", "true");
                    el.setAttribute("tabindex", "-1");
                } else {
                    el.removeAttribute("aria-disabled");
                    el.removeAttribute("tabindex");
                }
                return;
            }

            if ("disabled" in el) {
                el.disabled = busy;
            }
        });

        if (submitButton) {
            submitButton.innerHTML = busy
                ? '<i class="fa-solid fa-spinner fa-spin me-2"></i>Yukleniyor...'
                : '<i class="fa-solid fa-floppy-disk me-2"></i>Kaydet';
        }
    };

    const showToast = (title, icon) => {
        if (typeof Swal === "undefined") {
            return;
        }

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: icon,
            title: title,
            showConfirmButton: false,
            timer: 2600,
            timerProgressBar: true
        });
    };

    const isIndexUrl = (url) => {
        try {
            const path = new URL(url, window.location.origin).pathname.replace(/\/+$/, "").toLowerCase();
            return path.endsWith("/admin/evreposversion")
                || path.endsWith("/admin/evreposversion/index");
        } catch {
            return false;
        }
    };

    const replaceDocumentWithResponse = (html, url) => {
        if (url) {
            window.history.replaceState(null, "", url);
        }
        document.open();
        document.write(html);
        document.close();
    };

    form.addEventListener("submit", (event) => {
        if (uploading) {
            event.preventDefault();
            return;
        }

        // Progressive enhancement: XHR ile ayni endpoint'e multipart gonder.
        event.preventDefault();

        const formData = new FormData(form);
        const action = form.getAttribute("action") || window.location.href;

        showProgress();
        setFormBusy(true);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", action, true);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        xhr.upload.onprogress = (e) => {
            if (!e.lengthComputable || e.total <= 0) {
                if (progressLabel) {
                    progressLabel.textContent = "Dosya yukleniyor...";
                }
                return;
            }

            const percent = (e.loaded / e.total) * 100;
            setProgress(percent, "uploading");
        };

        xhr.upload.onload = () => {
            setProgress(100, "processing");
        };

        xhr.onload = () => {
            const finalUrl = xhr.responseURL || action;

            if (xhr.status >= 200 && xhr.status < 300 && isIndexUrl(finalUrl)) {
                setProgress(100, "Tamamlandi");
                // Index HTML icindeki TempData toast'u korumak icin yaniti dogrudan bas.
                if (xhr.responseText) {
                    replaceDocumentWithResponse(xhr.responseText, finalUrl);
                    return;
                }

                showToast(successMessage, "success");
                window.setTimeout(() => window.location.assign(indexUrl), 450);
                return;
            }

            if (xhr.status >= 200 && xhr.status < 300 && typeof xhr.responseText === "string" && xhr.responseText.length > 0) {
                // Dogrulama hatasi: sunucu Create/Edit view dondurdu — mevcut akisi koru.
                replaceDocumentWithResponse(xhr.responseText, finalUrl);
                return;
            }

            setFormBusy(false);
            hideProgress();
            showToast("Surum kaydedilirken bir hata olustu.", "error");
        };

        xhr.onerror = () => {
            setFormBusy(false);
            hideProgress();
            showToast("Baglanti hatasi. Lutfen tekrar deneyin.", "error");
        };

        xhr.onabort = () => {
            setFormBusy(false);
            hideProgress();
            showToast("Yukleme iptal edildi.", "warning");
        };

        xhr.send(formData);
    });
})();
