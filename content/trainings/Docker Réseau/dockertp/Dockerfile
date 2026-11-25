FROM python:3.12-slim
 
WORKDIR /app
 
# 1. Copier uniquement la liste des dépendances en premier
COPY requirements.txt .
 
# 2. Installer les dépendances sans conserver le cache de téléchargement pip
RUN pip install --no-cache-dir -r requirements.txt
 
# 3. Copier le code applicatif en dernier
COPY app.py .
 
EXPOSE 5000
 
CMD ["python", "app.py"]