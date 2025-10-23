const dropZone = document.querySelector('.image_field');
const fileInput = document.querySelector('.file-input');
const fileName = document.querySelector('.file-name');
const chooseBtn = document.querySelector('.search_pc_button');
const imageField = document.querySelector('.image_field');
const imageIcon = document.querySelector('.image_icon');

chooseBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  handleFile(file);
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('hover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('hover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('hover');
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

function handleFile(file) {
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    fileName.textContent = 'Пожалуйста, выберите файл изображения!';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.createElement('img');
    img.src = e.target.result;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '300px';
    img.style.borderRadius = '10px';
    img.style.display = 'block';
    img.style.margin = 'auto';
    img.alt = 'Предпросмотр изображения';

    imageField.innerHTML = '';
    imageField.appendChild(img);

    fileName.textContent = `Выбран файл: ${file.name}`;
  };
  reader.readAsDataURL(file);
}
