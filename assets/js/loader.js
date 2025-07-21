// Loader fade out logic for all pages
window.addEventListener('load', function () {
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
        pageLoader.style.opacity = '0';
        setTimeout(() => {
            pageLoader.style.visibility = 'hidden';
        }, 300);
    }
}); 