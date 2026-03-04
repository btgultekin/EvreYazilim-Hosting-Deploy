(() => {
    const sidebar = document.getElementById("adminSidebar");
    const toggle = document.getElementById("sidebarToggle");

    if (!sidebar || !toggle) {
        return;
    }

    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    document.addEventListener("click", (event) => {
        if (window.innerWidth > 992 || !sidebar.classList.contains("open")) {
            return;
        }

        const clickInsideSidebar = sidebar.contains(event.target);
        const clickOnToggle = toggle.contains(event.target);
        if (!clickInsideSidebar && !clickOnToggle) {
            sidebar.classList.remove("open");
        }
    });
})();

(() => {
    const deleteForms = document.querySelectorAll("form[data-confirm-delete='true']");
    if (!deleteForms.length) {
        return;
    }

    deleteForms.forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const message = form.getAttribute("data-confirm-message") || "Bu kaydi silmek istediginize emin misiniz?";

            const result = await Swal.fire({
                title: "Emin misiniz?",
                text: message,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Evet, sil",
                cancelButtonText: "Vazgec",
                reverseButtons: true,
                focusCancel: true
            });

            if (result.isConfirmed) {
                form.submit();
            }
        });
    });
})();

(() => {
    const body = document.body;
    const toggleButton = document.getElementById("adminThemeToggle");
    if (!body || !toggleButton) {
        return;
    }

    const storageKey = "evre-admin-theme";
    const icon = toggleButton.querySelector("i");
    const text = toggleButton.querySelector("span");

    const applyTheme = (theme) => {
        const normalized = theme === "dark" ? "dark" : "light";
        body.setAttribute("data-admin-theme", normalized);
        toggleButton.setAttribute("aria-pressed", normalized === "dark" ? "true" : "false");

        if (icon) {
            icon.className = normalized === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }

        if (text) {
            text.textContent = normalized === "dark" ? "Light" : "Dark";
        }
    };

    const preferredBySystem = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem(storageKey);
    applyTheme(savedTheme ?? (preferredBySystem ? "dark" : "light"));

    toggleButton.addEventListener("click", () => {
        const current = body.getAttribute("data-admin-theme") === "dark" ? "dark" : "light";
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(storageKey, next);
    });
})();
