console.log("Frontend app is running");

const currentPage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll('.nav-links a[href]');

navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || (linkHref === 'customer.html' && currentPage === '')) {
        link.classList.add('active');
    }
});