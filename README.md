MedVibe - Gestão de Medicamentos Vibrante

O MedVibe é uma aplicação Full-Stack projetada para facilitar a vida de quem precisa gerenciar múltiplos medicamentos. Com uma interface inspirada em aplicações de alta performance, ele oferece segurança, beleza e funcionalidade.

🚀 Como Rodar o Projeto

Instalar Dependências:
No diretório raiz do projeto, execute:

npm install


Iniciar o Servidor:

npm start


Acessar o App:
Abra seu navegador em http://localhost:3000.

🛠 Tecnologias Utilizadas

Backend: Node.js com Express.

Banco de Dados: SQLite (via better-sqlite3) - Leve e sem necessidade de instalação de servidor DB.

Auth: JWT (JSON Web Tokens) e Bcrypt para hash de senhas.

Frontend: Vanilla JS com Tailwind CSS (CDN) para estilização ultra-rápida e moderna.

Gráficos: Chart.js para visualização de aderência.

📈 Sugestões de Melhorias Futuras

Notificações Push: Integrar com Web Push API para alertas reais no navegador/mobile.

Interações Medicamentosas: Integrar com uma API externa de saúde para alertar sobre perigos entre medicamentos cadastrados.

Scanner de Receita: Usar OCR (Tesseract.js) para ler fotos de receitas médicas.

Modo Offline: Implementar Service Workers para transformar em um PWA (Progressive Web App).
