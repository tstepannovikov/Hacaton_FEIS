const imageField = document.querySelector('.image_field');
const resultTextField = document.querySelector('.result_text_field');

imageField.addEventListener("dragover", (e) => {
  e.preventDefault();
  imageField.classList.add("hover");
});

imageField.addEventListener("dragleave", () => {
  imageField.classList.remove("hover");
});

imageField.addEventListener("drop", (e) => {
  e.preventDefault();
  imageField.classList.remove("hover");
  const file = e.dataTransfer.files[0];

  if (file && file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    output.innerHTML = "";
    output.appendChild(img);
    } else {
    output.textContent = "Пожалуйста, перетащи изображение, а не другой файл!";
  }
});