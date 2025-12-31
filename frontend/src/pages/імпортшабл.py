import os
import psycopg2
import json
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
import re

# -------------------
# Параметри БД
# -------------------
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "brandpaint_db"
DB_USER = "postgres"
DB_PASSWORD = "wa45ltk"

# -------------------
# Папка шаблонів
# -------------------
TEMPLATES_DIR = r"C:\Users\кіра\Desktop\temples"

# -------------------
# Підключення до БД
# -------------------
conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD
)
cur = conn.cursor()
print(" База даних підключена")

# -------------------
# AI модель
# -------------------
print(" Завантаження моделі...")
model = SentenceTransformer("all-MiniLM-L6-v2")

def parse_description(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    name = re.search(r"Name:\s*(.*)", content)
    category = re.search(r"Category:\s*(.*)", content)
    keywords = re.search(r"Keywords:\s*(.*)", content)

    return {
        "name": name.group(1).strip() if name else None,
        "category": category.group(1).strip().lower() if category else None,
        "keywords": keywords.group(1).strip() if keywords else "",
        "text": content
    }

# -------------------
# Основний цикл
# -------------------
count = 0

for folder in tqdm(os.listdir(TEMPLATES_DIR)):
    folder_path = os.path.join(TEMPLATES_DIR, folder)
    if not os.path.isdir(folder_path):
        continue

    desc_path = os.path.join(folder_path, "description.txt")
    html_path = os.path.join(folder_path, "index.html")
    css_path = os.path.join(folder_path, "style.css")

    if not (os.path.exists(desc_path) and os.path.exists(html_path)):
        continue

    meta = parse_description(desc_path)

    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    css = ""
    if os.path.exists(css_path):
        with open(css_path, "r", encoding="utf-8") as f:
            css = f.read()

    # Текст для embeddings
    embedding_text = f"{meta['text']} {meta['keywords']}"
    embedding = model.encode(embedding_text).tolist()
    embedding_json = json.dumps(embedding)

    try:
        cur.execute("""
            INSERT INTO templates (name, category, keywords, embedding, html_content, css_content)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            meta["name"] or folder,
            meta["category"],
            meta["keywords"],
            embedding_json,
            html,
            css
        ))
        conn.commit()
        count += 1
    except Exception as e:
        print(f" Помилка ({folder}):", e)
        conn.rollback()

cur.close()
conn.close()
print(f" Завантажено шаблонів: {count}")
