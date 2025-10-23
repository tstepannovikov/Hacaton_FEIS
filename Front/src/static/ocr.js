const dropZone = document.querySelector('.image_field');
const fileInput = document.querySelector('.file-input');
const fileName = document.querySelector('.file-name');
const chooseBtn = document.querySelector('.search_pc_button');
const imageField = document.querySelector('.image_field');
const imageIcon = document.querySelector('.image_icon');
const recognizeBtn = document.querySelector('.start_button');
const resultField = document.querySelector('.result_text_field');
const resultText = document.querySelector('.result_text');

// Обработчики для выбора файла
chooseBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

// Обработчики drag and drop
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
    fileInput.files = e.dataTransfer.files; // Важно: обновляем file input
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
        img.style.maxHeight = '100%';
        img.style.borderRadius = '10px';
        img.style.display = 'block';
        img.style.margin = 'auto';
        img.alt = 'Предпросмотр изображения';

        // Очищаем поле и добавляем изображение
        imageField.innerHTML = '';
        imageField.appendChild(img);

        fileName.textContent = `Выбран файл: ${file.name}`;
        
        // Скрываем результат предыдущего распознавания
        resultField.id = 'hidden';
        resultText.textContent = '';
    };
    reader.readAsDataURL(file);
}

// Обработчик распознавания
recognizeBtn.addEventListener('click', function() {
    if (!fileInput.files.length) {
        alert('Пожалуйста, сначала выберите файл');
        return;
    }

    // Показываем загрузку
    recognizeBtn.textContent = 'Обработка...';
    recognizeBtn.disabled = true;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        recognizeBtn.textContent = 'Распознать текст';
        recognizeBtn.disabled = false;

        if (data.success) {
            resultText.textContent = data.recognized_text;
            resultField.id = 'visible';
        } else {
            alert('Ошибка: ' + data.error);
        }
    })
    .catch(error => {
        recognizeBtn.textContent = 'Распознать текст';
        recognizeBtn.disabled = false;
        alert('Ошибка сети: ' + error.message);
    });
});

// Проверяем статус модели при загрузке
document.addEventListener('DOMContentLoaded', function() {
    checkModelStatus();
});

function checkModelStatus() {
    fetch('/model_status')
        .then(response => response.json())
        .then(data => {
            if (!data.trained) {
                console.warn('Модель не обучена! Сначала обучите модель на компьютере.');
                // Можно показать уведомление, но не alert чтобы не раздражать
                fileName.textContent = 'ВНИМАНИЕ: Модель не обучена! Сначала обучите модель.';
            }
        })
        .catch(error => {
            console.error('Ошибка проверки статуса модели:', error);
        });
}