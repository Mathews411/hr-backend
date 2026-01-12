pipeline {
    agent any

    environment {
        APP_NAME = "hr-backend"
        DOCKER_IMAGE = "nest-backend"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo "📥 Pulling latest code from Git"
                git branch: 'main',
                    url: 'https://github.com/<your-org-or-username>/<your-repo>.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐳 Building Docker image"
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                echo "🚀 Starting backend & database containers"
                sh 'docker compose up -d'
            }
        }

        stage('Wait for Database') {
            steps {
                echo "⏳ Waiting for Postgres to be ready"
                sh 'sleep 10'
            }
        }

        stage('Run Prisma Migrations') {
            steps {
                echo "🗄️ Running Prisma migrations"
                sh 'docker compose exec -T backend npx prisma migrate deploy'
            }
        }

        stage('Restart Backend') {
            steps {
                echo "🔄 Restarting backend service"
                sh 'docker compose restart backend'
            }
        }

        stage('Verify Application') {
            steps {
                echo "✅ Verifying running containers"
                sh 'docker compose ps'
            }
        }
    }

    post {
        success {
            echo "🎉 Deployment completed successfully!"
        }
        failure {
            echo "❌ Deployment failed. Check logs."
        }
    }
}

