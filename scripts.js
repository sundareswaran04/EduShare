function showSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) {
    console.error(`Section with ID ${sectionId} not found`);
    return;
  }
  document.querySelectorAll('main section').forEach(section => {
    if (section) {
      section.style.display = 'none';
    }
  });
  section.style.display = 'block';
}

function handleFormSubmit(event, formId, url) {
  event.preventDefault(); // Prevent default form submission

  const form = document.getElementById(formId);
  const formData = new FormData(form); // Create FormData object from the form

  fetch(url, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
      alert(`File uploaded successfully! Filename: ${data.filename}`); // Fix here
      form.reset(); // Reset form after success
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while uploading the file.");
    });
}

function handleSearch(event, formId, url) {
  event.preventDefault();

  const form = document.getElementById(formId);
  const formData = new FormData(form);
  const queryString = new URLSearchParams(formData).toString();

  fetch(`${url}?${queryString}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const results = document.getElementById("search-results");
      results.innerHTML = ""; // Clear previous results

      if (!data || data.length === 0) {
        results.innerHTML = "<p>No results found.</p>";
        return;
      }

      data.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("col-md-4");
        div.classList.add("mb-4");
        div.innerHTML = `
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              <p class="card-text">Semester: ${item.semester}</p>
              <p class="card-text">Regulation: ${item.regulation}</p>
              <p class="card-text">Status: ${item.status}</p>
              ${item.status !== 'private' ? `<a href="uploads/${item.file_path}" class="btn btn-outline-primary btn-sm" download>Download</a>` : ''}
              ${item.status === 'private' ? '<button class="btn btn-outline-secondary btn-sm" onclick="showUnlockPopup()">Unlock</button>' : ''}
              <button class="btn btn-outline-secondary btn-sm" onclick="showEditPopup(${item.id})">Edit</button>
            </div>
            ${item.status === 'private' ? '<div class="overlay">Private</div>' : ''}
          </div>
        `;
        results.appendChild(div);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while searching.");
    });
}

function showUnlockPopup(materialId) {
  const loginPopup = document.getElementById('loginPopup');
  loginPopup.removeAttribute('inert'); // Remove inert attribute when showing the modal
  $('#loginPopup').modal('show');
  document.getElementById('loginForm').onsubmit = function(event) {
    handleUnlock(event, materialId);
  };
}

function handleUnlock(event, materialId) {
  event.preventDefault();
  const userId = document.querySelector('#loginPopup #userId').value;
  const password = document.querySelector('#loginPopup #password').value;

  fetch('/verify-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'User verified successfully') {
      // Unlock the material
      const overlayElement = document.querySelector(`#material-${materialId}.overlay`);
      if (overlayElement) {
        overlayElement.style.display = 'none';
        // Add download link
        const downloadLink = document.createElement('a');
        downloadLink.href = `uploads/${materialId}.pdf`; // Adjust the file path as needed
        downloadLink.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        downloadLink.innerText = 'Download';
        downloadLink.download = true;
        overlayElement.parentElement.appendChild(downloadLink);
      } else {
        console.error(`Element #material-${materialId}.overlay not found`);
      }
      $('#loginPopup').modal('hide');
      loginPopup.setAttribute('inert', ''); // Add inert attribute when hiding the modal
    } else {
      alert('Invalid UserId or Password');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while verifying the user.');
  });
}

