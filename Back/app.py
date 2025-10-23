from flask import Flask, render_template, request, jsonify
import os
import sys
from werkzeug.utils import secure_filename

# Добавляем путь к папке Back для импорта neura_main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from neura_main import MultiLanguageRecognizer

# Пути к файлам
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONT_DIR = os.path.join(BASE_DIR, 'Front', 'srs')
TEMPLATES_DIR = os.path.join(FRONT_DIR, 'templates')
STATIC_DIR = os.path.join(FRONT_DIR, 'static')
UPLOADS_DIR = os.path.join(STATIC_DIR, 'uploads')
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'multilang_model.pkl')

app = Flask(__name__, 
            template_folder=TEMPLATES_DIR,
            static_folder=STATIC_DIR)

app.config['UPLOAD_FOLDER'] = UPLOADS_DIR
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Создаем папки если нет
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

# Инициализируем распознаватель
recognizer = MultiLanguageRecognizer(MODEL_PATH)

# Разрешенные расширения файлов
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'tiff'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'Файл не выбран'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Файл не выбран'})
        
        if file and allowed_file(file.filename):
            # Сохраняем файл
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Распознаем символы
            predictions, confidences, recognized_text = recognizer.recognize_characters(filepath)
            
            if recognized_text is None:
                return jsonify({'success': False, 'error': 'Не удалось распознать символы на изображении'})
            
            return jsonify({
                'success': True,
                'recognized_text': recognized_text,
                'filename': filename
            })
        
        return jsonify({'success': False, 'error': 'Неподдерживаемый формат файла'})
    
    except Exception as e:
        return jsonify({'success': False, 'error': f'Ошибка обработки: {str(e)}'})

@app.route('/model_status')
def model_status():
    status = "обучена" if recognizer.is_trained else "не обучена"
    return jsonify({
        'trained': recognizer.is_trained,
        'status': status
    })

if __name__ == '__main__':
    # Пытаемся загрузить существующую модель
    if os.path.exists(MODEL_PATH):
        print("Загружаем существующую модель...")
        recognizer.load_model()
        print("Модель успешно загружена!")
    else:
        print("ОШИБКА: Модель multilang_model.pkl не найдена!")
        print("Сначала обучите модель на компьютере:")
        print("cd Back && python neura_main.py")
    
    print(f"Запуск сервера...")
    print(f"Шаблоны: {TEMPLATES_DIR}")
    print(f"Статика: {STATIC_DIR}")
    app.run(debug=True, host='0.0.0.0', port=5000)