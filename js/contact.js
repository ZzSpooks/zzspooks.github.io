/**
 * contact.js — Copie de l'adresse e-mail en un clic + notification toast "Copié !"
 */

document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copy-email-btn');
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');

    if (!copyBtn) return;

    const email = copyBtn.dataset.email || 'mathisgomes@proton.me';
    let toastTimer = null;
    let btnTimer = null;

    const showToast = (message) => {
        if (!toast) return;
        if (toastMessage) {
            toastMessage.textContent = message;
        }
        toast.classList.add('is-visible');

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 2600);
    };

    const setCopiedButtonState = () => {
        const label = copyBtn.querySelector('.copy-btn-label');
        copyBtn.classList.add('is-copied');
        if (label) {
            label.textContent = 'Copié !';
        }

        clearTimeout(btnTimer);
        btnTimer = setTimeout(() => {
            copyBtn.classList.remove('is-copied');
            if (label) {
                label.textContent = 'Copier';
            }
        }, 2200);
    };

    copyBtn.addEventListener('click', async () => {
        const copied = await copyToClipboard(email);
        if (copied) {
            setCopiedButtonState();
            showToast('Adresse e-mail copiée dans le presse-papier !');
        } else {
            showToast(`Copiez manuellement : ${email}`);
        }
    });
});

async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fallback ci-dessous
        }
    }

    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    helper.style.left = '-9999px';
    document.body.appendChild(helper);
    helper.select();

    let success = false;
    try {
        success = document.execCommand('copy');
    } catch {
        success = false;
    }

    document.body.removeChild(helper);
    return success;
}
