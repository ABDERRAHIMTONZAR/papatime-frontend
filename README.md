# ⏱ PapaTime

> Outil de suivi du temps de travail interne pour Papa in Shape — permet aux équipes de tracker leur temps sur les projets et tâches en temps réel.

🔗 **Live Demo** : [papatime-frontend.vercel.app](https://papatime-frontend.vercel.app)

## 🔐 Comptes Demo

| Rôle | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@gmail.com | SuperAdmin2025! |
| Admin | admin1@gmail.com | Admin2025! |
| Employee | employe1@gmail.com | Employee2025! |

## ✨ Fonctionnalités

- ⏱ **Timer** start/stop en temps réel
- 👥 **Multi-user** : Super Admin / Admin / Employee
- 📁 **Projets & Tâches** assignés par équipe
- 🤖 **Rapport IA** (Groq LLM) — analyse intelligente des projets
- 📊 **Dashboard** stats temps réel
- 🔗 **Invitations** par code — onboarding simplifié
- 📥 **Export CSV** des time entries
- 📱 **Responsive** mobile

## 🏗 Architecture
SUPER ADMIN → crée équipes + admins
ADMIN → crée projets + tâches + invite membres
EMPLOYEE → enregistre son temps sur ses tâches


## 🛠 Stack Technique

| Couche | Tech |
|--------|------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Base de données | PostgreSQL (Supabase) |
| ORM | Prisma 7 |
| IA | Groq LLM |
| Auth | JWT + bcrypt |
| Deploy | Vercel |

## 🚀 Installation locale

```bash
# Backend
cd papatime-backend
npm install
npm run dev

# Frontend  
cd papatime-frontend
npm install
npm run dev
```

## 👨‍💻 Développé par

**Abderrahim Tonzar** — [GitHub](https://github.com/ABDERRAHIMTONZAR) · [LinkedIn](https://linkedin.com/in/abderrahim-tonzar-11825230b)