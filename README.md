# MERN Learning Management System (LMS) Backend

A RESTful backend for a Learning Management System built with the MERN stack. It provides secure authentication, role-based authorization, course and lesson management, student enrollments, learning progress tracking, and course reviews.

## 🛠️ Technologies Used

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

## ✨ Features

### 🔐 Authentication and Authorization
- User registration and login.
- Secure password hashing using bcrypt.
- JWT-based authentication.
- Role-based access control for students, instructors, and administrators.
- Protected API routes.

### 📚 Course Management
- Create, read, update, and delete courses.
- Manage course titles, descriptions, categories, and difficulty levels.
- Publish courses for students.
- Browse and search available courses.
- Pagination and sorting support.

### 🎓 Lesson Management
- Organize lessons within courses.
- Manage lesson content and ordering.
- Restrict course management to authorized users.

### 📝 Student Enrollment
- Enroll in courses.
- View enrolled courses.
- Track completed lessons.
- Monitor course completion progress.

### ⭐ Reviews and Ratings
- Submit course reviews and ratings.
- Retrieve reviews for individual courses.
- Calculate average course ratings.

### 🛡️ Security and Error Handling
- Helmet security headers.
- CORS configuration.
- API rate limiting.
- Authentication and authorization middleware.
- Centralized error handling.

## 🏗️ Project Architecture

The application follows a modular Express.js architecture, separating routes, controllers, models, and middleware.

```text
mern-lms-backend/
├── src/
│   ├── config/          # Database and application configuration
│   ├── controllers/     # Request handling and business logic
│   ├── middleware/      # Authentication, roles, and error handling
│   ├── models/          # Mongoose database models
│   ├── routes/          # REST API routes
│   ├── app.js           # Express application setup
│   └── server.js        # Server entry point
├── .env.example         # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

*Note: The directory tree is illustrative. Adjust it to match the actual files in your repository.*

## ⚙️ Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (included with Node.js)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a MongoDB Atlas account
- Git
- Visual Studio Code or another code editor

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ajinkya029/mern-lms-backend.git
```

Navigate to the project directory:

```bash
cd mern-lms-backend
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root by copying `.env.example`.

On Windows Command Prompt:

```cmd
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Configure the variables in `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/mern_lms
JWT_SECRET=your_generated_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Important:** Generate a strong, random JWT secret locally. For example, run:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Replace `your_generated_random_secret` with the generated value.

Never commit your `.env` file or expose your JWT secret publicly.

If you're using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### 4. Start the Development Server

```bash
npm run dev
```

If the project includes a production start script, you can use:

```bash
npm start
```

### 5. Verify the Server

Open the following URL in your browser:

```text
http://localhost:5000/api/health
```

If the server and health route are configured correctly, you should receive a response similar to:

```json
{
  "status": "ok",
  "service": "mern-lms-api"
}
```

## 🔗 API Endpoints

All endpoints use the `/api` base path. Protected routes require a valid JWT access token.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a student account |
| POST | `/api/auth/login` | Authenticate a user |

### Courses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | Browse courses |
| POST | `/api/courses` | Create a course |
| GET | `/api/courses/:id` | Retrieve course details |
| PUT | `/api/courses/:id` | Update a course |
| DELETE | `/api/courses/:id` | Delete a course |

### Enrollments and Learning Progress

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/enrollments/:courseId` | Enroll in a course |
| GET | `/api/enrollments/mine` | View your enrollments |
| PUT | `/api/enrollments/:courseId/lessons/:lessonId/complete` | Mark a lesson as completed |

### Reviews

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses/:id/reviews` | Retrieve course reviews |

**Note:** The endpoint list above summarizes the documented API surface. Check the actual route files for additional endpoints, required roles, and request validation rules.

## 🧪 Testing the API

You can test endpoints using [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) in VS Code.

### Example: Register a Student

**Request**

```http
POST /api/auth/register
Content-Type: application/json
```

**Request body**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

Use the exact request fields expected by your registration controller.

### Example: Login

**Request**

```http
POST /api/auth/login
Content-Type: application/json
```

**Request body**

```json
{
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

Use the returned JWT as a bearer token when accessing protected routes:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Example: Browse Courses

```http
GET /api/courses
```

Use query parameters supported by the API for searching, filtering, sorting, or pagination.

## 🔒 Security Best Practices

- Store secrets and database credentials in environment variables.
- Never commit `.env` files to version control.
- Hash passwords instead of storing plain-text passwords.
- Validate and sanitize incoming request data.
- Apply authorization checks to protected resources.
- Use HTTPS in production.
- Configure CORS for trusted frontend origins.
- Use a unique, strong JWT secret in production.

## 🚧 Future Enhancements

Potential improvements for future versions include:

- Email verification and password reset.
- Video lesson hosting and streaming.
- Course payment integration.
- Quizzes, assignments, and assessments.
- Course completion certificates.
- Notifications and email alerts.
- Automated tests with Jest or Vitest and Supertest.
- API documentation with Swagger.
- Docker-based deployment.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a pull request.

## 📄 License

This project is available for educational and portfolio purposes. Add a `LICENSE` file to specify the terms under which others may use, modify, and distribute the code.

## 👨‍💻 Author

**Ajinkya Dhatrak**

GitHub: [@ajinkya029](https://github.com/ajinkya029)

---

⭐ If you find this project useful, consider giving it a star on GitHub.
