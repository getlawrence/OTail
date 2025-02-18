resource "aws_ecs_cluster" "main" {
  name = "otail-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# ECS Task execution role
resource "aws_iam_role" "ecs_task_execution" {
  name = "otail-${var.environment}-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Backend Task Definition
resource "aws_ecs_task_definition" "backend" {
  family                   = "otail-${var.environment}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "your-ecr-repo/otail-backend:latest" # Replace with your ECR repo
      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        },
        {
          containerPort = 4320
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "GO_ENV"
          value = var.environment
        }
      ]
      secrets = [
        {
          name      = "MONGODB_URI"
          valueFrom = "${aws_secretsmanager_secret.database_credentials.arn}:mongodb_uri::"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/otail-${var.environment}-backend"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}
