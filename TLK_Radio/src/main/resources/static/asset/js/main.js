const menuOpen = document.getElementById('menu-open');
const menuClose = document.getElementById('menu-close');
const sidebar = document.querySelector('.containers .sidebar');

menuOpen.addEventListener('click', () => sidebar.style.left = '0');

menuClose.addEventListener('click', () => sidebar.style.left = '-100%');
