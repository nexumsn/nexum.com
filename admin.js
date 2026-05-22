const ADMIN_PASSWORD = "nexum2026";
const ADMIN_SESSION_KEY = "nexum-admin";

// --- INICIALIZACIÓN DE SEGURIDAD ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("Script cargado correctamente");

    // LOGIN: Solo se ejecuta si el formulario existe
    const loginForm = document.getElementById("adminLoginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const pass = document.getElementById("adminPassword").value;
            if (pass === ADMIN_PASSWORD) {
                localStorage.setItem(ADMIN_SESSION_KEY, "true");
                alert("Sesión iniciada");
                location.reload();
            } else {
                alert("Clave incorrecta");
            }
        });
    }

    // GUARDADO: Solo se ejecuta si el formulario existe
    const adminForm = document.getElementById("adminForm");
    if (adminForm) {
        adminForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Intentando guardar...");
            // Aquí va tu lógica de guardado
            alert("Guardado exitoso");
        });
    }
});
