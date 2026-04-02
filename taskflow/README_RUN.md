<!-- # TaskFlow Run Commands

## 1. Start Postgres and Hasura
```bash
cd ~/Desktop/Projects/taskflow
docker compose up -d --build
```

## 2. Start backend
```bash
cd ~/Desktop/Projects/taskflow/backend
npm run dev
```

## 3. Start frontend
```bash
cd ~/Desktop/Projects/taskflow
npm run dev
```

## 4. Apply Hasura changes only if you changed migrations or metadata
```bash
cd ~/Desktop/Projects/taskflow/backend
hasura migrate apply
hasura metadata apply
hasura metadata reload
```

## 5. Optional AWS check for OTP email flow
```bash
aws sts get-caller-identity
```

## URLs
- Frontend: http://localhost:5173
- Hasura: http://localhost:8082
- Backend: http://localhost:4000 -->
