export function fadeIn(element) {
    element.style.opacity = 0;
    element.style.display = 'block';
    element.style.transition = 'opacity 0.3s';

    setTimeout(() => {
        element.style.opacity = 1;
    }, 10);
}

export function fadeOut(element, callback) {
    element.style.transition = 'opacity 0.3s';
    element.style.opacity = 0;
    setTimeout(() => {
        element.style.display = 'none';
        if (callback) callback();
    }, 300);
}

export function slideIn(element) {
    element.style.transform = 'translateY(-20px)';
    element.style.opacity = 0;
    element.style.display = 'block';
    element.style.transition = 'transform 0.3s, opacity 0.3s';

    setTimeout(() => {
        element.style.transform = 'translateY(0)';
        element.style.opacity = 1;
    }, 10);
}

export function slideOut(element, callback) {
    element.style.transition = 'transform 0.3s, opacity 0.3s';
    element.style.transform = 'translateY(-20px)';
    element.style.opacity = 0;

    setTimeout(() => {
        element.style.display = 'none';
        if (callback) callback();
    }, 300);
}