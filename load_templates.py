import os
import psycopg2
from sentence_transformers import SentenceTransformer


TEMPLATES_DIR = r"C:\Users\кіра\Desktop\temples"

DB_CONFIG = {
    "dbname": "brandpaint_db",
    "user": "postgres",
    "password": "wa45ltk",
    "host": "localhost",
    "port": 5432
}


model = SentenceTransformer("all-MiniLM-L6-v2")



def parse_description(path):
    data = {
        "name": None,
        "category": None,
        "keywords": None,
        "full_text": ""
    }

    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for line in lines:
        if line.startswith("Name:"):
            data["name"] = line.replace("Name:", "").strip()
        elif line.startswith("Category:"):
            data["category"] = line.replace("Category:", "").strip()
        elif line.startswith("Keywords:"):
            data["keywords"] = line.replace("Keywords:", "").strip()

    data["full_text"] = "".join(lines)
    return data


def read_file(path):
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return f.read()



conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

for folder in os.listdir(TEMPLATES_DIR):
    folder_path = os.path.join(TEMPLATES_DIR, folder)
    if not os.path.isdir(folder_path):
        continue

    desc_path = os.path.join(folder_path, "description.txt")
    html_path = os.path.join(folder_path, "index.html")
    css_path = os.path.join(folder_path, "style.css")

    if not os.path.exists(desc_path) or not os.path.exists(html_path):
        print(f" Пропущено {folder}")
        continue

    desc = parse_description(desc_path)
    html = read_file(html_path)
    css = read_file(css_path)


    embedding_text = f"""
    Name: {desc['name']}
    Category: {desc['category']}
    Keywords: {desc['keywords']}
    {desc['full_text']}
    """

    embedding = model.encode(embedding_text).tolist()

    cur.execute("""
        INSERT INTO templates
        (name, category, keywords, embedding, html_content, css_content)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        desc["name"],
        desc["category"],
        desc["keywords"],
        embedding,
        html,
        css
    ))

    print(f" Додано: {desc['name']}")

conn.commit()
cur.close()
conn.close()

print(" Усі шаблони завантажено")
