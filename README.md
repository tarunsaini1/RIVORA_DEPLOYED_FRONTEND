# 🚀 RIVORA Frontend

**RIVORA** is a *collaborative project management platform* designed with a rich frontend experience using **React**, **Vite**, and **Tailwind CSS**. This is the deployed frontend codebase for the application.

---
## 📁 Project Structure

```bash
RIVORA_DEPLOYED_FRONTEND-main/
├── public/                   # Static assets
├── src/                      # Application source code
│   ├── component/            # Reusable components (Login, Calendar, Notification, etc.)
│   ├── Pages/                # Page-level components (Profile, WorkSpace, etc.)
│   ├── context/              # Context providers (e.g., authContext)
│   ├── App.jsx               # Main routing and layout
│   └── ...
├── .env                      # Environment variables
├── package.json              # Project metadata and dependencies
├── tailwind.config.js        # Tailwind configuration
├── vite.config.js            # Vite bundler config
└── README.md                 # You're reading it!



---

## ⚙️ Technologies Used

- ⚛️ **React 19**
- ⚡️ **Vite** – Lightning-fast frontend build tool
- 🎨 **Tailwind CSS** – Utility-first styling
- 🔁 **React Router DOM** – Client-side routing
- 🔄 **React Query (@tanstack/react-query)** – Server state management
- 📡 **Socket.IO** – Real-time collaboration
- 🎞️ **Framer Motion** – Animations
- ☁️ **Cloudinary**, **Multer** – Media handling
- 📈 **Chart.js** + **react-chartjs-2** – Data visualization
- 🔔 **React Toastify** – Toast notifications
- 💅 **Styled Components**
- 🧊 **Three.js** – 3D rendering support

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

git clone https://github.com/your-username/rivora-frontend.git
cd rivora-frontend


### 2. Install Dependencies

npm install



### 3. Create Environment Variables

Create a `.env` file in the root directory:

`VITE_BACKEND_URL=https://your-backend-api-url.com`



### 4. Start Development Server

npm run dev



### 5. Build for Production

npm run build


### 6. Preview Production Build

npm run preview



---

## 🔐 Authentication & Authorization

- `AuthProvider` for authentication context
- `ProtectedProjectRoutes` for restricting project access

**Includes:**

- Login
- Forgot Password / Reset Password
- Email Verification

---

## 🔄 Application Flow

#### 🔸 Login Flow
- `/` → `LoginPage.jsx`
- If authenticated → Redirects to `/dashboard`

#### 🔸 Protected Routes

| Route                     | Description                             |
|--------------------------|-----------------------------------------|
| `/dashboard`             | Main user dashboard                     |
| `/profile`               | View/Edit user profile                  |
| `/calender`              | Calendar-based task/project view        |
| `/linkups`               | Third-party integrations                |
| `/project/:projectId/*`  | Project-specific workspace              |
| `/teamBuilder`           | Team creation interface                 |
| `/team`                  | View & manage team invites              |
| `/teams/:teamId`         | Manage a specific team                  |
| `/notification`          | Real-time collaboration alerts          |

---

## 📦 Available Scripts

npm run dev # Start development server
npm run build # Generate production build
npm run preview # Preview built app locally
npm run lint # Run ESLint on codebase

text

---

## ✨ Features

- 🔐 Auth-protected dashboards and pages
- 👥 Team invitation and collaboration tools
- 📅 Calendar-based task and project management
- 📊 Dynamic dashboard with Chart.js visualizations
- 🔔 Real-time toast notifications
- 🔗 External integrations via LinkUps
- 🧩 Modular and reusable component design
- ⚙️ Vercel deployment ready (`vercel.json` included)

---

## 🌐 Deployment (Vercel Ready)

To deploy this app to **Vercel**:

