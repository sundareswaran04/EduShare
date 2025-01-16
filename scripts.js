function showSection(sectionId) {
  document.querySelectorAll('main section').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
}




document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('search-research')) {
    showSection('search-research');
  } else if (document.getElementById('projects-listing-section')) {
    showSection('projects-listing-section');
  }
});