function handleSearchProject(event, formId, url) {
  event.preventDefault();

  const form = document.getElementById(formId);
  const formData = new FormData(form);
  const queryString = new URLSearchParams(formData).toString();

  fetch(`${url}?${queryString}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const results = document.getElementById("projectsContainer");
      results.innerHTML = ""; // Clear previous results

      if (data.length === 0) {
        results.innerHTML = "<p>No results found.</p>";
        return;
      }

      data.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("col-md-4");
        div.classList.add("mb-4");
      
        // Shorten the description if it exceeds a certain length
        const shortDescription =
          item.description.length > 100
            ? item.description.substring(0, 100) + "..."
            : item.description;
      
        // Create the card content
        div.innerHTML = `
          <div class="card">
            <div class="card-body">
              <h5 class="card-title"><strong>${item.title}</strong></h5>
              <p class="card-text">${shortDescription}</p>
              <p class="card-text"><strong>Category:</strong> ${item.category}</p>
              <p class="card-text"><strong>Uploaded by:</strong> ${item.uploaded_by}</p>
              <p class="card-text"><small class="text-muted">Uploaded on: ${new Date(item.created_at).toLocaleDateString()}</small></p>
              <a href="uploads/${item.file_path}" class="btn btn-outline-primary btn-sm" download>Download</a>
              <button class="btn btn-outline-secondary btn-sm" onclick="showProjectDetails(${item.id})">View</button>
            </div>
          </div>
        `;
        results.appendChild(div);
      });
      
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while searching.");
    });
}

function showProjectDetails(projectId) {
  fetch(`/project-details?id=${projectId}`)
    .then(response => response.json())
    .then(data => {
      const modal = document.getElementById('projectDetailsModal');
      modal.querySelector('.modal-title').innerText = data.title;
      modal.querySelector('.modal-body').innerHTML = `
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Category:</strong> ${data.category}</p>
        <p><strong>Uploaded by:</strong> ${data.uploaded_by}</p>
        <p><strong>Uploaded on:</strong> ${new Date(data.created_at).toLocaleDateString()}</p>
        <a href="uploads/${data.file_path}" class="btn btn-outline-primary btn-sm" download>Download</a>
      `;
      $(modal).modal('show');
    })
    .catch(error => {
      console.error('Error fetching project details:', error);
      alert('An error occurred while fetching project details.');
    });
}

function handleResearchSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  const form = document.getElementById('uploadResearchForm');
  const formData = new FormData(form); // Create FormData object from the form

  fetch('/upload-research', {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
      alert(`Research submitted successfully!`);
      form.reset(); // Reset form after success
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while submitting the research.");
    });
}

// Ensure the correct section is shown when the page loads
document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('index.html')) {
    showSection('search-section'); // Show search section only on index.html
  }
});

function showEditPopup(materialId) {
  const userId = prompt('Enter your User ID:');
  const password = prompt('Enter your Password:');

  fetch('/verify-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.verified) {
      const overlayElement = document.querySelector(`#material-${materialId} .overlay`);
      if (overlayElement) {
        overlayElement.style.display = 'none';
      } else {
        console.error(`Element #material-${materialId} .overlay not found`);
      }
      $('#loginPopup').modal('hide');
    } else {
      alert('Invalid UserId or Password');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while verifying the user.');
  });
}

function handleEditMaterial(event) {
  event.preventDefault();
  const materialId = document.getElementById('editMaterialId').value;
  const materialTitle = document.getElementById('editMaterialTitle').value;
  const materialDescription = document.getElementById('editMaterialDescription').value;
  const materialSemester = document.getElementById('editMaterialSemester').value;
  const materialRegulation = document.getElementById('editMaterialRegulation').value;
  const userId = document.getElementById('editUserId').value;
  const password = document.getElementById('editPassword').value;

  fetch('/edit-material', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ materialId, materialTitle, materialDescription, materialSemester, materialRegulation, userId, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Material updated successfully') {
      alert('Material updated successfully');
      $('#editMaterialModal').modal('hide');
      location.reload();
    } else {
      alert(data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while updating the material.');
  });
}

function showEditPopup(projectId) {
  const userId = prompt('Enter your User ID:');
  const password = prompt('Enter your Password:');

  fetch('/verify-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'User verified successfully') {
      const confirmation = confirm('Are you sure you want to edit this project?');
      if (confirmation) {
        // Show edit form
        const project = document.getElementById(`project-${projectId}`);
        const title = project.querySelector('.card-title').innerText;
        const description = project.querySelector('.card-text').innerText;
        const category = project.querySelector('.card-category').innerText;

        document.getElementById('editProjectId').value = projectId;
        document.getElementById('editProjectTitle').value = title;
        document.getElementById('editProjectDescription').value = description;
        document.getElementById('editProjectCategory').value = category;
        $('#editProjectModal').modal('show');
      }
    } else {
      alert('Invalid UserId or Password');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while verifying the user.');
  });
}

function handleEditProject(event) {
  event.preventDefault();
  const projectId = document.getElementById('editProjectId').value;
  const projectTitle = document.getElementById('editProjectTitle').value;
  const projectDescription = document.getElementById('editProjectDescription').value;
  const projectCategory = document.getElementById('editProjectCategory').value;
  const userId = document.getElementById('editUserId').value;
  const password = document.getElementById('editPassword').value;

  fetch('/edit-project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ projectId, projectTitle, projectDescription, projectCategory, userId, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Project updated successfully') {
      alert('Project updated successfully');
      $('#editProjectModal').modal('hide');
      location.reload();
    } else {
      alert(data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while updating the project.');
  });
}
