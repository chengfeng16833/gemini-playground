// UI 工具函数

// 显示模态对话框
export function showModal({ title, content, confirmText = '确定', cancelText = '取消', showCancel = true, onConfirm, onCancel }) {
    const container = document.getElementById('modal-container') || document.body;

    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="icon-button close-modal">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${showCancel ? `<button class="secondary-button cancel-btn">${cancelText}</button>` : ''}
                    <button class="primary-button confirm-btn">${confirmText}</button>
                </div>
            </div>
        </div>
    `;

    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    const modal = modalElement.firstElementChild;
    container.appendChild(modal);

    // 绑定事件
    const closeModal = () => {
        modal.remove();
    };

    modal.querySelector('.close-modal')?.addEventListener('click', () => {
        if (onCancel) onCancel();
        closeModal();
    });

    modal.querySelector('.cancel-btn')?.addEventListener('click', () => {
        if (onCancel) onCancel();
        closeModal();
    });

    modal.querySelector('.confirm-btn')?.addEventListener('click', async () => {
        if (onConfirm) {
            const result = await onConfirm();
            if (result !== false) {
                closeModal();
            }
        } else {
            closeModal();
        }
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (onCancel) onCancel();
            closeModal();
        }
    });

    // ESC 键关闭
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            if (onCancel) onCancel();
            closeModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);

    return modal;
}

// 显示提示消息
export function showToast(message, type = 'info', duration = 3000) {
    const colors = {
        success: 'var(--success-color)',
        error: 'var(--danger-color)',
        warning: 'var(--warning-color)',
        info: 'var(--primary-color)'
    };

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 24px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-size: 14px;
    `;

    toast.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 20px;">${icons[type] || icons.info}</span>
        <span>${message}</span>
    `;

    // 添加动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;

    if (!document.querySelector('style[data-toast-style]')) {
        style.setAttribute('data-toast-style', 'true');
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// 确认对话框
export function showConfirm(message, onConfirm) {
    return showModal({
        title: '确认',
        content: `<p style="padding: 20px 0; line-height: 1.6;">${message}</p>`,
        confirmText: '确定',
        cancelText: '取消',
        onConfirm: () => {
            if (onConfirm) onConfirm();
            return true;
        }
    });
}

// 加载指示器
export function showLoading(message = '加载中...') {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    loading.innerHTML = `
        <div style="background: var(--bg-secondary); padding: 24px 32px; border-radius: 12px; text-align: center;">
            <div class="spinner" style="width: 40px; height: 40px; border: 4px solid var(--border-color); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
            <p style="color: var(--text-primary);">${message}</p>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;

    if (!document.querySelector('style[data-loading-style]')) {
        style.setAttribute('data-loading-style', 'true');
        document.head.appendChild(style);
    }

    document.body.appendChild(loading);

    return {
        close: () => loading.remove()
    };
}
