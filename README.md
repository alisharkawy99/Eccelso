# 🏎️ Eccelso Web

A high-performance, full-stack automotive showcase platform built to power and extend the digital presence of the **Eccelso Instagram Page**. This platform acts as a dedicated web inventory and customer funnel, bridging highly engaging social media content with a structured, lightning-fast web experience.

---

## 🛠️ Tech Stack

### 🎨 Frontend (Next.js / React)
* **Framework:** React with [Next.js](https://nextjs.org) (App Router) for high-performance Server-Side Rendering (SSR) and optimized SEO.
* **Styling:** [Tailwind CSS](https://tailwindcss.com) for a sleek, responsive, mobile-first design.
* **UI Components:** [Shadcn UI](https://shadcn.com) for a premium, accessible visual interface.

### ⚙️ Backend (FastAPI)
* **Framework:** [FastAPI](https://tiangolo.com) for high-speed, asynchronous Python API performance.
* **Documentation:** Automatic, interactive documentation via Swagger UI (`/docs`).
* **Database Management:** SQLModel / SQLAlchemy for safe, structured data modeling.

---

## 🚀 Key Features

* **Instagram Sync:** Seamless visual mapping to display detailed car specifications for social media posts.
* **Dynamic Inventory UI:** High-fidelity car catalog featuring multi-tiered advanced filtering (Brand, Year, Price, Specs).
* **Speed & Performance:** Instantaneous search capabilities and optimized image processing.
* **Admin Control Center:** Streamlined dashboard for rapid vehicle uploads, media handling, and client inquiry tracking.

---

## 🏁 Getting Started

Follow these steps to run both the frontend and backend microservices locally on your machine.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com
cd Eccelso
```

### 2️⃣ Backend Setup (FastAPI)
Open a new terminal and navigate to the backend directory:
```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn main:app --reload
```
*The API backend will now be live at:* `http://127.0.0.1:8000`  
*Interactive documentation will be available at:* `http://127.0.0`

### 3️⃣ Frontend Setup (Next.js)
Open a second terminal and navigate to the frontend directory:
```bash
cd frontend

# Install Node modules
npm install

# Start the development server
npm run dev
```
*The web platform will now be running at:* `http://localhost:3000`

---

## 📁 Repository Directory Structure

```text
Eccelso/
│
├── frontend/             # Next.js / React project application
│   ├── src/              # App routing, UI components, and pages
│   ├── public/           # Static assets, logos, and global imagery
│   └── package.json      # Node configurations and dependencies
│
└── backend/              # FastAPI application
    ├── app/              # Router paths, business logic, and schemas
    ├── main.py           # Core FastAPI entry point
    └── requirements.txt  # Python packages and project requirements
```
